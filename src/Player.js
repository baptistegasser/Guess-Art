import React from "react";
import {Col} from "react-bootstrap";
import {Row} from "react-bootstrap";

class Player extends React.Component
{
    render() {
        if (this.props.boss === true)
        {
            return <div id="case" style={{border:"1px solid"}}>
                <Row style={{margin:0}}>
                    <Col><h4>{this.props.pseudo}</h4></Col>
                    <Col><img src="https://media.giphy.com/media/QXJAPsp0Q35qlOqMUy/giphy.gif" style={{height: "50px", width: "50px"}} alt=""/></Col>
                </Row>
                <Row style={{margin:0}}>
                    <Col><p>{this.props.score}</p></Col>
                </Row>
            </div>
        }
        else
        {
            return <div id="case" style={{border:"1px solid"}}>
                <Row style={{margin:0}}>
                    <Col><h4>{this.props.pseudo}</h4></Col>
                </Row>
                <Row style={{margin:0}}>
                    <Col><p>{this.props.score}</p></Col>
                </Row>
            </div>
        }

    }
}

export default Player