import React from "react";
import moment from "moment";
import './FilterPanel.css'

class FilterPanel extends React.Component {

    constructor(props){
        super(props)
        this.search = this.search.bind(this)
    }

    search() {
        console.log("[search] entrée ", document.getElementById("beginDate").v)
        var beginDate = document.getElementById("beginDate").value
        var endDate = document.getElementById("endDate").value
        var category = document.getElementById("categories").value
        var description = document.getElementById("descriptions").value

        var searchCriteria = {
            beginDate: moment(beginDate),
            endDate: moment(endDate),
            category: category,
            description: description
        }

        this.props.onSearch(searchCriteria)
        console.log("[search] sortie - ", searchCriteria)
    }


    render() {
        return (
            <div className="mt-2 mb-2 flex justify-around border p-4 items-center shadow-md sm:rounded-lg">
                <div>
                    <label htmlFor="beginDate" className="block text-sm font-medium leading-6 text-gray-900">Begin Date</label>
                    <input type="date" name="beginDate" id="beginDate"></input>
                </div>
                
                <div>
                    <label htmlFor="endDate" className="block text-sm font-medium leading-6 text-gray-900">End Date</label>
                    <input type="date" name="endDate" id="endDate"></input>
                </div>
                
                <div>
                    <label htmlFor="categories" className="block text-sm font-medium leading-6 text-gray-900">Categories</label>
                    <select name="categories" id="categories">
                        <option value=""></option>
                        {this.props.categories?.map((category, index) => <option key={index} value={category}>{category}</option>)}
                    </select>
                </div>
                
                <div>
                    <label htmlFor="descriptions" className="block text-sm font-medium leading-6 text-gray-900">Descriptions</label>
                    <select name="descriptions" id="descriptions">
                        <option value=""></option>
                        {this.props.descriptions?.map((description, index) => <option key={index} value={description}>{description}</option>)}
                    </select>
                </div>
                
                <button onClick={this.search} className="text-xs bg-red-500 text-zinc-50 p-2 rounded-md hover:bg-red-600 hover:text-sm">Search</button>
            </div>
        )
    }

}
export default FilterPanel