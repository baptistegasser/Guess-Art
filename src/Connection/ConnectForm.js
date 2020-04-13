import React from "react";
import { Container, Form, Button, Alert, Row, Col } from "react-bootstrap";
import './form.css';

class ConnectForm extends React.Component {
    render() {
        let i = 0;
        let error_alert;

        // If the error message is a non empty string, create an error Alert
        if (typeof this.props.error_msg === 'string' && this.props.error_msg.trim().length > 0) {
            error_alert = (
                <Alert key='error' variant='danger' className="text-center">
                    {this.props.error_msg.split('\n').map(line => { return(<p key={i++}>{line}</p>); }) }
                </Alert>
            );
        }

        return (
            <Container className="h-100">
                <Row xs="1">
                    <Col lg={{span: 6, offset: 3}} sm={{span: 8, offset: 2}} className="bg-primary form-background">
                        <Form onSubmit={this.props.onSubmit}>
                            <Form.Group>
                                {error_alert}
                            </Form.Group>
                            {this.props.children}
                            <Form.Group className="text-center" style={{marginTop: "60px"}}>
                                <Button type='submit' className="bg-secondary">{this.props.submit_text}</Button>
                            </Form.Group>
                        </Form>
                        <div className="text-center">
                            {this.props.link === undefined ? '' : this.props.link }
                        </div>
                    </Col>
                </Row>
            </Container>
        );
    }
}

export default ConnectForm;
