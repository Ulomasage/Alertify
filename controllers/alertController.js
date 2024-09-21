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



// const axios = require('axios');
// const useragent = require('useragent');
// const UserModel = require('../models/userModel');
// const sendMail = require('../helpers/sendMail');
// const twilioClient = require('../helpers/twiloConfig');
// require('dotenv').config();
// const { generateDistressTemplate } = require('../helpers/htmlTemplate');
// const DistressReport = require('../models/reportsModel');

// //Function to get client IP address
// function getClientIp(req) {
//     /**
//      * Retrieves the client IP address from the request headers.
//      * 
//      * @param {Object} req - The incoming request object.
//      * @returns {string} The client IP address.
//      */
//     const forwarded = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
//     return forwarded ? forwarded.split(',')[0] : req.ip;
// }

// // Function to get location from IP address using IP-API
// async function getLocation(ip) {
//     /**
//      * Retrieves the location information from the IP address using IP-API.
//      * 
//      * @param {string} ip - The client IP address.
//      * @returns {Object} The location information (city, region, country, latitude, longitude).
//      */
//     try {
//         // Fallback for localhost or private network IPs
//         if (ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
//             return { city: 'Localhost', lat: null, lon: null };
//         }

//         const response = await axios.get(`http://ip-api.com/json/${ip}?fields=city,region,country,lat,lon`);
//         if (response.data && response.data.city) {
//             return {
//                 city: response.data.city,
//                 region: response.data.region,
//                 country: response.data.country,
//                 latitude: response.data.lat,
//                 longitude: response.data.lon
//             };
//         } else {
//             // If IP-API fails, use browser's geolocation API as fallback
//             return await getBrowserLocation();
//         }
//     } catch (error) {
//         console.error('Error fetching location from IP-API:', error.message);
//         return await getBrowserLocation();
//     }
// }

// // Function to get browser location
// async function getBrowserLocation() {
//     try {
//         // Use browser's geolocation API to retrieve user's location
//         const position = await navigator.geolocation.getCurrentPosition();
//         return {
//             city: null,
//             region: null,
//             country: null,
//             latitude: position.coords.latitude,
//             longitude: position.coords.longitude
//         };
//     } catch (error) {
//         console.error('Error fetching location from browser:', error.message);
//         return {
//             city: 'Unknown',
//             region: 'Unknown',
//             country: 'Unknown',
//             latitude: null,
//             longitude: null
//         };
//     }
// }

// // Function to reverse geocode latitude and longitude using OpenStreetMap's Nominatim
// async function reverseGeocode(lat, lon) {
//     /**
//      * Retrieves the precise location information from the latitude and longitude using OpenStreetMap's Nominatim.
//      * 
//      * @param {number} lat - The latitude.
//      * @param {number} lon - The longitude.
//      * @returns {string} The precise location information.
//      */
//     try {
//         const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
//         if (response.data && response.data.display_name) {
//             return response.data.display_name;
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
//     /**
//      * Retrieves the device information (mobile or desktop) from the request headers.
//      * 
//      * @param {Object} req - The incoming request object.
//      * @returns {Object} The device information (deviceType, userAgent).
//      */
//     const agent = useragent.parse(req.headers['user-agent']);
//     const isMobile = agent.device.toString().toLowerCase().includes('mobile');
//     const deviceType = isMobile ? 'Mobile' : 'Desktop';
//     return {
//         deviceType,
//         userAgent: agent.toString()
//     };
// }

// // Function to send distress messages
// async function sendDistressMessages(user, preciseLocation, deviceInfo, ipAddress, lat, lon, timestamp) {
//     /**
//      * Sends distress messages (both email and SMS) to the user's emergency contacts.
//      * 
//      * @param {Object} user - The user object.
//      * @param {string} preciseLocation - The precise location information.
//      * @param {Object} deviceInfo - The device information (deviceType, userAgent).
//      * @param {string} ipAddress - The client IP address.
//      * @param {number} lat - The latitude.
//      * @param {number} lon - The longitude.
//      * @param {string} timestamp - The current timestamp.
//      */
//     const subject = "Emergency Alert: Immediate Attention Required!";
    
//     // Use the updated HTML template for distress message
//     const htmlTemplate = generateDistressTemplate(user, preciseLocation, deviceInfo, ipAddress, lat, lon);

