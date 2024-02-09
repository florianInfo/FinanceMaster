import React from "react"

export default function FirstComponent(props) {
    return (
            <div className="mapContainer">
                <h2>Bonjour je suis le premier composant</h2>
                <p>{props.count}</p>
            </div>
        );
    

}