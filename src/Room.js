import React from 'react';
import './Room.css';
import Canvas from "./Canvas.js";
import Player from "./Player";
import {Container} from "react-bootstrap";
import {Col} from "react-bootstrap";
import {Row} from "react-bootstrap";



class Room extends React.Component {
    constructor() {
        super();
        this.state = {color:""}
        this.clickColor =this.clickColor.bind(this)

    }

    clickColor(e)
    {
        var allButtons = document.getElementsByClassName("color")
        for (let i = 0; i <allButtons.length;i++)
        {
            allButtons.item(i).setAttribute("class","color")
        }
        e.target.className = "color selected"
        this.setState({color : ""+e.target.id})

    }

    render(){
        let tapPlayers = {1:{pseudo:"laTeuteu",score:1500,boss:true},2:{pseudo:"Darsk",score:1800,boss:false}}

        let players = Object.entries(tapPlayers).map(([key,val])=>{
            return (<Player pseudo={val.pseudo} score={val.score} boss={val.boss}></Player>)
        });


        let tabColors = ['red','blue','green','brown','yellow','pink','black','white','orange','purple','grey']
        let selectColor = tabColors.map(col=>{
            return(<button class="color" id={col} style={{backgroundColor : col}} onClick={this.clickColor}></button>)
        });

        return (<Container>
                    <Row>
                        <Col xs={2}><div id="HboxPlayer">{players}</div></Col>
                        <Col xs={8}><div id="Canvas"><Canvas id="canvas"></Canvas></div></Col>
                        <Col xs={2}><div id="chat"></div></Col>
                    </Row>
                    <Row>
                        <Col xs={2}></Col>
                        <Col xs={8}><div>{selectColor}</div></Col>
                        <Col xs={2}><input placeholder="Ecrire ici"/></Col>
                    </Row>

                </Container>)
    }
}

export default Room;
