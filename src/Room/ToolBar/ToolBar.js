import React from 'react';
import {RoomComponent, connectRoomComponent} from '../RoomComponent';
import { Container, Row, Col } from 'react-bootstrap';
import DrawInstrFactory from '../../DrawInstrFactory';

import './ToolBar.css';

class ToolBar extends RoomComponent {
    constructor(props) {
        super(props);
        this.switchTool  = this.switchTool.bind(this);
        this.switchColor = this.switchColor.bind(this);
        this.switchWidth = this.switchWidth.bind(this);
        this.clearCanvas = this.clearCanvas.bind(this);
    }

    switchTool(type) {
        if (this.props.roomInfo.tool.type === type) return;

        // Set the tool's TYPE in redux
        this.setTool(type);

        // Clear the style from the current selected type
        for (let e of document.getElementsByClassName('tool selected')) {
            e.classList.remove('selected');
        }

        // Set the new selected tool
        document.getElementById(type).classList.add('selected');
    }

    switchColor(color) {
        if (this.props.roomInfo.tool.color === color) return;

        // Set the tool's COLOR in redux
        this.setColor(color);

        // Clear the style from the current selected color
        for (let e of document.getElementsByClassName('color selected')) {
            e.classList.remove('selected');
        }

        // Set the new selected tool
        document.getElementById(color).classList.add('selected');
    }

    switchWidth(width) {
        if (this.props.roomInfo.tool.width === width) return;

        // Set the tool's WIDTH in redux
        this.setWidth(width);

        // Clear the style from the current selected width
        for (let e of document.getElementsByClassName('width selected')) {
            e.classList.remove('selected');
        }

        // Set the new selected tool
        document.getElementById(width).classList.add('selected');
    }

    clearCanvas() {
        this.props.socket.emit("draw_instr", DrawInstrFactory.newInstrTrash());
    }

    componentDidMount() {
        // Set the default value : draw with pencil in black
        this.switchColor('rgb(0,0,0)');
        this.switchWidth(10);
        this.switchTool(DrawInstrFactory.types.pencil);
    }

    render() {
        let tabColors = ['rgb(255, 0, 0)','rgb(0, 0, 255)','rgb(0, 255, 0)','rgb(102, 51, 0)','rgb(255, 255, 0)','rgb(255, 102, 204)','rgb(0,0,0)','rgb(255, 255, 255)','rgb(255, 102, 0)','rgb(204, 0, 153)','rgb(113, 113, 113)']
        let colorSelector = tabColors.map(color => {
            return(<button className="color" key={color} id={color} style={{backgroundColor: color}} onClick={() => this.switchColor(color)}/>)
        });

        let tabWidth = [1,5,10,15,20];
        let widthSelector = tabWidth.map(width => {
            return(<button className={`width width-${width}`} key={width} id={width} onClick={() => this.switchWidth(width)}/>)
        });

        let tabTools = [DrawInstrFactory.types.pencil, DrawInstrFactory.types.bucket, DrawInstrFactory.types.eraser];
        let toolsSelector = tabTools.map(type => {
            return <button className="tool" key={type} id={type} onClick={() => this.switchTool(type)}/>;
        });

        return (
            <Container>
                <Row xs={1} className="p-0">
                    <Col>
                        {colorSelector}
                    </Col>
                    <Col>
                        {widthSelector}
                        {toolsSelector}
                        <button className="tool" id="trash"  onClick={(event) => this.clearCanvas()}/>
                    </Col>
                </Row>
            </Container>
        );
    }
}

export default connectRoomComponent(ToolBar);
