const mongoose = require("mongoose");
mongoose.set("strictQuery", true);

mongoose
  .connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("connection successful");
  })
  .catch((error) => {
    console.log("error---+++", error);
  });
