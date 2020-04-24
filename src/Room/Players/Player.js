import React from "react";
import {Col} from "react-bootstrap";
import {Row} from "react-bootstrap";

class Player extends React.Component
{
    render() {
        const bossImg = <Col><img src="https://media.giphy.com/media/QXJAPsp0Q35qlOqMUy/giphy.gif" style={{height: "36px", width: "36px",float:"right",borderRadius:"10px"}} alt=""/></Col>;

        return <div id="case" style={{borderRadius:"10px",backgroundColor:"rgb(102, 204, 255)",marginBottom:"2%"}}>
            <Row style={{margin:0,padding:0,paddingLeft:"30%"}}>
                <Col><h4>{this.props.pseudo}</h4></Col>
                {this.props.boss === true ? bossImg : ''}
            </Row>
            <Row style={{margin:0,padding:0}}>
                <Col><p>Points : {this.props.score}</p></Col>
            </Row>
        </div>
    }
}

export default Player
