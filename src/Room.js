import React from 'react';
import './Room.css';
import Canvas from "./Canvas.js";
import Player from "./Player";



class Room extends React.Component {

    render(){

        let tab = ['red','blue','green','brown','yellow','pink','black','white','orange','purple','grey']
        let selectColor = tab.map(col=>{
            return(<button class="color" id={col} style={{backgroundColor : col}}></button>)
        });

        return (<div>
                <div id="HboxPlayer"><Player pseudo="LaTeuTeu" score="1500" boss="true"></Player><Player pseudo="darsk" score="200" boss="false"></Player></div>
                <div id="Canvas"><Canvas id="canvas"></Canvas></div>
                <div>{selectColor}</div>
                </div>)
    }
}

export default Room;
