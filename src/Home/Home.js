import React from 'react';
import './Home.css';
import { Container, Button, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';


class Home extends React.Component {

    render() {
        return (
        <Container fluid className="h-100 text">
            <Row xs={1} className="align-item-center text-center">
                <Col lg={{ span: 8, offset: 2 }} className="bg-primary presentation">
                    <h1 className="title">Guess Art</h1>
                    <p>A fun online about drawing and mysterious words...</p>
                    <p>As the "<b>Boss</b>" your goal is to draw the mysterious word given to you such as other player will be able to guess it.</p>
                    <p>As one of the "<b>Guesser</b>", your goal is to find the mysterious word, the faster you are compared to other player, the more point you will get !</p>
                </Col>
            </Row>
            <Row>
                <Col className='text-center'>
                    <Link to="/signin">
                        <Button size="lg" className="bg-secondary">Start playing</Button>
                    </Link>
                </Col>
            </Row>
        </Container>
        );
    }
};

export default Home;
