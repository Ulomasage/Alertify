require('./config/dbConfig.js')
const express = require('express')
require("dotenv").config()
const cors = require('cors')
const morgan = require('morgan')
const fileUploader = require('express-fileupload')
const router = require('./routers/userRouter.js')
const alertRouter = require('./routers/alertRouter.js')
const cron = require('node-cron')
const { cleanupExpiredTokens } = require('./controllers/userController.js') // Adjust path as necessary
const PORT=process.env.PORT || 5050

const app = express();
app.use(cors({origin: "*"}))

app.use(morgan("dev"))
// app.use(fileUploader({
//     useTempFiles: true,
// }))
app.use(express.json())

app.use("/api/v1/user",router)
app.use("/api/v1/user",alertRouter)


app.get('/', (req, res) => {
    res.send('Welcome to Alertify!');
});

// Schedule the cleanup task to run every hour
cron.schedule('0 * * * *', async () => {
    console.log('Running cleanup task for expired tokens...');
    await cleanupExpiredTokens; // Call your cleanup function here
});

app.listen(PORT, () => {
    console.log(`server running on PORT: ${PORT}`);
})

