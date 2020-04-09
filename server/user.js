const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {type: String, unique: true},
    password: {type: String}
});

const UserModel = mongoose.model('Users', userSchema);
module.exports = UserModel;
