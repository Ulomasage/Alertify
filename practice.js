// exports.registerUser = async (req, res) => {
//     try {
//       const {
//         fullName,
//         email,
//         password,
//         address,
//         gender,
//         phoneNumber,
//         confirmPassword,
//         EmergencyContacts, // Now a single array for both phone numbers and emails
//       } = req.body;
  
//       // Check for all required fields
//       if (!fullName || !email || !password || !address || !gender || !phoneNumber || !confirmPassword) {
//         return res.status(400).json({ message: "Kindly enter all details" });
//       }
  
//       // Emergency contacts length check
//       if (EmergencyContacts.length < 5 || EmergencyContacts.length > 10) {
//         return res.status(400).json({ message: "Please enter at least 5 and at most 10 emergency contacts" });
//       }
  
//       // Check if the user already exists
//       const existingUser = await UserModel.findOne({ email });
//       if (existingUser) {
//         return res.status(400).json({ message: "User already exists" });
//       }
  
//       // Check if passwords match
//       if (confirmPassword !== password) {
//         return res.status(400).json({ message: "Passwords do not match, kindly fill in your password correctly" });
//       }
  
//       // Hash the password
//       const saltedPassword = await bcrypt.genSalt(12);
//       const hashedPassword = await bcrypt.hash(password, saltedPassword);
  
//       // Create new user
//       const user = new UserModel({
//         fullName,
//         address,
//         gender,
//         email: email.toLowerCase(),
//         password: hashedPassword,
//         phoneNumber,
//         EmergencyContacts,  
//       });
  
//       // Create a token for the user
//       const userToken = jwt.sign(
//         { id: user._id, email: user.email },
//         process.env.JWT_SECRET,
//         { expiresIn: "3 Minutes" }
//       );
  
//       const verifyLink = `${req.protocol}://${req.get("host")}/api/v1/user/verify/${userToken}`;
  
//       // Save the user
//       await user.save();
  
//       // Send verification email
//       await sendMail({
//         subject: `Kindly Verify your mail`,
//         email: user.email,
//         html:signUpTemplate(verifyLink, user.fullName),
//       });
  
//       // Notify emergency contacts
//       for (const emergencyContact of EmergencyContacts) {
//         const { name, email: contactEmail } = emergencyContact;
//         const htmlContent = emergencyContactTemplate(fullName, name); // Email template for emergency contacts
//         await sendMail({
//           subject: `You have been added as an emergency contact on Alertify`,
//           email: contactEmail,
//           html: htmlContent,
//         });
//       }
  
//       // Respond with success
//       res.status(201).json({
//         status: "created successfully",
//         message: `Welcome ${user.fullName} to ALERTIFY, kindly check your mail to verify your account.`,
//         data: user,
//       });
//     } catch (error) {
//       res.status(500).json({
//         message: error.message,
//       });
//     }
//   };

// deactivate: {
//     type: Boolean,
//     default: false,
// },
// isEmailUsable: {
//     type: Boolean,
//     default: true,
// },