// helpers/htmlTemplate.js

const signUpTemplate = (verifyLink, fullName) => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
          <meta charset="UTF-8">
          <title>Welcome to ALERTIFY, your number one trusted security brand</title>
          <style>
              body {
                  font-family: Arial, sans-serif;
                  line-height: 1.6;
                  color: #333333;
                  background-color: #2c2c2c; /* Dark background */
                  margin: 0;
                  padding: 0;
              }
              .container {
                  width: 80%;
                  margin: 20px auto; /* Add some top margin */
                  padding: 20px;
                  border: 1px solid #ddd;
                  border-radius: 10px;
                  box-shadow: 0 0 10px rgba(0,0,0,0.1);
                  background-color: #f4f4f4; /* Light grey background */
              }
              .header {
                  background: #333333;
                  padding: 10px;
                  text-align: center;
                  border-bottom: 1px solid #ddd;
                  color: #ffffff;
              }
              .content {
                  padding: 20px;
                  color: #333333;
              }
              .footer {
                  background: #333333;
                  padding: 10px;
                  text-align: center;
                  border-top: 1px solid #ddd;
                  font-size: 0.9em;
                  color: #cccccc;
              }
              .button {
                  display: inline-block;
                  background-color: #000000;
                  color: #ffffff;
                  padding: 10px 20px;
                  text-decoration: none;
                  border-radius: 5px;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h1>Welcome to ALERTIFY!</h1>
              </div>
              <div class="content">
                  <p>Hello ${fullName},</p>
                  <p>Thank you for signing up on our platform. We are excited to have you on board.</p>
                  <p>Please click the button below to verify your account:</p>
                  <p>
                      <a href="${verifyLink}" class="button">Verify My Account</a>
                  </p>
                  <p>If you did not create an account, please ignore this email.</p>
                  <p>Best regards,<br> ALERTIFY TEAM </p>
              </div>
              <div class="footer">
                  <p>&copy; ${new Date().getFullYear()} . All rights reserved.</p>
              </div>
          </div>
      </body>
      </html>
    `;
  };
  
  const verifyTemplate = (verifyLink, fullName) => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
          <meta charset="UTF-8">
          <title>Verification Email</title>
          <style>
              body {
                  font-family: Arial, sans-serif;
                  line-height: 1.6;
                  color: #333333;
                  background-color: #2c2c2c; /* Dark background */
                  margin: 0;
                  padding: 0;
              }
              .container {
                  width: 80%;
                  margin: 20px auto; /* Add some top margin */
                  padding: 20px;
                  border: 1px solid #ddd;
                  border-radius: 10px;
                  box-shadow: 0 0 10px rgba(0,0,0,0.1);
                  background-color: #f4f4f4; /* Light grey background */
              }
              .header {
                  background: #333333;
                  padding: 10px;
                  text-align: center;
                  border-bottom: 1px solid #ddd;
                  color: #ffffff;
              }
              .content {
                  padding: 20px;
                  color: #333333;
              }
              .footer {
                  background: #333333;
                  padding: 10px;
                  text-align: center;
                  border-top: 1px solid #ddd;
                  font-size: 0.9em;
                  color: #cccccc;
              }
              .button {
                  display: inline-block;
                  background-color: #000000;
                  color: #ffffff;
                  padding: 10px 20px;
                  text-decoration: none;
                  border-radius: 5px;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h1>Verification Email</h1>
              </div>
              <div class="content">
                  <p>Hello ${fullName},</p>
                  <p>Your verification email.</p>
                  <p>Please click the button below to verify your account:</p>
                  <p>
                      <a href="${verifyLink}" class="button">Verify My Account</a>
                  </p>
                  <p>If you did not create an account, please ignore this email.</p>
                  <p>Best regards,<br> ALERTIFY TEAM </p>
              </div>
              <div class="footer">
                  <p>&copy; ${new Date().getFullYear()} . All rights reserved.</p>
              </div>
          </div>
      </body>
      </html>
    `;
  };
  
  const emergencyContactTemplate = (userName, contactName) => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
          <meta charset="UTF-8">
          <title>Emergency Contact Added</title>
          <style>
              body {
                  font-family: Arial, sans-serif;
                  line-height: 1.6;
                  color: #333333;
                  background-color: #f4f4f4; /* Light background */
                  margin: 0;
                  padding: 0;
              }
              .container {
                  width: 80%;
                  margin: 20px auto; /* Add some top margin */
                  padding: 20px;
                  border: 1px solid #ddd;
                  border-radius: 10px;
                  box-shadow: 0 0 10px rgba(0,0,0,0.1);
                  background-color: #ffffff; /* White background */
              }
              .header {
                  background: #e53935; /* Sharp red for alert */
                  padding: 10px;
                  text-align: center;
                  border-bottom: 1px solid #ddd;
                  color: #ffffff;
              }
              .content {
                  padding: 20px;
                  color: #333333;
              }
              .footer {
                  background: #333333;
                  padding: 10px;
                  text-align: center;
                  border-top: 1px solid #ddd;
                  font-size: 0.9em;
                  color: #cccccc;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h1>Emergency Contact Added</h1>
              </div>
              <div class="content">
                  <p>Hello ${contactName},</p>
                  <p>You have been added as an emergency contact by <strong>${userName}</strong> on the Alertify app.</p>
                  <p>Please be prepared to receive notifications in case of any emergencies.</p>
                  <p>Best regards,<br> The Alertify Team</p>
              </div>
              <div class="footer">
                  <p>&copy; ${new Date().getFullYear()} . All rights reserved.</p>
              </div>
          </div>
      </body>
      </html>
    `;
  };
  const generateDistressTemplate = (user, preciseLocation, deviceInfo, ipAddress, lat, lon) => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
          <meta charset="UTF-8">
          <title>Distress Alert from ALERTIFY</title>
          <style>
              body {
                  font-family: Arial, sans-serif;
                  line-height: 1.6;
                  color: #333333;
                  background-color: #f4f4f4;
                  margin: 0;
                  padding: 0;
              }
              .container {
                  width: 80%;
                  margin: 20px auto;
                  padding: 20px;
                  border: 1px solid #ddd;
                  border-radius: 10px;
                  box-shadow: 0 0 10px rgba(0,0,0,0.1);
                  background-color: #ffffff;
              }
              .header {
                  background: #ff0000;
                  padding: 10px;
                  text-align: center;
                  border-bottom: 1px solid #ddd;
                  color: #ffffff;
              }
              .content {
                  padding: 20px;
                  color: #333333;
                  background-color: #e0e0e0;
              }
              .footer {
                  background: #333333;
                  padding: 10px;
                  text-align: center;
                  border-top: 1px solid #ddd;
                  font-size: 0.9em;
                  color: #cccccc;
              }
              .button {
                  display: inline-block;
                  background-color: #000000;
                  color: #ffffff;
                  padding: 10px 20px;
                  text-decoration: none;
                  border-radius: 5px;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h1>Emergency Alert!</h1>
              </div>
              <div class="content">
                  <p>Hello,</p>
                  <p><strong>${user.fullName}</strong> is in distress and needs your assistance.</p>
                  <p><strong>IP Address:</strong> ${ipAddress}</p>
                  <p><strong>Device Information:</strong> ${deviceInfo.userAgent} (${deviceInfo.deviceType})</p>
                  <p><strong>Latitude:</strong> ${lat}</p>
                  <p><strong>Longitude:</strong> ${lon}</p>
                  <p><strong>Precise Location:</strong> ${preciseLocation}</p>
                  <p style="color: red; font-weight: bold;">Please respond to this alert immediately!</p>
              </div>
              <div class="footer">
                  <p>&copy; ${new Date().getFullYear()} ALERTIFY. All rights reserved.</p>
              </div>
          </div>
      </body>
      </html>
    `;
  };
  

  const generateFalseAlarmTemplate = (user) => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
          <meta charset="UTF-8">
          <title>False Alarm Notification from ALERTIFY</title>
          <style>
              body {
                  font-family: Arial, sans-serif;
                  line-height: 1.6;
                  color: #333333;
                  background-color: #f4f4f4;
                  margin: 0;
                  padding: 0;
              }
              .container {
                  width: 80%;
                  margin: 20px auto;
                  padding: 20px;
                  border: 1px solid #ddd;
                  border-radius: 10px;
                  box-shadow: 0 0 10px rgba(0,0,0,0.1);
                  background-color: #ffffff;
              }
              .header {
                  background: #ffcc00;
                  padding: 10px;
                  text-align: center;
                  border-bottom: 1px solid #ddd;
                  color: #333333;
              }
              .content {
                  padding: 20px;
                  color: #333333;
                  background-color: #e0e0e0;
              }
              .footer {
                  background: #333333;
                  padding: 10px;
                  text-align: center;
                  border-top: 1px solid #ddd;
                  font-size: 0.9em;
                  color: #cccccc;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h1>False Alarm Notification</h1>
              </div>
              <div class="content">
                  <p>Hello,</p>
                  <p>We wanted to inform you that the recent distress alert sent by <strong>${user.fullName}</strong> was a false alarm or sent by mistake.</p>
                  <p>No immediate action is required at this time.</p>
                  <p>If you have any questions or concerns, feel free to contact <strong>${user.fullName}</strong>.</p>
              </div>
              <div class="footer">
                  <p>&copy; ${new Date().getFullYear()} ALERTIFY. All rights reserved.</p>
              </div>
          </div>
      </body>
      </html>
    `;
  };
  
  
  // Export all functions in one go
  module.exports = {
    signUpTemplate,
    verifyTemplate,
    emergencyContactTemplate,
    generateDistressTemplate,
    generateFalseAlarmTemplate
  };
  