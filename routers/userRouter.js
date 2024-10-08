const express = require('express')
const upload = require('../utils/multer.js')
const { registerUser, logInUser, verifyEmail, forgotPassword, changePassword, resetPassword, makeAdmin, getAllUsers, getOneUser, updateUser, removeUser, logOut, deactivateUser, resendVerificationEmail } = require('../controllers/userController.js')
const { logInValidator, signUpValidator } = require('../middleware/validator.js')
const { authentication, isAdmin } = require('../middleware/authorization.js')
const router = express.Router()

router.post('/sign-up',signUpValidator,registerUser)
router.post(`/log-in`,logInValidator, logInUser)
router.put("/make-admin/:userId", makeAdmin)
router.post('/de-activate', isAdmin, deactivateUser)
router.get(`/verify/:token`, verifyEmail)
router.post(`/resend-verification`, resendVerificationEmail)
router.post(`/forgot-password`, forgotPassword)
router.post(`/change-password/:token`, changePassword)
router.get(`/reset-password/:token`, resetPassword)
router.get('/one', authentication, getOneUser)
router.get('/all',authentication,isAdmin,getAllUsers)
router.put('/update', authentication,upload.single('profilePic'), updateUser)
router.delete(`/remove`,authentication,isAdmin,removeUser)
router.post('/sign-out',authentication,logOut);

module.exports = router