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
    }

    populateMonths(payments) {
        var monthsTab = new Map()
        var solde = 0
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

            // solde
            solde += payment.amount
            temp.solde = solde

            monthsTab.set(date, temp)

        });
        monthsTab = new Map([...monthsTab.entries()].sort());
        console.log("[populateMonths] - sortie ", monthsTab)
        return monthsTab
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
        return (
            <div className="chart-container">
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
                            padding: 50
                        },
                        scales: {
                            x: {
                              grid: {
                                display: false,
                              }
                            },
                        }
                    }
                }
                />
            </div>
        )
    }
}

export default LineChart