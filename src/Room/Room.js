import React from 'react';
import './Room.css';
import Canvas from "./Canvas/Canvas.js";
import PlayerList from './Players/PlayerList'
import Chrono from "./Chrono/Chrono";
import { Container, Row, Col } from "react-bootstrap";
import Chat from "./Chat/Chat";
import {getUsername} from '../store/actions'
import ToolBar from './ToolBar/ToolBar'
import { RoomComponent, extendedRoomConnect } from './RoomComponent';
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

class Room extends RoomComponent {
    constructor(props) {
        super(props);
        this.socket = socketIo();
        this.state = {color:"",tool:"",width:"",boss:""}
        this.leaveRoom    = this.leaveRoom.bind(this);
        this.onRoundStart = this.onRoundStart.bind(this);
        this.onRoundEnd   = this.onRoundEnd.bind(this);
        this.onGameInfo   = this.onGameInfo.bind(this);
        this.onGameStart  = this.onGameStart.bind(this);
        this.onGameEnd    = this.onGameEnd.bind(this);
    }

    leaveRoom() {
        this.socket.emit("leave_room");
    }

    onRoundStart(infos) {
        this.setBoss(infos.boss);
        this.setIsBoss(infos.boss === this.props.user);
        // TODO si isBoss : infos.mystery_word -> contient le mot a dessiner
        // TODO : start chronos et tout
        //TODO caché overlay
    }

    onRoundEnd(infos) {
        // TODO stop chornos et tout
        // TODO afficher l'overlay avec les cores gagné pour "infos.delay" secondes
        // TODO increment score des joueurs
    }

    onGameInfo(infos) {
        // Add all the player to the list
        infos.players.map(player => this.addPlayer(player));

        // Actions if the game started
        if (infos.gameStarted === true) {
            this.setBoss(infos.boss);
            this.setIsBoss(infos.boss === this.props.user);
            // TODO afficher l'historique de dessins sur le canvas : infos.draw_instr
            // TODO : start chronos : infos.timeRemaining -> temps restant en secondes
        }
    }

    onGameStart(infos) {
        // TODO stocké le temps du chrono pour chaque round : infos.roundDuration
        // TODO affiché overlay "game start in x secondes" avec : info.delay -> delay avant start round
    }

    onGameEnd(infos) {
        // TODO Stop tout ?
        // TODO afficher scores finaux : infos.players
    }

    /**
     * Once the component is mounted we can start to listen for events
     */
    componentDidMount() {
        const room_id = window.location.pathname.replace('/room/','');
        this.socket.on("connect",()=>{this.socket.emit("join_room", room_id)})

        this.socket.on('user_joined', (player) => this.addPlayer(player));
        this.socket.on('user_leaved', (player) => this.removePlayer(player));
        this.socket.on('round_start', (infos) => this.onRoundStart(infos));
        this.socket.on('round_end',   (infos) => this.onRoundEnd(infos));
        this.socket.on('game_info',   (infos) => this.onGameInfo(infos));
        this.socket.on('game_start',  (infos) => this.onGameStart(infos));
        this.socket.on('game_end',    (infos) => this.onGameEnd(infos));
    }

    render() {
        return (
            <Container fluid>
                <Row>
                    <Col xs={4}>
                        <Chrono socket = {this.socket} />
                    </Col>
                    <Col xs={6}>
                        <h2>_ _ _ _ _ _ _ </h2>
                    </Col>
                    <Col>
                        <button onClick={this.leaveRoom}>Quitter le salon</button>
                    </Col>
                </Row>
                <Row>
                    <Col xs={3}>
                        <PlayerList socket={this.socket}/>
                    </Col>
                    <Col xs={7}>
                        <Canvas socket={this.socket}/>
                    </Col>
                    <Col xs={2}>
                        <Chat socket={this.socket}/>
                    </Col>
                </Row>
                <Row>
                    <Col xs={{ span: 7, offset: 3 }}>
                        {this.props.roomInfo.isBoss ? <ToolBar socket={this.socket}></ToolBar> : '' }
                    </Col>
                </Row>
            </Container>
        );
    }
}

export default extendedRoomConnect(mapStateToProps, mapDispatchToProps(), Room);
