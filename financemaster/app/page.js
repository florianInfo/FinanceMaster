"use client"
import React from "react"
import './globals.css'
import AdminPanel from "./AdminPanel/AdminPanel";
import PaymentsTab from "./PaymentsTab/PaymentsTab";
import FilterPanel from "./FilterPanel/FilterPanel";
import moment from "moment";
import LineChart from "./LineChart/LineChart";

class Home extends React.Component{
  constructor(){
    super()
    this.onload = this.onload.bind(this)
    this.onSearch = this.onSearch.bind(this)
    this.state = {paymentsList: [], categoriesList: [], descriptionsList: [], currentPaymentList: []}
  }

  fromJsonToCategories(paymentsList){
    console.log("[fromJsonToCategories] entrée")
    var finalTab = []
    for(let i=0; i<paymentsList.length; i++){
      for(let j=0;j<paymentsList[i].categories.length;j++){
        var category = paymentsList[i].categories[j]
        if(!finalTab.includes(category)){
          finalTab.push(paymentsList[i].categories[j])
        }
      }
    }
    console.log("[fromJsonToCategories] sortie - ", finalTab)
    return finalTab
  }

  fromJsonToDescription(paymentsList){
    console.log("[fromJsonToDescription] entrée")
    var finalTab = []
    for(let i=0; i<paymentsList.length; i++){
        var category = paymentsList[i].description
        if(!finalTab.includes(category)){
          finalTab.push(paymentsList[i].description)
        }
      }
    console.log("[fromJsonToDescription] sortie - ", finalTab)
    return finalTab
  }

  onload(paymentJsonData) {
    this.setState({
      paymentsList: paymentJsonData,
      categoriesList: this.fromJsonToCategories(paymentJsonData),
      descriptionsList: this.fromJsonToDescription(paymentJsonData),
      currentPaymentList: paymentJsonData})
  }

  onSearch(searchCriteria){
    console.log("[onSearch] entrée - ", searchCriteria)
    this.setState({currentPaymentList: this.state.paymentsList}, () => {
      var finalResult = this.state.currentPaymentList
      if(searchCriteria.beginDate.isValid()){
        finalResult = finalResult.filter(payment => moment(payment.date).isAfter(searchCriteria.beginDate))
      }
      if(searchCriteria.endDate.isValid()){
        finalResult = finalResult.filter(payment => moment(payment.date).isBefore(searchCriteria.endDate))
      }
      if(searchCriteria.category){
        finalResult = finalResult.filter(payment => payment.categories.includes(searchCriteria.category))
      }
      if(searchCriteria.description){
        finalResult = finalResult.filter(payment => payment.description.toUpperCase() == searchCriteria.description.toUpperCase())
      }
      this.setState({
        currentPaymentList: finalResult,
        categoriesList: this.fromJsonToCategories(this.state.currentPaymentList),
        descriptionsList: this.fromJsonToDescription(this.state.currentPaymentList)
      })
    })
    
  }


  render(){
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-2">Finance Master</h1>
        <AdminPanel onDataChange={this.onload}></AdminPanel>
        <FilterPanel categories={this.state.categoriesList} descriptions={this.state.descriptionsList} onSearch={this.onSearch}></FilterPanel>
        <PaymentsTab payments={this.state.currentPaymentList}></PaymentsTab>
        {'total : ' + this.state.currentPaymentList.length + ' payments'}
        <div>
          {'balance : ' + this.state.currentPaymentList.reduce((finalResult, payment) => finalResult + payment.amount, 0).toFixed(2) + '$'}
        </div>
        <LineChart payments={this.state.currentPaymentList}></LineChart>
      </div>
    );
  }
}

export default Home
