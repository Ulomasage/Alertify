// const axios = require('axios');
// const useragent = require('useragent');
// const UserModel = require('../models/userModel');
// const sendMail = require('../helpers/sendMail');     
// const twilioClient = require('../helpers/twiloConfig'); 
// require('dotenv').config();
// const getUserIdFromToken = require('../middleware/authorization');
// const {generateDistressTemplate} = require('../helpers/htmlTemplate');

// // Function to get client IP address
// function getClientIp(req) {
//     const forwarded = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
//     return forwarded ? forwarded.split(',')[0] : req.ip;
// }

// // Function to get location from IP address using IP-API
// async function getLocation(ip) {
//     try {
//         if (ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
//             return 'Localhost'; // Fallback for localhost or private network IPs
//         }

//         const response = await axios.get(`https://ipapi.co/${ip}/json/`);
//         if (response.data && response.data.city) {
//             return {
//                 city: response.data.city,
//                 region: response.data.region,
//                 country: response.data.country_name,
//                 latitude: response.data.latitude,
//                 longitude: response.data.longitude
//             };
//         } else {
//             return 'Unknown location';
//         }
//     } catch (error) {
//         console.error('Error fetching location from IP-API:', error.message);
//         return 'Unknown location';
//     }
// }

// // Function to reverse geocode latitude and longitude to a more precise location
// async function reverseGeocode(lat, lon) {
//     try {
//         const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=YOUR_GOOGLE_API_KEY`);
//         if (response.data && response.data.results && response.data.results.length > 0) {
//             return response.data.results[0].formatted_address;
//         } else {
//             return 'Unknown precise location';
//         }
//     } catch (error) {
//         console.error('Error fetching precise location:', error.message);
//         return 'Unknown precise location';
//     }
// }

// // Function to determine if the device is mobile or desktop
// function getUserAgentDetails(req) {
//     const agent = useragent.parse(req.headers['user-agent']);
//     const isMobile = agent.device.toString().toLowerCase().includes('mobile');
//     const deviceType = isMobile ? 'Mobile' : 'Desktop';
//     return {
//         deviceType,
//         userAgent: agent.toString()
//     };
// }

// // Function to send distress messages
// async function sendDistressMessages(user, preciseLocation, deviceInfo) {
//     const subject = "Emergency Alert: Immediate Attention Required!";
    
//     const message = generateDistressTemplate(user, preciseLocation, deviceInfo);

//     // Filter emergency contacts into emails and phone numbers
//     const emailContacts = user.emergencyContacts.filter(contact => contact.email);
//     const phoneContacts = user.emergencyContacts.filter(contact => contact.phoneNumber);

//     // Send email to each emergency contact with an email
//     const emailPromises = emailContacts.map(contact => {
//         return sendMail({
//             email: contact.email,
//             subject: subject,
//             html: message,
//         }).then(() => {
//             console.log(`Email sent to ${contact.email}`);
//         }).catch(error => {
//             console.error(`Error sending email to ${contact.email}:`, error.message);
//         });
//     });

//     await Promise.all(emailPromises);

//     // Send SMS to each emergency contact with a phone number
//     const smsPromises = phoneContacts.map(contact => {
//         return twilioClient.messages.create({
//             body: `Distress Alert! The user ${user.fullName} is in danger. Location: ${preciseLocation}. Please contact them immediately.`,
//             from: process.env.TWILIO_PHONE_NUMBER,
//             to: contact.phoneNumber,
//         }).then(() => {
//             console.log(`SMS sent to ${contact.phoneNumber}`);
//         }).catch(error => {
//             console.error(`Error sending SMS to ${contact.phoneNumber}:`, error.message);
//         });
//     });

//     await Promise.all(smsPromises);
// }


// const triggerDistressAlert = async (req, res) => {
//     // Get user ID from the token in headers
//     const userId = req.user.id || req.user._id || req.user.userId; 
//     console.log("User ID from token:", userId);

//     const user = await UserModel.findById(userId);
//     if (!user) {
//         return res.status(404).json({ message: 'User not found' });
//     }

//     const clientIp = getClientIp(req);
//     const location = await getLocation(clientIp);
//     const preciseLocation = await reverseGeocode(location.latitude, location.longitude);

//     // Get device info
//     const deviceInfo = getUserAgentDetails(req);

//     // Send distress messages (both email and SMS)
//     await sendDistressMessages(user, preciseLocation, deviceInfo);

//     res.json({ message: 'Distress messages sent successfully' });
// };

// module.exports = {
//     triggerDistressAlert,
// };



const axios = require('axios');
const useragent = require('useragent');
const UserModel = require('../models/userModel');
const sendMail = require('../helpers/sendMail');
const twilioClient = require('../helpers/twiloConfig');
require('dotenv').config();
const { generateDistressTemplate } = require('../helpers/htmlTemplate');