//     // Filter emergency contacts into emails and phone numbers
//     const emailContacts = user.emergencyContacts.filter(contact => contact.email);
//     const phoneContacts = user.emergencyContacts.filter(contact => contact.phoneNumber);

//     // Send email to each emergency contact with an email
//     const emailPromises = emailContacts.map(contact => {
//         return sendMail({
//             email: contact.email,
//             subject: subject,
//             html: htmlTemplate, // Use the generated HTML template
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
//     try {
//         const userId = req.user.id || req.user._id || req.user.userId;
//         const user = await UserModel.findById(userId);
//         if (!user) {
//             return res.status(404).json({ message: 'User not found' });
//         }

//         const { latitude, longitude, accuracy } = req.body;
//         if (!latitude || !longitude) {
//             return res.status(400).json({ message: 'Location data is required.' });
//         }

//         // Ensure location accuracy is sufficient (e.g., less than 30 meters)
//         if (accuracy && accuracy > 30) {
//             return res.status(400).json({ message: 'Location accuracy is too low.' });
//         }

//         const preciseLocation = await reverseGeocode(latitude, longitude);
//         const deviceInfo = getUserAgentDetails(req);
//         const timestamp = new Date().toISOString();

//         // Save the distress report to the database
//         const distressReport = new DistressReport({
//             userId: user._id,
//             preciseLocation,
//             latitude,
//             longitude,
//             deviceInfo,
//             timestamp,
//         });
//         await distressReport.save(); // Save the report

//         user.lastKnownLocation = preciseLocation;
//         await user.save();

//         await sendDistressMessages(user, preciseLocation, deviceInfo, req.ip, latitude, longitude, timestamp);

//         return res.status(200).json({ message: 'Distress alert triggered successfully' });
//     } catch (error) {
//         console.error('Error triggering distress alert:', error.message);
//         return res.status(500).json({ message: 'Internal Server Error' });
//     }
// };

// module.exports = {
//     triggerDistressAlert,
// };





// const axios = require('axios');
// const useragent = require('useragent');
// const UserModel = require('../models/userModel');
// const sendMail = require('../helpers/sendMail');
// const twilioClient = require('../helpers/twiloConfig');
// require('dotenv').config();
// const { generateDistressTemplate } = require('../helpers/htmlTemplate');
// const DistressReport = require('../models/reportsModel');

// // Function to get client IP address
// function getClientIp(req) {
//     const forwarded = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
//     return forwarded ? forwarded.split(',')[0] : req.ip;
// }

// // Fallback to get location using IP-API if geolocation is not available
// async function getLocationFallback(ip) {
//     try {
//         // If using localhost, return a default location
//         if (ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
//             return { city: 'Localhost', lat: null, lon: null };
//         }

//         const response = await axios.get(`http://ip-api.com/json/${ip}?fields=city,region,country,lat,lon`);
//         if (response.data && response.data.city) {
//             return {
//                 city: response.data.city,
//                 region: response.data.region,
//                 country: response.data.country,
//                 latitude: response.data.lat,
//                 longitude: response.data.lon
//             };
//         }
//         return { city: 'Unknown', region: 'Unknown', country: 'Unknown', latitude: null, longitude: null };
//     } catch (error) {
//         console.error('Error fetching location from IP-API:', error.message);
//         return { city: 'Unknown', region: 'Unknown', country: 'Unknown', latitude: null, longitude: null };
//     }
// }

// // Function to reverse geocode latitude and longitude using OpenStreetMap's Nominatim
// async function reverseGeocode(lat, lon) {
//     try {
//         const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
//         if (response.data && response.data.display_name) {
//             return response.data.display_name;
//         }
//         return 'Unknown precise location';
//     } catch (error) {
//         console.error('Error fetching precise location:', error.message);
//         return 'Unknown precise location';
//     }
// }

// // Function to get device details (mobile or desktop)
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
// async function sendDistressMessages(user, preciseLocation, deviceInfo, ipAddress, lat, lon, timestamp) {
//     const subject = "Emergency Alert: Immediate Attention Required!";
//     const htmlTemplate = generateDistressTemplate(user, preciseLocation, deviceInfo, ipAddress, lat, lon);

//     const emailContacts = user.emergencyContacts.filter(contact => contact.email);
//     const phoneContacts = user.emergencyContacts.filter(contact => contact.phoneNumber);

