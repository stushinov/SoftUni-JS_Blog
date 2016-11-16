const mongoose = require('mongoose');

let roleSchema = mongoose.Schema({

    name: {type: String, required: true, unique: true},
    user: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}]
});

const Role = mongoose.model('Role', roleSchema);

module.exports = Role;