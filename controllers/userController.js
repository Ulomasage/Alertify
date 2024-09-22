const UserModel = require('../models/userModel');
const fs = require('fs')
const bcrypt = require("bcryptjs")
const jwt = require('jsonwebtoken');
const cloudinary = require('../utils/cloudinary.js')
const sendMail = require(`../helpers/sendMail.js`);
const path=require("path")
const { signUpTemplate, verifyTemplate, emergencyContactTemplate } = require('../helpers/htmlTemplate.js');
const deactivateModel = require('../models/deativatedModel.js');

 
exports.registerUser = async (req, res) => {
    try {
      const {
        fullName,
        email,
        password,
        address,
        gender,
        phoneNumber,
        confirmPassword,
        emergencyContacts, // Array of emergency contacts
      } = req.body;
  
      // Check for all required fields
      if (!fullName || !email || !password || !address || !gender || !phoneNumber || !confirmPassword) {
        return res.status(400).json({ message: "Kindly enter all details" });
      }
  
      //Emergency contacts length check
      if (emergencyContacts.length < 1 || emergencyContacts.length > 10) {
        return res.status(400).json({ message: "Please enter at least 5 and at most 10 emergency contacts" });
      }
  
      const deactivated = await deactivateModel.findOne({email:email.toLowerCase()});
      if (deactivated) {
        return res.status(400).json({ message: "oops!! sorry, you can't use this email to sign-up" });
      }
      console.log(deactivated);

// Check if the user already exists
      const existingUser = await UserModel.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }
  
      // Check if passwords match
      if (confirmPassword !== password) {
        return res.status(400).json({ message: "Passwords do not match, kindly fill in your password correctly" });
      }
  
      // Hash the password
      const saltedPassword = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(password, saltedPassword);
  
      // Assign custom contactId to each emergency contact
      const formattedContacts = emergencyContacts.map((contact, index) => ({
        contactId: (index + 1).toString().padStart(3, '0'), // Generates IDs like 001, 002, 003...
        ...contact,
      }));
  
      // Create new user
      const user = new UserModel({
        fullName,
        address,
        gender,
        email: email.toLowerCase(),
        password: hashedPassword,
        phoneNumber,
        profilePic:null,
        emergencyContacts: formattedContacts, // Assign contacts with custom contactId
      });
  
      // Create a token for the user
      const userToken = jwt.sign(
        { id: user._id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: "50 Minutes" }
      );
  
      const verifyLink = `https://alertify-9tr5.onrender.com/api/v1/user/verify/${userToken}`;
  
      // Save the user
      await user.save();
  
      // Send verification email
      await sendMail({
        subject: `Kindly Verify your mail`,
        email: user.email,
        html: signUpTemplate(verifyLink, user.fullName),
      });
  
      // Notify emergency contacts
      for (const emergencyContacts of formattedContacts) {
        const { name, email: contactEmail } = emergencyContacts;
        const htmlContent = emergencyContactTemplate(fullName, name); // Email template for emergency contacts
        await sendMail({
          subject: `You have been added as an emergency contact on Alertify`,
          email: contactEmail,
          html: htmlContent,
        });
      }
      const Quote = ["Empower yourself with ALERTIFY, where a single tap transforms your vigilance into action. Together, we can turn awareness into safety and make our communities stronger, one alert at a time."]
      const randomQuote = Quote[Math.floor(Math.random() * Quote.length)];
    
          res.status(201).json({
              status:'created successfully',
              message: `Welcome ${user.fullName}!,${randomQuote}. KINDLY CHECK YOUR MAIL TO ACCESS YOUR LINK TO VERIFY YOUR ACCOUNT`,
              data: user,
          });
    } catch (error) {
      if(error.code == 11000){
        const whatWentWrong = Object.keys(error.keyValue)[0]
        return res.status(500).json({message:`please you can't use this ${whatWentWrong}, because it has been blocked. kindly use a different one.`})
      }else{
        res.status(500).json({
          status:"server error",
          message: error.message,
        });
      }
    
    }
  };
  
  

  exports.logInUser = async (req, res) => {
    try {
      const { email, password } = req.body;
  
      // Validate input
      if (!email || !password) {
        return res.status(400).json({ message: "Kindly enter all details" });
      }
  
      // Find the user by email
      const existingUser = await UserModel.findOne({ email: email.toLowerCase() });
      if (!existingUser) {
        return res.status(404).json({ message: "User not found" });
      }
  
      // Check password
      const confirmPassword = await bcrypt.compare(password, existingUser.password);
      if (!confirmPassword) {
        return res.status(400).json({ message: "Incorrect password" });
      }
  
      // Extract emergency contact IDs
      const contactIds = existingUser.emergencyContacts.map(contact => contact.contactId);
      if(!existingUser.isVerified){
        return res.status(400).json({
          message:"please this email is not verified, kindly click on the link sent to your email to verify your account"
        })
      }
  
      // Create JWT token with contact IDs
      const token = await jwt.sign(
        {
          userId: existingUser._id,
          email: existingUser.email,
          isAdmin: existingUser.isAdmin,
          contactIds: contactIds,  // Include contact IDs in the token
        },
        process.env.JWT_SECRET,
        { expiresIn: "5d" }
      );
  
      // Respond with success
      res.status(200).json({
        message: `${existingUser.fullName}, you have successfully logged into your account`,
        data: existingUser,
        token,
      });
  
    } catch (error) {
      res.status(500).json({
        status:"server error",
        message: error.message });
    }
  };

