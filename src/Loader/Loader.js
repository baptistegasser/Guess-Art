import React from 'react';
import './Loader.css';
import { Container, Row, Col } from 'react-bootstrap';

class Loader extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            dotCount: 0
        }
        this.dotInterval = undefined;
    }

    componentDidMount() {
        this.dotInterval = setInterval(this.updateDots.bind(this), 500)
    }

    updateDots() {
        let newDotCount = this.state.dotCount + 1;
        if (this.state.dotCount >= 3) {
            newDotCount = 0;
        }

        this.setState({ dotCount: newDotCount });
    }

    componentWillUnmount() {
        if (this.dotInterval !== undefined) {
            clearInterval(this.dotInterval);
            this.dotInterval = undefined;
        }
    }

    render() {
        return (
            <div className='loader-container'>
                <div className="loader">
                    <Container>
                        <Row xs={2} noGutters>
                            <Col>
                                <div className='rectangle' id='rect-1'/>
                                <div className='rectangle' id='rect-3'/>
                            </Col>
                            <Col>
                                <div className='rectangle' id='rect-2'/>
                                <div className='rectangle' id='rect-4'/>
                            </Col>
                        </Row>
                    </Container>
                </div>
                <h1>Loading{'.'.repeat(this.state.dotCount)}</h1>
            </div>
        );
    }
}

export default Loader;
