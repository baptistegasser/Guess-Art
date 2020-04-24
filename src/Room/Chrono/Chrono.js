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
        if (this.props.displayStyle === 'inline') {
            return (
                <span className='inline'>
                    <b>{this.state.remaining}</b>
                </span>
            );
        }

        let className = '';
        switch(this.props.displayStyle) {
            case 'hidden':
                className = 'hidden';
                break;
            default:
                if (this.state.remaining >= 100) {
                    className = 'chrono big-counter';
                } else {
                    className = 'chrono small-counter';
                }
        }
        return (
            <div className={className}>
                <b>{this.state.remaining}</b>
            </div>
        );
    }
}

export default Chrono
