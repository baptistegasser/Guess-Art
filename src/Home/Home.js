import React from 'react';
import './Home.css';
import { Container, Button, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';


class Home extends React.Component {

    render() {
        return (
        <Container className="h-100">
            <Row xs={1}>
                <Col className='text-center'>
                    <h1>Guess Art</h1>
                </Col>
                <Col className='text-center'>
                    <p>A fun online about drawing and mysterious words...</p>
                </Col>
            </Row>
            <Row>
                <Col className='text-center'>
                    <Link to="/signin">
                        <Button>login</Button>
                    </Link>
                </Col>
            </Row>
        </Container>
        );
    }
};

export default Home;
