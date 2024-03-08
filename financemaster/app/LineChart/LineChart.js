import React from "react";
import { Line } from "react-chartjs-2";
import './LineChart.css'
import Chart from "chart.js/auto";
import { CategoryScale } from "chart.js";
import moment from "moment";

Chart.register(CategoryScale);

const PAYE_FLO = "Paie/Payroll"
const PAYE_JESS = "Iucpq Ul"

class LineChart extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            totalAverageBalance : 0
        }
    }

    populateMonths(payments) {
        var monthsTab = new Map()
        payments.forEach(payment => {
            let date = moment(payment.date).format("YYYY-MM")
            if(!monthsTab.has(date)){
                monthsTab.set(date, {displayableDate: moment(payment.date).format("MMM YYYY"),paye_flo: 0, paye_jess: 0, balance: 0, solde: 0})
            }
            // copy item
            var temp = Object.assign({}, monthsTab.get(date));

            // balance
            temp.balance += payment.amount

            // paye flo
            if(payment.description === PAYE_FLO){
                temp.paye_flo += payment.amount
            }

            // paye jess
            if(payment.description === PAYE_JESS){
                temp.paye_jess += payment.amount
            }
            monthsTab.set(date, temp)
        });

        // sort
        monthsTab = new Map([...monthsTab.entries()].sort());

        // solde
        var totalSolde = 0
        monthsTab.forEach((value, date) => {
            var temp = Object.assign({}, monthsTab.get(date));
            totalSolde += temp.balance
            temp.solde = totalSolde
            monthsTab.set(date, temp)
        })
        console.log("[populateMonths] - sortie ", monthsTab)
        return monthsTab
    }

    populateYears(months) {
        var yearsTab = new Map()
        months.forEach((value, key) => {
           let date = moment(key).year()
           if(!yearsTab.has(date)){
                yearsTab.set(date, {displayableDate: date, averageBalance: 0, balances: []})
            }

            // copy item
            var temp = Object.assign({}, yearsTab.get(date));

            temp.balances.push(value.balance)

            yearsTab.set(date, temp)
        })

        // sort
        yearsTab = new Map([...yearsTab.entries()].sort());
        
        var totalAverageBalance = 0
        var nbMonths = 0
        yearsTab.forEach((value, date) => {
            var temp = Object.assign({}, yearsTab.get(date));
            temp.averageBalance = temp.balances.reduce((finalResult, balance) => finalResult + balance, 0) / temp.balances.length
            yearsTab.set(date, temp)
            totalAverageBalance += temp.balances.reduce((finalResult, balance) => finalResult + balance, 0)
            nbMonths += temp.balances.length
        })

        var final = totalAverageBalance / nbMonths
        yearsTab.set('total', {displayableDate: 'Total', averageBalance: final, balances: []})
       
        
        console.log("[populateYears] - sortie ", yearsTab)
        return yearsTab
    }

    getColor(ctx){
        if(ctx.tick.value == 0){
            return 'black'
        }
        return '#80808030'
    }

    getLine(ctx){
        if(ctx.tick.value == 0){
            return 2
        }
        return 1
    }


    render() {
        var data = this.populateMonths(this.props.payments)
        let chartData = {
            labels: Array.from(data.values().map(month => month.displayableDate)),
            datasets: [
                {
                    label: 'Balance',
                    data: Array.from(data.values().map(month => month.balance)),
                    borderColor: '#FFA500a1',
                    backgroundColor: '#FFA50079',
                    borderWidth: 2,
                    tension: 0.25,
                },
                {
                    label: 'Paye Flo',
                    data: Array.from(data.values().map(month => month.paye_flo)),
                    borderColor: '#3ab5f2a1',
                    backgroundColor: '#3ab5f279',
                    borderWidth: 2,
                    tension: 0.25,
                    pointBackgroundColor: 'black'
                },
                {
                    label: 'Paye Jess',
                    data: Array.from(data.values().map(month => month.paye_jess)),
                    borderColor: '#f23aaba1',
                    backgroundColor: '#f23aab79',
                    borderWidth: 2,
                    tension: 0.25
                },
                {
                    label: 'Solde',
                    data: Array.from(data.values().map(month => month.solde)),
                    borderColor: '#FFD700a1',
                    backgroundColor: '#FFD70079',
                    borderWidth: 2,
                    tension: 0.25,
                    pointBorderColor: 'black',
                    borderDash: [2.5],
                }
        ]  
        }
        var yearsTab = this.populateYears(data)
        return (
            <div className="flex justify-stretch border shadow-md sm:rounded-lg p-2">
                <div className="basis-10/12">
                    <Line
                        data={chartData}
                        options={
                        {
                            responsive: true,
                            plugins: {
                                legend: {
                                    display: true,
                                    labels: {
                                        font: {
                                            weight: 'lighter',
                                            family: "news",
                                            size: 16
                                        }
                                    }
                                }
                            },
                            layout: {
                                padding: 0
                            },
                            scales: {
                                x: {
                                grid: {
                                    display: false,
                                }
                                },
                                y: {
                                    grid: {
                                        color: this.getColor,
                                        lineWidth: this.getLine,
                                        z: 2
                                    }
                                }
                            }
                        }
                    }
                    />
                </div> 
                <div className="basis-2/12">
                    <table className="w-full text-xs text-left rtl:text-right text-gray-500 dark:text-gray-400 border">
                        <thead className="text-xs text-gray-700 bg-red-200 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-2 py-3 w-1.5">Year</th>
                                <th scope="col" className="px-2 py-3 w-3.5">Balance average</th>
                            </tr>
                        </thead>
                        <tbody className="shadow-md h-full">
                            {Array.from(yearsTab.values()).map((value, index) => {
                                return (
                                    <tr key={index} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                        <td className="px-2 w-1.5">{value.displayableDate}</td>
                                        <td className="px-2 w-3.5">{value.averageBalance.toFixed(2) + '$'}</td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        )
    }
}

export default LineChart