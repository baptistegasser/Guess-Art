import React from "react";
import ReactDOM from 'react-dom';
import { Container, Form, Button, Alert } from "react-bootstrap";

class ConnectForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = { error_holder: undefined };
        this.displayError = this.displayError.bind(this);
    }

    componentDidMount() {
        this.setState({ error_holder: document.getElementById('ErrorHolder') });
    }

    displayError(message) {
        if (this.state.error_holder === undefined) return;

        const alert = (
        <Alert key='error' variant='danger'>
            <p>{message}</p>
        </Alert>
        );

        // https://tinyurl.com/sf7vw76
        ReactDOM.unmountComponentAtNode(this.state.error_holder);
        ReactDOM.render(alert, this.state.error_holder);
    }

    render() {
        return (
            <Container>
                <Form onSubmit={this.props.onSubmit}>
                    <Form.Group id='ErrorHolder'>
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