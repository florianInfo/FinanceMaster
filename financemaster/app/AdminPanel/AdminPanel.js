'use client'
import React from "react";
import './AdminPanel'

class AdminPanel extends React.Component {

    constructor() {
        super()
        this.loadCSV = this.loadCSV.bind(this)
        this.csvToJson = this.csvToJson.bind(this)
        this.findMinDatePaymentInTab = this.findMinDatePaymentInTab.bind(this)
    }

csvToJson(csvText){
    console.debug("[csvToJson] - entrée " + csvText)
    var paymentsLines = csvText.split("\n")
    var finalJson = []
    for(let i=1;i<paymentsLines.length-1; i++){
        const line = paymentsLines[i].split(";");
        var date = ''
        if(line[0].includes("/")){
            var parts = line[0].split("/");
            date = Date.parse(new Date(parseInt(parts[2], 10),
                    parseInt(parts[1], 10) - 1,
                    parseInt(parts[0], 10)))
        }
        else{
            date = Date.parse(line[0])
        }
        
        var datetimestamp = date
        var debiteur = line[1]
        var category = line[2]
        var debit = parseFloat(line[3])
        var credit = parseFloat(line[4])
        var paymentJson = {
            datetimestamp: datetimestamp,
            debiteur: debiteur,
            category: category,
            debit: debit,
            credit: credit
        }
        finalJson.push(paymentJson)
    }
    console.debug("[csvToJson] - fin ", finalJson)
    return finalJson
}

findMinDatePaymentInTab(paymentTab){
    var min = 80000000000000
    var index = 0
    for(let i=0;i<paymentTab.length;i++){
        if(paymentTab[i].datetimestamp < min){
            index = i
            min = paymentTab[i].datetimestamp
        }
    }
    return index;
}

sortJsonPaymentsByDate(payments){
    var tempTab = JSON.parse(JSON.stringify(payments));
    var finalTab = []
    
    for(let i=0;i<payments.length;i++){
        var indexMin = this.findMinDatePaymentInTab(tempTab)
        finalTab[i] = tempTab[indexMin]
        tempTab.splice(indexMin, 1);
    }
    return finalTab
}

loadCSV(e) {
    e = e || window.event;
    var target = e.target || e.srcElement;

    console.log(target.files[0])

    var reader = new FileReader();
    reader.addEventListener('load', function (e) {
        var jsonData = this.csvToJson(e.target.result)
        var finalJson = this.sortJsonPaymentsByDate(jsonData)
        this.props.onDataChange(finalJson);
    }.bind(this))
    reader.readAsBinaryString(target.files[0]);
}

render() {
    return (
            <div className="container">
                <input type="file" name="csvFile" id="csvFile" accept=".csv" onChange={this.loadCSV}/>
            </div>
    )
    }
}

export default AdminPanel