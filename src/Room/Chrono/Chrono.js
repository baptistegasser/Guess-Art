import React from "react";
import './Chrono.css';

class Chrono extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            started: false,
            remaining: props.duration
        };

        this.chronoTimeout = undefined;
        this.stopChrono = this.stopChrono.bind(this);
    }

    updateChrono() {
        if (this.state.remaining > 0) {
            this.setState({ remaining: this.state.remaining -1 });
        } else {
            this.stopChrono();
        }
    }

    stopChrono() {
        if (!this.state.started || this.chronoTimeout === undefined) return;

        this.setState({ started: false });
        clearInterval(this.chronoTimeout);
        this.chronoTimeout = undefined;
    }

    /**
     * Clear the interval to prevent memory leaks
     */
    componentWillUnmount() {
        this.stopChrono();
    }

    componentDidMount() {
        this.setState({ started: true });
        this.chronoTimeout = setInterval(this.updateChrono.bind(this), 1000);
    }

    render() {
        return (
            <div className='chrono'>
                <p>{this.state.remaining}</p>
            </div>
        )
    }
}

export default Chrono
