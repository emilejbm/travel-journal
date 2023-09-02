const mongoose = require("mongoose");

module.exports = async () => {
    try {
        const connectionParams = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        };
        await mongoose.connect(process.env.DB_NAME, connectionParams);
        console.log("connected to database.");
    } catch (error) {
        console.log("could not connect to database", error);
    }
};

// 'mongodb://localhost:27017/usersdb'