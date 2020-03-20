import React from "react";

class Field extends React.Component{
    render() {
        return <div> {this.props.name} <input type={this.props.type}/></div>
    }
}



export default Field
