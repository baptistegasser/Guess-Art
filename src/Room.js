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
        this.state = {color:"",tool:""}
        this.clickColor =this.clickColor.bind(this)
        this.clickTool = this.clickTool.bind(this)

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

    clickTool(e)
    {
        var allButtons = document.getElementsByClassName("width")
        for (let i = 0; i <allButtons.length;i++)
        {
            allButtons.item(i).setAttribute("class","width")
        }
        e.target.className = "width selected"
        this.setState({tool : ""+e.target.id})
    }

    render(){
        let tapPlayers = {1:{pseudo:"laTeuteu",score:1500,boss:true},2:{pseudo:"Darsk",score:1800,boss:false}}

        let players = Object.entries(tapPlayers).map(([key,val])=>{
            return (<Player pseudo={val.pseudo} score={val.score} boss={val.boss}></Player>)
        });


        let tabColors = ['red','blue','green','brown','yellow','pink','black','white','orange','purple','grey']
        let selectColor = tabColors.map(col=>{
            if (this.state.color === "")
            {
                if (col === 'black')
                    return(<button className="color selected" id={col} style={{backgroundColor : col}} onClick={this.clickColor}></button>)
            }
                return(<button className="color" id={col} style={{backgroundColor : col}} onClick={this.clickColor}></button>)
        });

        let tabWidth = [1,5,10,15,20];
        let selectorWidth = tabWidth.map(val=>{
            let picture = process.env.PUBLIC_URL + '/width/taille_'+val+'.jpg';
            if (this.state.tool ==="")
            {
                if (val === 1)
                    return(<button className="width selected" id={val}  onClick={this.clickTool} style={{backgroundImage : 'url('+picture+')'}}></button>)
            }
            return(<button className="width " id={val}  onClick={this.clickTool} style={{backgroundImage : 'url('+picture+')'}}></button>)
        })

        return (<Container>
                    <Row>
                        <Col xs={2}><div id="HboxPlayer">{players}</div></Col>
                        <Col xs={8}><div id="Canvas"><Canvas id="canvas" color={this.state.color} width={this.state.tool}></Canvas></div></Col>
                        <Col xs={2}><div id="chat"></div></Col>
                    </Row>
                    <Row>
                        <Col xs={2}></Col>
                        <Col xs={8}><div>{selectColor}</div></Col>
                        <Col xs={2}><input placeholder="Ecrire ici"/></Col>
                    </Row>
                    <Row>
                        <Col xs={2}></Col>
                        <Col xs={8}><div>{selectorWidth}</div></Col>
                    </Row>

                </Container>)
    }
}

export default Room;
