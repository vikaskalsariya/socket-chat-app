const cloudinary = require("cloudinary").v2
const stream = require("stream");

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
})

module.exports = function imgUploading(buffer) {
    return new Promise((resolve, reject) => {
        const bufferStream = new stream.PassThrough();
        bufferStream.end(buffer);

            const uploadStream = cloudinary.uploader.upload_stream(
                { folder: "chatApp" },   
                async (error, resultImage) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(resultImage.secure_url);
                    }
                }
            );
            bufferStream.pipe(uploadStream);
    });
}