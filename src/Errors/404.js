import React from 'react';
import './error.css';
import { Button, Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

class Page404 extends React.Component {
    render() {
        return (
            <Container className='error'>
                <Row xs={1}>
                    <Col>
                        <h1>Ouch !</h1>
                        <h2>It seem this page don't exist</h2>
                    </Col>
                    <Col>
                        <img className="error404" src={process.env.PUBLIC_URL + '/error_404.png'} alt="Snap! The error 404 images won't load either !"/>
                    </Col>
                    <Col>
                        <Link to='/'>
                            <Button size="lg" className="bg-secondary">Back to a safer zone</Button>
                        </Link>
                    </Col>
                </Row>
            </Container>
        );
    }
}

export default Page404;
