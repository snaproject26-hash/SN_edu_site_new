const cloudinary = require("cloudinary").v2; //! Cloudinary is being required

exports.cloudinaryConnect = () => {
  try {
    cloudinary.config({
      //!    ########   Configuring the Cloudinary to Upload MEDIA ########
      // cloud_name: process.env.CLOUD_NAME,
      // api_key: process.env.API_KEY,
      // api_secret: process.env.API_SECRET,
      cloud_name: "djcs7j8xo",
      api_key: "691822931347737",
      api_secret: "O6xuXZFpyq0FHLjqilU9Y8BqxH0",
    });
  } catch (error) {
    console.log(error);
  }
};
