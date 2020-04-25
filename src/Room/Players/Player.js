
import React from "react";
import {Col, Row} from "react-bootstrap";
import './Player.css';

class Player extends React.Component
{
    render() {
        const bossImg = <img className="boss-icon" src="https://media.giphy.com/media/QXJAPsp0Q35qlOqMUy/giphy.gif" alt="Boss"/>;

        let idName ='normal'
        if (this.props.hasGuessed)
            idName = 'guessed'

        return <div className="player" id={idName}>
            <Row className="h-100">
                <Col className="h-100">
                    <div id='icon-container'>
                        {this.props.boss === true ? bossImg : ''}
                    </div>
                    <h4>{this.props.pseudo}</h4>
                    <p>Points : {this.props.score}</p>
                </Col>
            </Row>
        </div>
    }
}

export default Player
