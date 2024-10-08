const mongoose = require('mongoose');

// Subdocument schema for emergency contacts
const emergencyContactsSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    phoneNumber: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        trim: true,
        toLowerCase: true,
    },
    // relation: {
    //     type: String,
    //     required: true,
    // },
    contactId: {
      type: String,
      required: true,
    },
});

// Main user schema
const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true,
    },
    gender: {
        type: String,
        required: true,
        enum: ["male", "female"],
        trim: true,
    },
    phoneNumber: {
        type: String,
        required: true,
    },
    emergencyContacts: [emergencyContactsSchema],
    address: {
        type: String,
        required: true,
    },
    profilePic:{
        type: String
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        toLowerCase: true,
    },
    password: {
        type: String,
    },
    // userToken:{
    //     type: String,
    // },
    blackList: [{
        token: { type: String },
        expiresAt: { type: Date }
    }],
    isAdmin: {
        type: Boolean,
        default: false,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    isDeactivate: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

const UserModel = mongoose.model('Alertify', userSchema);

module.exports = UserModel;
