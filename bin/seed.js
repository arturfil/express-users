const mongoose = require('mongoose');
require('dotenv').config();

// 'MONGODB_URI' is defined in the '.env' file
mongoose.connect(process.env.MONGODB_URI);

// connect to the database with the 'MONGODB_URI' enviroment variable
console.log('Example file seed running... 🌱');
