import React from 'react';
import './Room.css';
import Canvas from "./Canvas.js";
import PlayerList from './Room/Players/PlayerList'
import Chrono from "./Chrono";
import { Container, Row, Col } from "react-bootstrap";
import Chat from "./Room/Chat/Chat";
import {getUsername} from './store/actions'
import {connect} from "react-redux";
import ToolBar from './Room/ToolBar/ToolBar'
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
        this.state = {color:"",tool:"",width:"",boss:""}
        this.leaveRoom = this.leaveRoom.bind(this)
    }

    leaveRoom()
    {
        this.socket.emit("leave_room");
    }

    /**
     * Once the component is mounted we can start to listen for event
     */
    componentDidMount() {
        const room_id = window.location.pathname.replace('/room/','');
        this.socket.on("connect",()=>{this.socket.emit("join_room", room_id)})
        this.socket.on("boss",(data)=>{this.setState({boss : data})})
    }

    render(){
        let boss = false;
        console.log(this.state.boss)
        console.log(this.props.user)

        if (this.state.boss === this.props.user)
        {
            boss = true;
        }

        console.log("BOSS ="+boss )
        return (<Container fluid>
                <Row style={{margin:0}}>
                    <Col xs={4}><Chrono socket = {this.socket} /></Col>
                    <Col xs={6}> <h2>_ _ _ _ _ _ _ </h2></Col>
                    <Col><button onClick={this.leaveRoom}>Quitter le salon</button></Col>
                </Row>
                <Row style={{margin:0}}>
                    <Col xs={3}><PlayerList socket={this.socket}/></Col>
                    <Col xs={7}><div id="Canvas"><Canvas id="canvas" color={this.state.color} width={this.state.width} tool={this.state.tool} boss={boss} socket={this.socket}/></div></Col>
                    <Col xs={2}><Chat socket={this.socket} boss={boss}/></Col>
                </Row>
                <Row style={{margin:0}}>
                    <Col xs={{ span: 7, offset: 3 }}>
                        {boss ? <ToolBar></ToolBar> : '' }
                    </Col>
                </Row>

            </Container>)
        }

}

export default connect(
    mapStateToProps,
    mapDispatchToProps(),
)(Room);