//     const emailPromises = emailContacts.map(contact => {
//         return sendMail({
//             email: contact.email,
//             subject: subject,
//             html: htmlTemplate
//         }).then(() => {
//             console.log(`Email sent to ${contact.email}`);
//         }).catch(error => {
//             console.error(`Error sending email to ${contact.email}:`, error.message);
//         });
//     });

//     await Promise.all(emailPromises);

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

// // Main function to trigger the distress alert
// const triggerDistressAlert = async (req, res) => {
//     try {
//         const userId = req.user.id || req.user._id || req.user.userId;
//         const user = await UserModel.findById(userId);
//         if (!user) {
//             return res.status(404).json({ message: 'User not found' });
//         }

//         let { latitude, longitude, accuracy } = req.body;

//         // If geolocation is not available or permission is denied
//         if (!latitude || !longitude) {
//             console.log('Falling back to IP-based location...');
//             const ip = getClientIp(req);
//             const locationFallback = await getLocationFallback(ip);
//             latitude = locationFallback.latitude;
//             longitude = locationFallback.longitude;
//         }

//         // Check if location data is still missing after the fallback
//         if (!latitude || !longitude) {
//             return res.status(400).json({ message: 'Unable to retrieve location. Please try again.' });
//         }

//         // Ensure location accuracy is sufficient
//         if (accuracy && accuracy > 30) {
//             return res.status(400).json({ message: 'Location accuracy is too low.' });
//         }

//         const preciseLocation = await reverseGeocode(latitude, longitude);
//         const deviceInfo = getUserAgentDetails(req);
//         const timestamp = new Date().toISOString();

//         // Save the distress report to the database
//         const distressReport = new DistressReport({
//             userId: user._id,
//             preciseLocation,
//             latitude,
//             longitude,
//             deviceInfo,
//             timestamp,
//         });
//         await distressReport.save();

//         user.lastKnownLocation = preciseLocation;
//         await user.save();

//         await sendDistressMessages(user, preciseLocation, deviceInfo, req.ip, latitude, longitude, timestamp);

//         return res.status(200).json({ message: 'Distress alert triggered successfully' });
//     } catch (error) {
//         console.error('Error triggering distress alert:', error.message);
//         return res.status(500).json({ message: 'Internal Server Error' });
//     }
// };

// module.exports = {
//     triggerDistressAlert,
// };


// const triggerDistressAlert = async (req, res) => {
//     /**
//      * Triggers the distress alert and sends messages to the user's emergency contacts.
//      * 
//      * @param {Object} req - The incoming request object.
//      * @param {Object} res - The outgoing response object.
//      */
//     try {
//         // Get user ID from the token in headers
//         const userId = req.user.id || req.user._id || req.user.userId;
//         console.log("User ID from token:", userId);

//         // Fetch user from the database
//         const user = await UserModel.findById(userId);
//         if (!user) {
//             return res.status(404).json({ message: 'User not found' });
//         }

//         // Get the client IP and location
//         const clientIp = getClientIp(req);
//         const location = await getLocation(clientIp);

//         // Reverse geocode the latitude and longitude for precise location
//         let preciseLocation = location.city === 'Localhost' || location.city === 'Unknown' 
//             ? location.city 
//             : await reverseGeocode(location.latitude, location.longitude);

//         // Get device info (mobile/desktop)
//         const deviceInfo = getUserAgentDetails(req);

//         // Get the current timestamp when the distress alert is triggered
//         const timestamp = new Date().toISOString();

//         // Save the IP and location details to the database (optional)
//         user.lastKnownIp = clientIp;
//         user.lastKnownLocation = preciseLocation;
//         await user.save();

//         // Send distress messages to emergency contacts
//         await sendDistressMessages(user, preciseLocation, deviceInfo, clientIp, location.latitude, location.longitude, timestamp);

//         // Return a success response
//         return res.status(200).json({ message: 'Distress alert triggered successfully' });
//     } catch (error) {
//         console.error('Error triggering distress alert:', error.message);
//         return res.status(500).json({ message: 'Internal Server Error' });
//     }
// };



