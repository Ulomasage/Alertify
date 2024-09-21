const mongoose = require('mongoose');

const DistressReportSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Alertify', required: true },
    preciseLocation: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    deviceInfo: { type: Object, required: true },
    timestamp: { type: Date, default: Date.now },
    status: { type: String, enum: ['Pending', 'Resolved'], default: 'Pending' },
    description:[ { type: String } ]
});

const DistressReport = mongoose.model('DistressReport', DistressReportSchema);
module.exports = DistressReport;