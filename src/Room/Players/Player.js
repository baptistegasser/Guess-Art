import React from "react";
import {Col, Row} from "react-bootstrap";
import './Player.css';

class Player extends React.Component
{
    render() {
        const bossImg = <img className="boss-icon" src="https://media.giphy.com/media/QXJAPsp0Q35qlOqMUy/giphy.gif" alt="Boss"/>;

        return <div class="player">
            <Row xs={1}>
                <Col xs={12}>
                    <h4>{this.props.pseudo}</h4>
                    {this.props.boss === true ? bossImg : ''}
                </Col>
            </Row>
            <Row>
                <Col>
                    <p>Points : {this.props.score}</p>
                </Col>
            </Row>
        </div>
    }
}

export default Player
