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
      <div className="app-container">
        <h1>Finance Master</h1>
        <AdminPanel onDataChange={this.onload}></AdminPanel>
        {'total : ' + this.state.paymentsList.length}
      </div>
    );
  }
}

export default Home
