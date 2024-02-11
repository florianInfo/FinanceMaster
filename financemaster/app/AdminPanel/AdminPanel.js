'use client'
import React from "react";
import './AdminPanel.css'

class AdminPanel extends React.Component {

    constructor() {
        super()
        this.loadCSV = this.loadCSV.bind(this)
        this.loadJson = this.loadJson.bind(this)
        this.saveFile = this.saveFile.bind(this)
        this.csvToJson = this.csvToJson.bind(this)
        this.findMinDatePaymentInTab = this.findMinDatePaymentInTab.bind(this)
        this.state = {
            paymentList: [],
            history: []
        }
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
    console.log("[sort by date] - entrée : ", payments)
    var tempTab = JSON.parse(JSON.stringify(payments));
    var finalTab = []
    
    for(let i=0;i<payments.length;i++){
        var indexMin = this.findMinDatePaymentInTab(tempTab)
        finalTab[i] = tempTab[indexMin]
        tempTab.splice(indexMin, 1);
    }
    console.log("[sort by date] - sortie : ", finalTab)
    return finalTab
}

loadCSV(e) {
    e = e || window.event;
    const target = e.target || e.srcElement;

    var reader = new FileReader();
    reader.addEventListener('load', function (e) {
        var jsonData = this.csvToJson(e.target.result)
        var historyTab = [...this.state.history, 'File ' + e.currentTarget.filename + ' loaded']
        var paymentTab = [...this.state.paymentList, ...jsonData]
        this.setState({history: historyTab})
        this.setState({paymentList: paymentTab}, () => this.updatePaymentsList())
        
    }.bind(this))
    reader.filename = target.files[0].name
    reader.readAsBinaryString(target.files[0]);
}

loadJson(e) {
    e = e || window.event;
    const target = e.target || e.srcElement;

    var reader = new FileReader();
    reader.addEventListener('load', function (e) {
        var jsonData = JSON.parse(e.target.result)
        var historyTab = [...this.state.history, 'File ' + e.currentTarget.filename + ' loaded']
        var paymentTab = [...this.state.paymentList, ...jsonData]
        this.setState({history: historyTab})
        this.setState({paymentList: paymentTab}, () => this.updatePaymentsList())
        
    }.bind(this))
    reader.filename = target.files[0].name
    reader.readAsBinaryString(target.files[0]);
}

updatePaymentsList() {
    this.setState({paymentList: this.sortJsonPaymentsByDate(this.state.paymentList)}, () => this.props.onDataChange(this.state.paymentList))
}

saveFile() {
    var jsonData = JSON.stringify(this.state.paymentList)
    console.log("[save file] - contenu à sauvegarder : ", jsonData)
    var a = document.createElement("a");
    var file = new Blob([jsonData], {type: "application/json"});
    a.href = URL.createObjectURL(file);
    a.download = 'jsonData.json';
    a.click();
    var historyTab = [...this.state.history, 'File saved with ' + this.state.paymentList.length + "payment(s)"]
    this.setState({history: historyTab})
}
 
render() {
    return (
            <div className="adminPanel-container">
                <div className="container">
                    <h4>Load CSV</h4>
                    <input type="file" name="csvFile" id="csvFile" accept=".csv" onChange={this.loadCSV}/>
                    <h4>Load Json</h4>
                    <input type="file" name="jsonFile" id="jsonFile" accept=".json" onChange={this.loadJson}/>
                </div>
                <div className="container">
                    <h4>Historique</h4>
                    <div className="history-list">
                        {this.state.history.map((history, index) => <p key={index}>{history}</p>)}
                    </div>
                </div>
                <div className="container">
                    <h4>Save data</h4>
                    <button onClick={this.saveFile}>Sauvegarder le fichier</button>
                </div>
            </div>
    )
    }
}

export default AdminPanel