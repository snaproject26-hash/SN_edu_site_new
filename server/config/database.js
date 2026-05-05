const mongoose = require("mongoose");
require("dotenv").config();

const uri = "mongodb+srv://abhi:kMv6IElRg3FNuNZ8@cluster0.odeq3mr.mongodb.net/?appName=Cluster0";

const clientOptions = { serverApi: { version: '1', strict: true, deprecationErrors: true } };

exports.connect = () => {
    // process.env.MONGODB_URL
    mongoose.connect(uri, 
        clientOptions
    //      {
    //     useNewUrlParser: true,
    //     useUnifiedTopology:true,
    // }
)
    .then(() => console.log("DB Connected Successfully"))
    .catch( (error) => {
        console.log("DB Connection Failed");
        console.error(error);
        process.exit(1);
    } )
};