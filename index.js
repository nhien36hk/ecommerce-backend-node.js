const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const routes = require('./src/routes/index');
const cors = require('cors');
const cookieParser = require('cookie-parser')

dotenv.config()

const app = express();
const PORT = process.env.PORT || 3001;
mongoose.connect('mongodb://127.0.0.1:27017/ecom_db');

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(cookieParser());
app.use(express.urlencoded({ limit: '50mb', extended: true }));

routes(app);


app.listen(PORT, () => {
    console.log(`Server is running on port:`, PORT);
    
})
