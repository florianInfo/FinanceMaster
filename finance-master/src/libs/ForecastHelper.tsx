import dayjs from 'dayjs';
import type { Transaction } from '@/types/Transaction';
import _groupBy from 'lodash.groupby';
import utc from 'dayjs/plugin/utc'
import { ForecastPoint } from '@/types/ForecastPoint';
dayjs.extend(utc)


export function generateForecastTimeline(
    charges: Charge[],
    fromDate: string,
    toDate: string,
    initialSolde = 0
  ): ForecastPoint[] {
    const points: ForecastPoint[] = []
  
    let current = dayjs.utc(fromDate).startOf('month')
    const end = dayjs.utc(toDate).endOf('month')
    let solde = initialSolde
  
    while (current.isBefore(end)) {
      const alreadyCountedTx = new Set<string>()
      const dateKey = current.format('YYYY-MM')
      let revenus = 0
      let depenses = 0
  
      for (const charge of charges) {
        const start = dayjs.utc(charge.startDate).startOf('month')
        if (start.isAfter(current)) continue
  
        const isDueThisMonth =
          charge.frequency === 'monthly' ||
          (charge.frequency === 'annually' && current.month() === start.month()) ||
          (charge.frequency === 'once' && start.isSame(current, 'month'))
  
        if (!isDueThisMonth) continue
  
        // 🔒 Ne pas compter 2 fois une transaction liée à plusieurs charges
        const uncapturedTx = charge.transactions.filter(tx => !alreadyCountedTx.has(tx.id))
        if (uncapturedTx.length === 0) continue
  
        // Marquer toutes les transactions utilisées
        for (const tx of uncapturedTx) {
          alreadyCountedTx.add(tx.id)
        }
  
        if (charge.type === 'credit') {
          revenus += charge.amount
        } else {
          depenses += charge.amount
        }
      }
  
      depenses = Math.round(depenses * 100) / 100
      revenus = Math.round(revenus * 100) / 100
      const balance = revenus - Math.abs(depenses)
      solde += balance
  
      points.push({
        date: dateKey,
        revenus,
        depenses,
        balance,
        solde: Math.round(solde * 100) / 100
      })
  
      current = current.add(1, 'month')
    }
  
    return points
  }
  



// GENERATE CHARGE
export type ChargeType = 'credit' | 'debit';
export type ChargeFrequency = 'once' | 'monthly' | 'annually';
export interface Charge {
  category: string;
  type: ChargeType;
  frequency: ChargeFrequency;
  amount: number;
  startDate: string;
  transactions: Transaction[]
}



function getAverageAnnualAmount(txs: Transaction[]): number {
  const yearlyGroups = _groupBy(txs, t => dayjs.utc(t.date).format('YYYY'));
  const yearlyTotals = Object.values(yearlyGroups).map(group =>
    group.reduce((sum, t) => sum + Math.abs(t.amount), 0)
  );
  return Math.round(getRepresentativeAmount(yearlyTotals) * 100) / 100;
}

function getAverageMonthlyAmount(txs: Transaction[], startDate : string, nbMonths: number): number {
    const monthKeys = Array.from({ length: nbMonths }, (_, i) =>
      dayjs.utc(startDate).subtract(i, 'month').format('YYYY-MM')
    ).reverse(); // du plus ancien au plus récent
  
    const grouped = _groupBy(txs, t => dayjs.utc(t.date).format('YYYY-MM'));
  
    const monthlyTotals = monthKeys.map(month =>
      grouped[month]
        ? grouped[month].reduce((sum, t) => sum + Math.abs(t.amount), 0)
        : 0
    );
  
    const sum = monthlyTotals.reduce((a, b) => a + b, 0);
    return Math.round((sum / 12) * 100) / 100;
} 

function getVariance(values: number[]): number {
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  return values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
}

function getRepresentativeAmount(values: number[]): number {
  const variance = getVariance(values);
  if (variance > 50) {
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid];
  } else {
    return values.reduce((a, b) => a + b, 0) / values.length;
  }
}

function isMonthlyCharge(dates: string[], amounts: number[]): boolean {
  if (dates.length < 6) return false;

  const months = new Set(dates.map(d => dayjs.utc(d).format('YYYY-MM')));
  if (months.size < 10) return false;

  const dayOfMonth = dates.map(d => dayjs.utc(d).date());
  const avgDay = dayOfMonth.reduce((a, b) => a + b, 0) / dayOfMonth.length;
  const varianceDay = getVariance(dayOfMonth);
  const isDayStable = varianceDay < 10;

  const varianceAmount = getVariance(amounts);
  const isAmountStable = varianceAmount < 100;

  return isDayStable && isAmountStable;
}

function isStatisticallyMonthly(dates: string[]): boolean {
    const months = new Set(dates.map(d => dayjs.utc(d).format('YYYY-MM')));
    return months.size >= 10; // présent dans 10 mois différents
}

export function getAverageDate(dates: string[]): string {
  if (dates.length === 0) {
    return dayjs().startOf('month').format('YYYY-MM-DD')
  }

  const timestamps = dates.map(d => dayjs.utc(d).valueOf())
  const avgTimestamp = Math.round(timestamps.reduce((a, b) => a + b, 0) / dates.length)

  return dayjs.utc(avgTimestamp).format('YYYY-MM-DD')
}

/**
 * 
 * @param transactions 
 * @param fromDate 
 * @param observationMonths 
 * @returns 
 */  
export function detectRecurringCharges(
  transactions: Transaction[],
  fromDate: string,
  observationMonths = 12
): Charge[] {
  const endDate = dayjs.utc(fromDate)
  const startDate = dayjs.utc(fromDate).subtract(observationMonths, 'month');

  const grouped: Record<string, Transaction[]> = {};

  for (const tx of transactions) {
    const categories = tx.categories?.length ? tx.categories : ['Autre']
    for (const cat of categories) {
      if (!grouped[cat]) grouped[cat] = []
      grouped[cat].push(tx)
    }
  }

  const charges: Charge[] = [];

  for (const [category, txs] of Object.entries(grouped)) {

    const allDates = txs.map(t => t.date);
    const values = txs.map(t => Math.abs(t.amount));
    const monthsSet = new Set(allDates.map(d => dayjs(d).format('YYYY-MM')));

    let frequency: ChargeFrequency = 'once';

    if (isMonthlyCharge(allDates, values)) {
    frequency = 'monthly'; // stable
    } else if (isStatisticallyMonthly(allDates)) {
    frequency = 'monthly'; // irrégulier mais fréquent
    } else if (monthsSet.size >= 2) {
    frequency = 'annually';
    }

    const recentTx = txs.filter(t => dayjs.utc(t.date).isAfter(startDate) && dayjs.utc(t.date).isBefore(endDate));

    if (recentTx.length === 0) continue;

    const recentValues = recentTx.map(t => Math.abs(t.amount));

    const type: ChargeType = recentTx.some(t => t.amount < 0) ? 'debit' : 'credit';

    let chargeDate = getAverageDate(recentTx.map(tx => tx.date))
    let amount = Math.round(getRepresentativeAmount(recentValues) * 100) / 100;
    if (frequency === 'monthly') {
    amount = getAverageMonthlyAmount(recentTx, fromDate, observationMonths);
    } else if (frequency === 'annually') {
    amount = getAverageAnnualAmount(recentTx);

    }

    amount = type == 'debit' ? -amount: amount
    charges.push({
      category,
      type,
      frequency,
      amount,
      startDate: chargeDate,
      transactions: recentTx.sort((a, b) => dayjs.utc(a.date).isAfter(b.date) ? -1 : 1)
    });
  }

  return charges;
}
