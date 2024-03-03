import React from "react";
import moment from "moment";
import './PaymentsTab.css'

class PaymentsTab extends React.Component {
    constructor(props){
        super(props)
        this.state = {payments: this.props.payments, nbPerPage : 5, currentPage: 1}
    }

    changePage(page) {
        console.log('[changePage] entrée - ', page)
        this.setState({currentPage: page})
    }

    render() {
        return (
            <div className="relative overflow-x-auto shadow-md sm:rounded-lg my-2">
                <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400 border-x-red-200">
                    <thead className="text-xs text-gray-700 uppercase bg-red-200 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">Date</th>
                            <th scope="col" className="px-6 py-3">Category</th>
                            <th scope="col" className="px-6 py-3">Description</th>
                            <th scope="col" className="px-6 py-3">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.props.payments.slice((this.state.currentPage-1) * this.state.nbPerPage, (this.state.currentPage) * this.state.nbPerPage).map((payment, index) => {
                            return (
                                <tr key={index} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                    <td className="px-6 py-4">{moment(payment.date).format("DD/MM/YYYY")}</td>
                                    <td className="px-6 py-4">{payment.categories[0]}</td>
                                    <td className="px-6 py-4">{payment.description}</td>
                                    <td className="px-6 py-4 underline">{payment.amount > 0 ? "+" + payment.amount.toFixed(2): payment.amount.toFixed(2)}</td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
                <div>
                    <p className="border-2 border-red-200 text-right">{'Balance ' + this.props.payments.reduce((finalResult, payment) => finalResult + payment.amount, 0).toFixed(2) + '$'}</p>
                    <div className="flex justify-center">
                    <p className="m-2 hover:cursor-pointer hover:text-red-500 hover:scale-110 hover:font-bold" onClick={this.changePage.bind(this, 1)}>{'<<'}</p>
                        {Array.from({length: (Math.ceil(this.props.payments.length / this.state.nbPerPage))}, (_, i) => i + 1).slice(this.state.currentPage-3 < 0 ? 0 : this.state.currentPage-3 , this.state.currentPage+2)
                        .map(page => <p onClick={this.changePage.bind(this, page)} className={(this.state.currentPage == page ? 'font-bold scale-110' : 'font-light hover:cursor-pointer hover:text-red-500 hover:scale-110 hover:font-bold') + ' m-2'} key={page}>{page}</p>)}
                        <p className="m-2 hover:cursor-pointer hover:text-red-500 hover:scale-110 hover:font-bold" onClick={this.changePage.bind(this, Math.ceil(this.props.payments.length / this.state.nbPerPage))}>{'>>'}</p>
                    </div>
                    <p className="text-right">{this.props.payments.length} Payments</p>
                </div>
            </div>
        )
    }
}

export default PaymentsTab