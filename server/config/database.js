const mongoose = require("mongoose");
require("dotenv").config();

// const url =
//   "mongodb+srv://abhisolanki9426_db_user:43AMMZywdStrjNhc@cluster0.odeq3mr.mongodb.net/?appName=Cluster0";

const url =
  "mongodb+srv://snaproject26_db_user:tDRPV7nQmyPMHArg@cluster7.6gxxmtm.mongodb.net/?appName=Cluster7";

// const url =
//   "mongodb+srv://snadmin:snAdmin@123@cluster0.odeq3mr.mongodb.net/?appName=Cluster0";

// process.env.MONGODB_URL

exports.connect = () => {
  mongoose
    .connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => console.log("DB Connected Successfully"))
    .catch((error) => {
      console.log("DB Connection Failed");
      console.error(error);
      process.exit(1);
    });
};
