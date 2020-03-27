class Verification {

    static getMessage() {
        return this.last_msg;
    }

    static setMessage(msg) {
        this.last_msg = msg;
    }

    // Do the required check for a generic string
    static checkString(str, name) {
        const field = name === undefined ? 'Field' : name;
        
        // Ensure there is data to test
        if (str === undefined) {
            this.setMessage(`${field} contain no value !`);
            console.log("check 1");
            return false;
        }

        // Ensure we are checking a string
        if (typeof str !== 'string') {
            this.setMessage(`${field} contain unreadable value !`);
            console.log("check 2");
            return false;
        }

        // Ensure there is no matching with spaces regex
        if (this.space_regex.test(str)) {
            this.setMessage(`${field} can't contain space or white chars !`);
            console.log("check 3");
            return false;
        }
        // Ensure the string is not empty
        if (str.length < 1) {
            this.setMessage(`${field} can't be empty !`);
            console.log("check 4");
            return false;
        }
    }

    // Do the required check for a password
    static checkPassword(password, password_2) {
        // Ensure the password pass regular string checks
        if (!this.checkString(password, 'Password')) {
            return false;
        }
        // Ensure the password match the specification regex
        if (!this.password_regex.test(password)) {
            this.setMessage('Password must contain 8 chars with 1 UPPER, 1 lower, 1 number and 1 special char !');
            return false;
        }
        // Ensure passwords match
        if (password_2 !== undefined && password !== password_2) {
            this.setMessage('Passwords must match !');
            return false;
        }
    }
}
// Static message from the last error
Verification.last_msg = 'undefined';

// Password regex: 8 char min, 1 upper, 1 lower, 1 number, 1 special
Verification.password_regex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&\\/*])(?=.{8,})");

// White chars regex
Verification.space_regex = /\s/;

module.exports = Verification;