exports.makeAdmin = async(req,res)=>{
  try {
      const {userId} = req.params
      const user = await UserModel.findById(userId)
      if(!user){
          return res.status(404).json({message:"user not found"})
      }
      user.isAdmin = true
      await user.save()
      res.status(200).json({
          message:  `${user.fullName} is now an admin`, data:user
         })
  } catch (error) {
      res.status(500).json({
        status:"server error",
        message:error.message})
  }
}

exports.deactivateUser = async (req, res) => {
  try {
    const {email} = req.body

      const user = await UserModel.findOne({email})
      if(!user){
        return res.status(404).json({
          message:"user not found"
        })
      }
      
      // Check if the user is already deactivated
      const deactivate = await deactivateModel.create({
        email:user.email
      })
      console.log(deactivate);
      
      if(!deactivate){
        return res.status(400).json({
          message:"error deactivating user... try again later"
        })
      }

      const deleteUser = await UserModel.findByIdAndDelete(id)
      if(!deleteUser){
        return res.status(400).json({
          message:"error deleting user"
        })
      }

      res.status(200).json({
          message: `The user with this ${deactivate.email} has successfully been deactivated`,
      });
  } catch (error) {
      res.status(500).json({
          status: "server error",
          message: error.message,
      });
  }
};


exports.verifyEmail = async(req,res)=>{
  try {
     const {token} = req.params
     const {email}=jwt.verify(token,process.env.JWT_SECRET) 
     const user = await UserModel.findOne({email})
     if(!user){
      return res.status(404).json({message:"user not found"})
      }

      if(user.isVerified){
          return res.status(400).json({message:"user already verified"})
          }
      user.isVerified=true
      await user.save()

      res.status(200).json({
          message:"user verification successful"
         })

  } catch (error) {
      if(error instanceof jwt.JsonWebTokenError){
          return res.status(400).json({message:"link expired"})
      }
      res.status(500).json({
        status:"server error",
        message:error.message})
  }
}

exports.resendVerification = async(req,res)=>{
  try {
      const {email} = req.body
      const user = await UserModel.findOne({email})
      if(!user){
          return res.status(400).json({message:"user does not exist"})
      }    
      
      if(user.isVerified){
          return res.status(400).json({message:"user already verified"})
          }
      const token = await jwt.sign({userId:user._id, userEmail:user.email},process.env.JWT_SECRET,{expiresIn:"14days"})  
      const verifyLink=`https://alertify-9tr5.onrender.com/api/v1/user/verify/${user._id}/${token}`   
      let mailOptions={
          email:user.email,
          subject:"verification email",
          html:verifyTemplate(verifyLink,user.fullName)
      }
     await sendMail(mailOptions)
      res.status(200).json({message:"Your verification link has been sent to your email"})
  } catch (error) {
      res.status(500).json({
        status:"server error",
        message:error.message})
  }
}

// Forgot Password
exports.forgotPassword = async (req, res) => {
  try {
      // Extract the email from the request body
      const { email } = req.body;
      // Check if the email exists in the database
      const user = await UserModel.findOne({ email });
      if (!user) {
          return res.status(404).json({
              message: "User not found"
          });
      }
      // Generate a reset token
      const resetToken = jwt.sign({ email: user.email }, process.env.JWT_SECRET, { expiresIn: "30mins" });

      // Send reset password email
      const mailOptions = {
          email: user.email,
          subject: "Password Reset",
          html: `Please click on the link to reset your password: <a href="https://alertify-9tr5.onrender.com/api/v1/user/reset-password/${resetToken}">Reset Password</a> link expires in 30 minutes`,
      };
      //   Send the email
      await sendMail(mailOptions);
      //   Send a success response
      res.status(200).json({
          message: `${user.fullName}, your new reset password has been sent to your email successfully`
      });
  } catch (error) {
      res.status(500).json({
        status:"server error",
        message:error.message})
  }
};

// Reset Password
exports.resetPassword = async (req, res) => {
  try {
      const { token } = req.params;
      const { password } = req.body;
      // Verify the user's token and extract the user's email from the token
      const { email } = jwt.verify(token, process.env.JWT_SECRET);
      // Find the user by ID
      const user = await UserModel.findOne({ email });
      if (!user) {
          return res.status(404).json({
              message: "User not found"
          });
      }
      // Salt and hash the new password
      const saltedRound = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, saltedRound);
      // Update the user's password
      user.password = hashedPassword;
      // Save changes to the database
      await user.save();
      // Send a success response
      res.status(200).json({
          message: `${user.fullName}, your Password has been reset successfully`
      });
  } catch (error) {
      res.status(500).json({
        status:"server error",
        message:error.message});
  }
};

