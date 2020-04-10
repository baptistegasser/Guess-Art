import React from "react";
import { Container, Form, Button, Alert } from "react-bootstrap";

class ConnectForm extends React.Component {
    render() {
        let i = 0;
        let error_alert;

        // If the error message is a non empty string, create an error Alert
        if (typeof this.props.error_msg === 'string' && this.props.error_msg.trim().length > 0) {
            error_alert = (
                <Alert key='error' variant='danger'>
                    {this.props.error_msg.split('\n').map(line => { return(<p key={i++}>{line}</p>); }) }
                </Alert>
            );
        }

        return (
            <Container>
                <Form onSubmit={this.props.onSubmit}>
                    <Form.Group>
                        {error_alert}
                    </Form.Group>
                        {this.props.children}
                    <Form.Group>
                        <Button type='submit'>{this.props.submit_text}</Button>
                    </Form.Group>
                </Form>
            </Container>
        );
    }
}

export default ConnectForm;
