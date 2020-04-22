import React from "react";
import './Chrono.css';

class Chrono extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            started: false,
            autoStart: props.duration > 0,
            remaining: props.duration || 0
        };

        this.chronoTimeout = undefined;
        this.stopChrono = this.stopChrono.bind(this);
        this.startChrono = this.startChrono.bind(this);
        this.updateChrono = this.updateChrono.bind(this);
    }

    startChrono(duration) {
        if (this.state.started) return;

        this.setState({ started: true, remaining: duration });
        this.chronoTimeout = setInterval(this.updateChrono(), 1000);
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

    componentDidMount() {
        if (this.state.autoStart) {
            this.startChrono();
        }
    }

    /**
     * Clear the interval to prevent memory leaks
     */
    componentWillUnmount() {
        this.stopChrono();
    }

    render() {
        return (
            <div className='chrono'>
                {this.state.started ? <p>{this.state.second}</p> : ''}
            </div>
        )
    }
}

export default Chrono
