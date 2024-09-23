const mongoose = require('mongoose');


const deactivateSchema = new mongoose.Schema({
    email: {
        type: String
    }
}, { timestamps: true });

const deactivateModel = mongoose.model('deactivated', deactivateSchema);

module.exports = deactivateModel;