const axios = require('axios');
const useragent = require('useragent');
const UserModel = require('../models/userModel');
const sendMail = require('../helpers/sendMail');
const twilioClient = require('../helpers/twiloConfig');
require('dotenv').config();
const { generateDistressTemplate } = require('../helpers/htmlTemplate');
const DistressReport = require('../models/reportsModel');

// Function to get client IP address
function getClientIp(req) {
    const forwarded = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    return forwarded ? forwarded.split(',')[0] : req.ip;
}

// Fallback to get location using IP-API if geolocation is not available
async function getLocationFallback(ip) {
    try {
        // Try to get the user's location using the browser's geolocation API
        const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 5000,
            });
        });

        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        // If geolocation is successful, return the location data
        if (lat && lon) {
            return {
                city: null,
                region: null,
                country: null,
                latitude: lat,
                longitude: lon,
            };
        }

        // If geolocation fails, use IP-based geolocation as a fallback
        const response = await axios.get(`http://ip-api.com/json/${ip}?fields=city,region,country,lat,lon`);
        if (response.data && response.data.city) {
            return {
                city: response.data.city,
                region: response.data.region,
                country: response.data.country,
                latitude: response.data.lat,
                longitude: response.data.lon,
            };
        }

        // If IP-based geolocation also fails, return a default location
        return {
            city: 'Unknown',
            region: 'Unknown',
            country: 'Unknown',
            latitude: null,
            longitude: null,
        };
    } catch (error) {
        console.error('Error fetching location:', error.message);
        return {
            city: 'Unknown',
            region: 'Unknown',
            country: 'Unknown',
            latitude: null,
            longitude: null,
        };
    }
}

// Function to reverse geocode latitude and longitude using OpenStreetMap's Nominatim
async function reverseGeocode(lat, lon) {
    try {
        const response = await axios.get(`https://nominatim.openstreetMap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
        if (response.data && response.data.display_name) {
            return response.data.display_name;
        }
        return 'Unknown precise location';
    } catch (error) {
        console.error('Error fetching precise location:', error.message);
        return 'Unknown precise location';
    }
}

// Function to get device details (mobile or desktop)
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
    const htmlTemplate = generateDistressTemplate(user, preciseLocation, deviceInfo, ipAddress, lat, lon);

    const emailContacts = user.emergencyContacts.filter(contact => contact.email);
    const phoneContacts = user.emergencyContacts.filter(contact => contact.phoneNumber);

    const emailPromises = emailContacts.map(contact => {
        return sendMail({
            email: contact.email,
            subject: subject,
            html: htmlTemplate
        }).then(() => {
            console.log(`Email sent to ${contact.email}`);
        }).catch(error => {
            console.error(`Error sending email to ${contact.email}:`, error.message);
        });
    });

    await Promise.all(emailPromises);

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

// Main function to trigger the distress alert
const triggerDistressAlert = async (req, res) => {
    try {
        const userId = req.user.id || req.user._id || req.user.userId;
        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        let { latitude, longitude, accuracy } = req.body;

        // If geolocation is not available or permission is denied
        if (!latitude || !longitude) {
            console.log('Falling back to IP-based location...');
            const ip = getClientIp(req);
            const locationFallback = await getLocationFallback(ip);
            latitude = locationFallback.latitude;
            longitude = locationFallback.longitude;
        }

        // Check if location data is still missing after the fallback
        if (!latitude || !longitude) {
            return res.status(400).json({ message: 'Unable to retrieve location. Please try again.' });
        }

        // Ensure location accuracy is sufficient
        if (accuracy && accuracy > 30) {
            return res.status(400).json({ message: 'Location accuracy is too low.' });
        }

        const preciseLocation = await reverseGeocode(latitude, longitude);
        const deviceInfo = getUserAgentDetails(req);
        const timestamp = new Date().toISOString();

        // Save the distress report to the database
        const distressReport = new DistressReport({
            userId: user._id,
            preciseLocation,
            latitude,
            longitude,
            deviceInfo,
            timestamp,
        });
        await distressReport.save();

        user.lastKnownLocation = preciseLocation;
        await user.save();

        await sendDistressMessages(user, preciseLocation, deviceInfo, req.ip, latitude, longitude, timestamp);

        return res.status(200).json({ message: 'Distress alert triggered successfully' });
    } catch (error) {
        console.error('Error triggering distress alert:', error.message);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

module.exports = {
    triggerDistressAlert,
};