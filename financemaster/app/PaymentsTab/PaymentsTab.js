import React from "react";
import moment from "moment";
import './PaymentsTab.css'


class PaymentsTab extends React.Component {
    constructor(props){
        super(props)
        this.state = {
            payments: this.props.payments,
            nbPerPage : 5,
            currentPage: 1,
            currentVisibleCategoryChoiceIndex: -1,
            currentSearch: ''
        }
    }

    changePage(page) {
        console.log('[changePage] entrée - ', page)
        this.setState({currentPage: page})
    }

    deleteCategory(idPaiement, categoryIndex){
        this.props.deleteCategory(idPaiement, categoryIndex)
    }

    openCategoryList(e, index) {
        if(this.state.currentVisibleCategoryChoiceIndex == index){
            index = -1
        }
        this.setState({currentVisibleCategoryChoiceIndex: index})
        e.preventDefault()
    }

    onSearchChange(e){
        this.setState({currentSearch: e.target.value})
    }

    addCategory(e, paymentId, category) {
        this.props.addCategory(category, paymentId)
        this.setState({currentVisibleCategoryChoiceIndex: -1})
        e.preventDefault()
    }

    addNewCategory(idPaiement, e){
        if(e.keyCode == 13){
            var category = e.target.value.charAt(0).toUpperCase() + e.target.value.substring(1, e.target.value.length)
            this.props.addCategory(category, idPaiement)
            e.target.value = ''
            this.setState({currentSearch: '', currentVisibleCategoryChoiceIndex: -1})
        }
        
    }

    render() {
        return (
            <div className="relative overflow-x-auto shadow-md sm:rounded-lg mb-2 container">
                <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400 border-x-red-200">
                    <thead className="text-xs text-gray-700 uppercase bg-red-200 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">Date</th>
                            <th scope="col" className="px-6 py-3">Category</th>
                            <th scope="col" className="px-6 py-3">Description</th>
                            <th scope="col" className="px-6 py-3">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="shadow-md">
                        {this.props.payments.slice((this.state.currentPage-1) * this.state.nbPerPage, (this.state.currentPage) * this.state.nbPerPage).map((payment, paymentIndex) => {
                            return (
                                <tr key={paymentIndex} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                    <td className="px-6 py-4">{moment(payment.date).format("DD/MM/YYYY")}</td>
                                    <td className="px-6 py-4 w-64 flex flex-wrap gap-1">{payment.categories.map((category, categoryIndex) => {
                                        return <div key={categoryIndex} className="flex gap-x-1 shadow-md rounded-md bg-gray-150 w-fit px-2">
                                            <p className="font-medium">{category}</p>
                                            <p className="cursor-pointer" onClick={this.deleteCategory.bind(this, payment.id, categoryIndex)}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.2} stroke="#eb4034A2" className="w-4 h-4">
  <path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
</svg>
</p>
                                            </div>
                                    })}
                                    <div>
                                        <div className="cursor-pointer" onClick={(e) => this.openCategoryList(e, paymentIndex)}>
                                            {this.state.currentVisibleCategoryChoiceIndex == paymentIndex ? <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
</svg>
 : <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
</svg>
}
                                        </div>
                                        <div className={`bg-white absolute overflow-y-auto z-50 selectList ${this.state.currentVisibleCategoryChoiceIndex == paymentIndex ? 'visible' : 'hidden'}`}>
                                            <input className="p-1" type="text" placeholder="search..." onChange={(e) => this.onSearchChange(e)} onKeyUp={(e) => this.addNewCategory(payment.id, e)}></input>
                                            {this.props.categories.filter(categorie => categorie.toUpperCase().includes(this.state.currentSearch.toUpperCase())).map((category, categoryIndex) => {
                                                return <div className="p-2 cursor-pointer hover:bg-red-500 hover:text-white"key={categoryIndex} onClick={(e) => this.addCategory(e, payment.id, category)}>{category}</div>
                                            } )}
                                        </div>
                                    </div>
                                    </td>
                                    <td className="px-6 py-4">{payment.description}</td>
                                    <td className="px-6 py-4 underline">{payment.amount > 0 ? "+" + payment.amount.toFixed(2): payment.amount.toFixed(2)}</td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
                <div className="footer">
                    <div className="flex justify-center">
                    <p className="m-2 hover:cursor-pointer hover:text-red-500 hover:scale-110 hover:font-bold" onClick={this.changePage.bind(this, 1)}>{'<<'}</p>
                        {Array.from({length: (Math.ceil(this.props.payments.length / this.state.nbPerPage))}, (_, i) => i + 1).slice(this.state.currentPage-3 < 0 ? 0 : this.state.currentPage-3 , this.state.currentPage+2)
                        .map(page => <p onClick={this.changePage.bind(this, page)} className={(this.state.currentPage == page ? 'font-bold scale-110' : 'font-light hover:cursor-pointer hover:text-red-500 hover:scale-110 hover:font-bold') + ' m-2'} key={page}>{page}</p>)}
                        <p className="m-2 hover:cursor-pointer hover:text-red-500 hover:scale-110 hover:font-bold" onClick={this.changePage.bind(this, Math.ceil(this.props.payments.length / this.state.nbPerPage))}>{'>>'}</p>
                    </div>
                    <div className="flex justify-around">
                        <p className="text-left display-inline">{'Balance ' + this.props.payments.reduce((finalResult, payment) => finalResult + payment.amount, 0).toFixed(2) + '$'}</p>
                        <p className="text-right display-inline">{this.props.payments.length} Payments</p>
                    </div>
                    
                </div>
            </div>
        )
    }
}

export default PaymentsTab