// Change Password
exports.changePassword = async (req, res) => {
  try {
      const { token } = req.params;
      const { password, existingPassword } = req.body;
      // Verify the user's token and extract the user's email from the token
      const { email } = jwt.verify(token, process.env.JWT_SECRET);
      // Find the user by ID
      const user = await UserModel.findOne({ email });
      if (!user) {
          return res.status(404).json({
              message: "User not found"
          });
      }
      // Confirm the previous password
      const isPasswordMatch = await bcrypt.compare(existingPassword, user.password);
      if (!isPasswordMatch) {
          return res.status(401).json({
              message: "Existing password does not match"
          });
      }
      // Salt and hash the new password
      const saltedRound = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, saltedRound);
      // Update the user's password
      user.password = hashedPassword;
      // Save the changes to the database
      await user.save();
      //   Send a success response
      res.status(200).json({
          message: `${user.fullName}, you have successfully changed your password`
      });
  } catch (error) {
      res.status(500).json({
        status:"server error",
        message:error.message});
  }
};

exports.updateUser = async (req, res) => {
    try {
        const {userId} = req.user
        const { fullName,address,phoneNumber } = req.body;
        console.log('jack')
        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                status:'not found',
                message:'user not found'
            });
        }
        console.log(user)
        if (req.file && req.file.profilePic && user.profilePic) {
            const imagePublicId = user.profilePic.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(imagePublicId);  // Destroy old image
          }
          console.log('fada');
          
          const updateResponse = await cloudinary.uploader.upload(req.file.path); 
        const data = {
            fullName: fullName || user.fullName,
            address: address || user.address,
            phoneNumber: phoneNumber || user.phoneNumber,
            profilePic: updateResponse.secure_url || user.profilePic
        };
        console.log('bisi')
        const updatedUser = await UserModel.findByIdAndUpdate(userId, data, { new: true });
        res.status(200).json({
            status:'successful',
            message: 'User new details updated successfully',
            data: updatedUser
        });
    } catch (error) {
        res.status(500).json({
            status: 'Server Error',
            errorMessage: error.message,
        });
    }
};
exports.getAllUsers = async(req,res)=>{
  try {
      const allusers = await UserModel.find()
      if(allusers.length <=0){
          return res.status(400).json({
              message:"No available registered users"
          })
      }
      res.status(200).json({
          message:'List of all users in the database',
          totalUsersRegistered:allusers.length,
          data:allusers
      })
  } catch (error) {
      res.status(500).json({
        status:"server error",
        message:error.message})
  }
}



exports.removeUser = async(req,res)=>{
  try {
      const {userId} = req.user
      const user = await UserModel.findById(userId)
      if(!user){
          res.status(404).json({
              message:'User not found'
          })
         }

      const deletedUser = await UserModel.findByIdAndDelete(userId)
      res.status(200).json({
          message:'User deleted successfully',
      })
  } catch (error) {
      res.status(500).json({
        status:"server error",
        message:error.message})
  }
}

exports.getOneUser = async (req, res) => {
  try {
      const {userId} = req.user
      console.log(userId)
      const oneUser = await UserModel.findById(userId);
      console.log(oneUser)
      if(!oneUser){
          return res.status(404).json({
              message: 'User not found'
          })
      }
      res.status(200).json({
          message: 'Below is the one user found',
          data: oneUser
      })
  } catch (error) {
      res.status(500).json({
        status:"server error",
        message:error.message})
  }
}

exports.logOut = async (req, res) => {
  try {
      const auth = req.headers.authorization;
      const token = auth?.split(' ')[1];

      if (!token) {
          return res.status(401).json({
              message: 'Invalid token',
          });
      }

      // Verify the token and extract the user's email
      const { email } = jwt.verify(token, process.env.JWT_SECRET);
      const user = await UserModel.findOne({ email });

      if (!user) {
          return res.status(404).json({
              message: "User not found",
          });
      }

      // Push the token with an expiration date (e.g., 15 minutes from now)
      user.blackList.push({
          token: token,
          expiresAt: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes expiration
      });

      await user.save();

      res.status(200).json({
          message: `${user.fullName}, you have logged out successfully.`,
      });
  } catch (error) {
      res.status(500).json({
          message: error.message,
      });
  }
};

// Function to cleanup expired tokens
exports.cleanupExpiredTokens = async () => {
  try {
      const users = await UserModel.find();

      for (const user of users) {
          user.blackList = user.blackList.filter(item => item.expiresAt > new Date());
          await user.save();
      }
  } catch (error) {
      console.error('Error cleaning up expired tokens:', error);
  }
};