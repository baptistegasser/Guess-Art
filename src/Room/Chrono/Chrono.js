import React from "react";
import './Chrono.css';

class Chrono extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            started: false,
            remaining: -1,
        };

        this.chronoTimeout = undefined;
        this.startChrono = this.startChrono.bind(this);
        this.stopChrono = this.stopChrono.bind(this);
        this.updateChrono = this.updateChrono.bind(this);
    }

    startChrono(duration) {
        this.setState({ started: true, remaining: duration });
        this.chronoTimeout = setInterval(this.updateChrono, 1000);
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
        if (this.props.autostart === true) {
            this.startChrono(this.props.duration)
        }
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
                    className = 'big-counter';
                } else {
                    className = 'small-counter';
                }
        }
        return (
            <div className={'chrono ' + className}>
                <b>{this.state.remaining}</b>
            </div>
        );
    }
}

export default Chrono
