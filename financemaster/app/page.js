"use client"
import React from "react"
import './globals.css'
import AdminPanel from "./AdminPanel/AdminPanel";

class Home extends React.Component{
  constructor(){
    super()
    this.onload = this.onload.bind(this)
    this.state = {paymentsList: []}
  }

  onload(paymentJsonData) {
    this.setState({paymentsList: paymentJsonData})
    this.state.paymentsList.map(function (i) {
      return (
        <span className='indent'></span>
      );
    });
  }


  render(){
    return (
      <div className="container">
        <h1>Hello World</h1>
        <AdminPanel onDataChange={this.onload}></AdminPanel>
        {this.state.paymentsList[0]?.datetimestamp || "pas de paiement"}
      </div>
    );
  }
}

export default Home
