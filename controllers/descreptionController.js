const DescriptionModel = require('../models/descreptionModel');
const UserModel = require('../models/userModel');
const sendMail = require('../helpers/sendMail');
const twilioClient = require('../helpers/twiloConfig');
const reportModel = require('../models/reportsModel');
const DistressReport = require('../models/reportsModel')

// Function to handle description submission
const submitDescription = async (req, res) => {
    const userId = req.user.id || req.user._id || req.user.userId;
    const { description } = req.body;

    try {
        // Fetch user and their emergency contacts
        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Save the description in the description collection (if needed)
        const newDescription = new DescriptionModel({
            userId: userId,
            description: description,
        });
        await newDescription.save();

        // Find the relevant distress report by userId
        const distressReport = await reportModel.findOne({ userId });
        if (!distressReport) {
            return res.status(404).json({ message: 'Distress report not found' });
        }

        // Push the description to the description array of the distress report
        distressReport.description.push(description);
        await distressReport.save();

        // Create distress alert update message
        const message = `
            <h1>Distress Alert Update!</h1>
            <p>The user ${user.fullName} provided an additional description.</p>
            <p><b>Description:</b> ${description}</p>
            <p><b>Phone Number:</b> ${user.phoneNumber}</p>
            <p><b>Email:</b> ${user.email}</p>
        `;

        // Iterate over emergency contacts to send emails and SMS
        const contactPromises = user.emergencyContacts.map(contact => {
            const emailPromise = sendMail({
                email: contact.email,
                subject: 'Distress Alert Update',
                html: message,
            }).then(() => {
                console.log(`Email sent to ${contact.email}`);
            }).catch(error => {
                console.error(`Error sending email to ${contact.email}:`, error.message);
            });

            const smsPromise = twilioClient.messages.create({
                body: `Distress Alert Update! The user ${user.fullName} provided an additional description: "${description}".`,
                from: process.env.TWILIO_PHONE_NUMBER,
                to: contact.phoneNumber,
            }).then(() => {
                console.log(`SMS sent to ${contact.phoneNumber}`);
            }).catch(error => {
                console.error(`Error sending SMS to ${contact.phoneNumber}:`, error.message);
            });

            return Promise.all([emailPromise, smsPromise]);
        });

        // Await all email and SMS promises
        await Promise.all(contactPromises);

        res.json({ message: 'Description submitted and distress messages updated successfully' });
    } catch (error) {
        console.error('Error submitting description:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getAllReports = async (req, res) => {
        try {
            const reports = await DistressReport.find().populate('userId', 'fullName email'); // Populate user details
            return res.status(200).json(reports);
        } catch (error) {
            console.error('Error fetching reports:', error.message);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    };

    const getResolvedReports = async (req, res) => {
        try {
          // Find all distress reports where the status is 'Resolved'
          const resolvedReports = await DistressReport.find({ status: 'Resolved' }).populate('userId', 'fullName email'); // Adjust the fields populated as needed
      
          if (!resolvedReports.length) {
            return res.status(404).json({ message: 'No resolved reports found' });
          }
      
          return res.status(200).json(resolvedReports);
        } catch (error) {
          console.error('Error fetching resolved reports:', error.message);
          return res.status(500).json({ message: 'Internal Server Error' });
        }
      };
    

      const resolveReport = async (req, res) => {
        try {
          const { reportId } = req.body; // Get the report ID from the request parameters
      
          // Find the report by its ID and update the status to 'Resolved'
          const updatedReport = await DistressReport.findByIdAndUpdate(
            reportId, // The ID of the report to update
            { $set: { status: 'Resolved' } }, // Update operation to set status to 'Resolved'
            { new: true } // Return the updated report after the update
          );
      
          if (!updatedReport) {
            return res.status(404).json({ message: 'Report not found' });
          }
      
          return res.status(200).json({
            message: 'Report has been resolved successfully',
            report: updatedReport,
          });
        } catch (error) {
          console.error('Error resolving report:', error.message);
          return res.status(500).json({ message: 'Internal Server Error' });
        }
      };
      
    

module.exports = {
    submitDescription,
    getAllReports,
    getResolvedReports,
    resolveReport
};


// // Route to get all distress reports
// router.get('/reports', isAdmin, async (req, res) => {
//     try {
//         const reports = await DistressReport.find().populate('userId', 'fullName email'); // Populate user details
//         return res.status(200).json(reports);
//     } catch (error) {
//         console.error('Error fetching reports:', error.message);
//         return res.status(500).json({ message: 'Internal Server Error' });
//     }
// });

// module.exports = router;