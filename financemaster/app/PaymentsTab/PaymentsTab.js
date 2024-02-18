import React from "react";
import moment from "moment";
import './PaymentsTab.css'

class PaymentsTab extends React.Component {
    constructor(props){
        super(props)
        this.state = {payments: this.props.payments, nbPerPage : 10}
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
                        {this.props.payments.map((payment, index) => {
                            var amount = payment.debit > 0 ? "-" + payment.debit : "+" + payment.credit
                            return (
                                <tr key={index} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                    <td className="px-6 py-4">{moment(payment.date).format("DD/MM/YYYY")}</td>
                                    <td className="px-6 py-4">{payment.categories[0]}</td>
                                    <td className="px-6 py-4">{payment.debiteur}</td>
                                    <td className="px-6 py-4">{amount}</td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        )
    }
}

export default PaymentsTab