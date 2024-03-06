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
    this.onSaveFile = this.onSaveFile.bind(this)
    this.deleteCategory = this.deleteCategory.bind(this)
    this.addCategory = this.addCategory.bind(this)
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
    return finalTab.sort()
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
    return finalTab.sort()
  }

  onload(paymentJsonData) {
    this.setState({
      paymentsList: paymentJsonData,
      categoriesList: this.fromJsonToCategories(paymentJsonData),
      descriptionsList: this.fromJsonToDescription(paymentJsonData),
      currentPaymentList: paymentJsonData})
  }
  
  onSaveFile() {
    var jsonData = JSON.stringify(this.state.paymentsList)
    console.log("[save file] - contenu à sauvegarder : ", jsonData)
    var a = document.createElement("a");
    var file = new Blob([jsonData], {type: "application/json"});
    a.href = URL.createObjectURL(file);
    a.download = 'jsonData.json';
    a.click();
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
        categoriesList: this.fromJsonToCategories(this.state.paymentsList),
        descriptionsList: this.fromJsonToDescription(this.state.currentPaymentList)
      })
    })
    
  }

  deleteCategory(idPayment, categoryIndex){
    console.log("[deleteCategory] entrée - idPaiement : ", idPayment, ' categoryIndex : ', categoryIndex)
    var payment = this.state.paymentsList.find((payment) => payment.id == idPayment)

    var indexOfPayment = this.state.paymentsList.indexOf(payment)
    var indexOfPaymentCurrent = this.state.currentPaymentList.indexOf(payment)

    payment.categories.splice(categoryIndex, 1)

    var tempList = this.state.paymentsList
    var tempCurrent = this.state.currentPaymentList

    tempList[indexOfPayment] = payment
    tempCurrent[indexOfPaymentCurrent] = payment

    console.log(payment)
    this.setState({
      paymentsList: tempList, 
      currentPaymentList: tempCurrent,
      categoriesList: this.fromJsonToCategories(tempList)
    })
  }

  addCategory(category, paymentId){
    console.log("[addCategory] entrée - paymentId : ", paymentId, ' category : ', category)
    var payment = this.state.paymentsList.find((payment) => payment.id == paymentId)

    var indexOfPayment = this.state.paymentsList.indexOf(payment)
    var indexOfPaymentCurrent = this.state.currentPaymentList.indexOf(payment)

    payment.categories.push(category)

    var tempList = this.state.paymentsList
    var tempCurrent = this.state.currentPaymentList

    tempList[indexOfPayment] = payment
    tempCurrent[indexOfPaymentCurrent] = payment

    console.log(payment)
    this.setState({
      paymentsList: tempList, 
      currentPaymentList: tempCurrent,
      categoriesList: this.fromJsonToCategories(tempList)
    })

  }


  render(){
    return (
      <div className="p-6 pt-1 test">
        <h1 className="text-3xl font-bold mb-2 text-center">Finance Master</h1>
        <AdminPanel onDataChange={this.onload} onSaveFile={this.onSaveFile}></AdminPanel>
        <FilterPanel categories={this.state.categoriesList} descriptions={this.state.descriptionsList} onSearch={this.onSearch}></FilterPanel>
        <PaymentsTab payments={this.state.currentPaymentList} deleteCategory={this.deleteCategory} categories={this.state.categoriesList} addCategory={this.addCategory}></PaymentsTab>
        <LineChart payments={this.state.currentPaymentList}></LineChart>
      </div>
    );
  }
}

export default Home
