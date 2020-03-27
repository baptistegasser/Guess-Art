import React from "react";
import {Col} from "react-bootstrap";
import {Row} from "react-bootstrap";

class Player extends React.Component
{
    render() {
        if (this.props.boss === true)
        {
            return <div id="case">
                <Row>
                    <Col><h4>{this.props.pseudo}</h4></Col>
                </Row>
                <Row>
                    <Col xs={4}><p>{this.props.score}</p></Col>
                    <Col xs={5}><img src="https://media.giphy.com/media/QXJAPsp0Q35qlOqMUy/giphy.gif" style={{height:"50px",width:"50px"}}></img></Col>
                </Row>

            </div>
        }
        else
        {
            return <div id="case">
                <Row>
                    <Col><h4>{this.props.pseudo}</h4></Col>
                </Row>
                <Row>
                    <Col><p>{this.props.score}</p></Col>
                </Row>
            </div>
        }

    }
}

export default Player