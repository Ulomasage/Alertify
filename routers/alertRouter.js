const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alertController'); 
const { getUserIdFromToken } = require('../middleware/authorization');
const { submitDescription,getAllReports,getResolvedReports,resolveReport } = require('../controllers/descreptionController');
const {addEmergencyContact,updateEmergencyContact,deleteEmergencyContact, getAllEmergencyContacts,reportFalseAlarm } = require('../controllers/manageEmergencyContacts')
const { authentication, isAdmin } = require('../middleware/authorization.js')

router.post('/distress', getUserIdFromToken,alertController.triggerDistressAlert);
router.post('/false-alarm', getUserIdFromToken,alertController.reportFalseAlarm);
router.post('/submit-description', getUserIdFromToken,submitDescription);
router.post('/add-emergencyContact', getUserIdFromToken,addEmergencyContact);
router.put('/update-contact', getUserIdFromToken,updateEmergencyContact);
router.put('/delete-contact', getUserIdFromToken,deleteEmergencyContact);
router.get('/all-contacts',getUserIdFromToken, getAllEmergencyContacts)
router.get('/all-reports',isAdmin, getAllReports)
router.get('/resolveReport',isAdmin, resolveReport)
module.exports = router;