// Function to get client IP address
function getClientIp(req) {
    const forwarded = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    return forwarded ? forwarded.split(',')[0] : req.ip;
}

// Function to get location from IP address using IP-API
async function getLocation(ip) {
    try {
        // Fallback for localhost or private network IPs
        if (ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
            return { city: 'Localhost', lat: null, lon: null };
        }

        const response = await axios.get(`http://ip-api.com/json/${ip}?fields=city,region,country,lat,lon`);
        if (response.data && response.data.city) {
            return {
                city: response.data.city,
                region: response.data.region,
                country: response.data.country,
                latitude: response.data.lat,
                longitude: response.data.lon
            };
        } else {
            return { city: 'Unknown', lat: null, lon: null };
        }
    } catch (error) {
        console.error('Error fetching location from IP-API:', error.message);
        return { city: 'Unknown', lat: null, lon: null };
    }
}

// Function to reverse geocode latitude and longitude using OpenStreetMap's Nominatim
async function reverseGeocode(lat, lon) {
    try {
        const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
        if (response.data && response.data.display_name) {
            return response.data.display_name;
        } else {
            return 'Unknown precise location';
        }
    } catch (error) {
        console.error('Error fetching precise location:', error.message);
        return 'Unknown precise location';
    }
}

// Function to determine if the device is mobile or desktop
function getUserAgentDetails(req) {
    const agent = useragent.parse(req.headers['user-agent']);
    const isMobile = agent.device.toString().toLowerCase().includes('mobile');
    const deviceType = isMobile ? 'Mobile' : 'Desktop';
    return {
        deviceType,
        userAgent: agent.toString()
    };
}

// Function to send distress messages
async function sendDistressMessages(user, preciseLocation, deviceInfo, ipAddress, lat, lon, timestamp) {
    const subject = "Emergency Alert: Immediate Attention Required!";
    
    // Use the updated HTML template for distress message
    const htmlTemplate = generateDistressTemplate(user, preciseLocation, deviceInfo, ipAddress, lat, lon);

    // Filter emergency contacts into emails and phone numbers
    const emailContacts = user.emergencyContacts.filter(contact => contact.email);
    const phoneContacts = user.emergencyContacts.filter(contact => contact.phoneNumber);

    // Send email to each emergency contact with an email
    const emailPromises = emailContacts.map(contact => {
        return sendMail({
            email: contact.email,
            subject: subject,
            html: htmlTemplate, // Use the generated HTML template
        }).then(() => {
            console.log(`Email sent to ${contact.email}`);
        }).catch(error => {
            console.error(`Error sending email to ${contact.email}:`, error.message);
        });
    });

    await Promise.all(emailPromises);

    // Send SMS to each emergency contact with a phone number
    const smsPromises = phoneContacts.map(contact => {
        return twilioClient.messages.create({
            body: `Distress Alert! The user ${user.fullName} is in danger. Location: ${preciseLocation}. Please contact them immediately.`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: contact.phoneNumber,
        }).then(() => {
            console.log(`SMS sent to ${contact.phoneNumber}`);
        }).catch(error => {
            console.error(`Error sending SMS to ${contact.phoneNumber}:`, error.message);
        });
    });

    await Promise.all(smsPromises);
}

const triggerDistressAlert = async (req, res) => {
    try {
        // Get user ID from the token in headers
        const userId = req.user.id || req.user._id || req.user.userId;
        console.log("User ID from token:", userId);

        // Fetch user from the database
        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Get the client IP and location
        const clientIp = getClientIp(req);
        const location = await getLocation(clientIp);

        // Reverse geocode the latitude and longitude for precise location
        let preciseLocation = location.city === 'Localhost' || location.city === 'Unknown' 
            ? location.city 
            : await reverseGeocode(location.latitude, location.longitude);

        // Get device info (mobile/desktop)
        const deviceInfo = getUserAgentDetails(req);

        // Get the current timestamp when the distress alert is triggered
        const timestamp = new Date().toISOString();

        // Save the IP and location details to the database (optional)
        user.lastKnownIp = clientIp;
        user.lastKnownLocation = preciseLocation === 'Localhost' ? 'Localhost' : `${location.city}, ${location.region}, ${location.country}`;
        await user.save();

        // Send distress messages (both email and SMS)
        await sendDistressMessages(user, preciseLocation, deviceInfo, clientIp, location.latitude, location.longitude, timestamp);

        res.json({ message: 'Distress messages sent successfully' });
    } catch (error) {
        console.error("Error triggering distress alert:", error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    triggerDistressAlert,
};
