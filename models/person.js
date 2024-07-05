const mongoose = require("mongoose");

// Define the URL for the MongoDB database
const url = process.env.MONGODB_URI;

// Connect to MongoDB
mongoose.set("strictQuery", false);
console.log("connecting to", url);
mongoose
    .connect(url)
    .then((result) => {
        console.log("connected to MongoDB");
    })
    .catch((error) => {
        console.log("error connecting to MongoDB:", error.message);
    });

const personSchema = new mongoose.Schema({
    name: String,
    number: String,
});

personSchema.set("toJSON", {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString();
        delete returnedObject._id;
        delete returnedObject.__v;
    },
});

module.exports = mongoose.model("person", personSchema);
