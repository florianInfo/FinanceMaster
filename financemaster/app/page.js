"use client"
import React from "react"
import './globals.css'
import AdminPanel from "./AdminPanel/AdminPanel";
import PaymentsTab from "./PaymentsTab/PaymentsTab";
import FilterPanel from "./FilterPanel/FilterPanel";

class Home extends React.Component{
  constructor(){
    super()
    this.onload = this.onload.bind(this)
    this.state = {paymentsList: [], categoriesList: [], currentPaymentList: []}
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

  onload(paymentJsonData) {
    this.setState({paymentsList: paymentJsonData, categoriesList: this.fromJsonToCategories(paymentJsonData), currentPaymentList: paymentJsonData})
  }

  onSearch(searchCriteria){
    
  }


  render(){
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-2">Finance Master</h1>
        <AdminPanel onDataChange={this.onload}></AdminPanel>
        <FilterPanel categories={this.state.categoriesList} onSearch={this.onSearch}></FilterPanel>
        <PaymentsTab payments={this.state.currentPaymentList}></PaymentsTab>
        {'total : ' + this.state.paymentsList.length}
        {this.state.categoriesList.length}
      </div>
    );
  }
}

export default Home
