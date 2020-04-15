import React from 'react';
import './Room.css';
import Canvas from "./Canvas.js";
import Player from "./Player";
import Chrono from "./Chrono";
import {Container} from "react-bootstrap";
import {Col} from "react-bootstrap";
import {Row} from "react-bootstrap";
import Chat from "./Chat";
import {getUsername} from './store/actions'
import {connect} from "react-redux";
const socketIo = require("socket.io-client");

const mapStateToProps = state => (
    {
        user: state.user
    }
)

const mapDispatchToProps = () => {
    return {
        getUsername
    };
};




class Room extends React.Component {
    constructor(props) {
        super(props);
        this.socket = socketIo()
        const room_id = window.location.pathname.replace('/room/','');
        this.socket.on("connect",()=>{this.socket.emit("join_room", room_id)})
        this.socket.on("boss",(data)=>this.setState({boss : data}))
        this.state = {color:"",tool:"",width:"",boss:""}
        this.clickColor =this.clickColor.bind(this)
        this.clickWidth =this.clickWidth.bind(this)
        this.clickTool = this.clickTool.bind(this)
        this.leaveRoom = this.leaveRoom.bind(this)
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
        var eraser = document.getElementById("eraser")
        eraser.setAttribute("class","tool")
        if (this.state.tool === "eraser")
            this.setState({tool:""})

    }

    clickWidth(e)
    {
        var allButtons = document.getElementsByClassName("width")
        for (let i = 0; i <allButtons.length;i++)
        {
            allButtons.item(i).setAttribute("class","width")
        }
        e.target.className = "width selected"
        this.setState({width : ""+e.target.id})
        var bucket = document.getElementById("bucket")
        bucket.setAttribute("class","tool")
        if (this.state.tool === "bucket")
            this.setState({tool:""})
    }

    clickTool(e)
    {
        var allButtons = document.getElementsByClassName("tool")
        for (let i = 0; i <allButtons.length;i++)
        {
            allButtons.item(i).setAttribute("class","tool")
        }
        e.target.className = "tool selected"
        this.setState({tool : ""+e.target.id})
        if (e.target.id === "eraser")
        {
            var allColors = document.getElementsByClassName("color")
            for (let i = 0; i <allColors.length;i++)
            {
                allColors.item(i).setAttribute("class","color")
            }
            this.setState({color:""})
        }
        if (e.target.id === "bucket")
        {
            var allWidths = document.getElementsByClassName("width")
            for (let i = 0; i <allWidths.length;i++)
            {
                allWidths.item(i).setAttribute("class","width")
            }
            this.setState({width:""})
        }

    }

    leaveRoom()
    {
        this.socket.emit("leave_room");
    }




    render(){
        let boss = false;
        let tabPlayers = {1:{pseudo:"ben",score:1500,boss:true},2:{pseudo:"Darsk",score:1800,boss:false}}

        if (this.state.boss === this.props.user)
        {
            boss = true;
        }

        console.log("BOSS ="+boss )

        let players = Object.entries(tabPlayers).map(([key,val])=>{
            return (<Player key={val.pseudo} pseudo={val.pseudo} score={val.score} boss={val.boss}/>)
        });


        let tabColors = ['rgb(255, 0, 0)','rgb(0, 0, 255)','rgb(0, 255, 0)','rgb(102, 51, 0)','rgb(255, 255, 0)','rgb(255, 102, 204)','rgb(0,0,0)','rgb(255, 255, 255)','rgb(255, 102, 0)','rgb(204, 0, 153)','rgb(113, 113, 113)']
        let selectorColor = tabColors.map(col=>{
            if (this.state.color === "" && this.state.tool === "")
            {
                if (col === 'rgb(0,0,0)')
                    return(<button className="color selected" key={col} id={col} style={{backgroundColor: col}} onClick={this.clickColor}/>)
            }
                return(<button className="color" key={col} id={col} style={{backgroundColor: col}} onClick={this.clickColor}/>)
        });

        let tabWidth = [1,5,10,15,20];
        let selectorWidth = tabWidth.map(val=>{
            let picture = process.env.PUBLIC_URL + '/width/taille_'+val+'.jpg';
            if (this.state.width === "")
            {
                if (val === 1)
                    return(<button className="width selected" id={val} key={val} onClick={this.clickWidth} style={{backgroundImage: 'url(' + picture + ')'}}/>)
            }
            return(<button className="width " key={val} id={val}  onClick={this.clickWidth} style={{backgroundImage: 'url(' + picture + ')'}}/>)
        });

        let tabTool = ['eraser','bucket'];
        let selectorTool = tabTool.map(val=>{
            let picture = process.env.PUBLIC_URL + '/tool/'+val+'.png';
            return(<button className="tool"  key={val} id={val} onClick={this.clickTool} style={{backgroundImage: 'url('+picture+')'}}/>)
        });

        if (boss === false)
        {
            selectorColor = ""
            selectorTool = ""
            selectorWidth = ""
        }
        return (<Container fluid>
                <Row style={{margin:0}}>
                    <Col xs={4}><Chrono socket = {this.socket} /></Col>
                    <Col xs={6}> <h2>_ _ _ _ _ _ _ </h2></Col>
                    <Col><button onClick={this.leaveRoom}>Quitter le salon</button></Col>
                </Row>
                <Row style={{margin:0}}>
                    <Col xs={3}><div id="HboxPlayer">{players}</div></Col>
                    <Col xs={7}><div id="Canvas"><Canvas id="canvas" color={this.state.color} width={this.state.width} tool={this.state.tool} boss={boss} socket={this.socket}/></div></Col>
                    <Col xs={2}><Chat socket={this.socket} boss={boss}/></Col>
                </Row>
                <Row style={{margin:0}}>
                    <Col xs={3}/>
                    <Col xs={7}><div>{selectorColor}</div></Col>
                </Row>
                <Row style={{margin:0}}>
                    <Col xs={3}/>
                    <Col xs={7}><div>{selectorWidth}{selectorTool}</div></Col>
                </Row>

            </Container>)
        }

}


export default connect(
    mapStateToProps,
    mapDispatchToProps(),
)(Room);
