import React from "react";

class Player extends React.Component
{
    render() {
        if (this.props.boss === true)
        {
            return <div id="case">
                <h1>{this.props.pseudo}</h1>
                Score : <h2>{this.props.score}</h2>
                <h2>Boss</h2>
            </div>
        }
        else
        {
            return <div id="case">
                <h1>{this.props.pseudo}</h1>
                Score : <h2>{this.props.score}</h2>
                <h2>Boss</h2>
            </div>
        }

    }
}

export default Player