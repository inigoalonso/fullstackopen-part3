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

    const phoneValidator = (value) => {
        const phoneRegex = /^\d{2,3}-\d+$/;
        return phoneRegex.test(value);
    };

const personSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true, minlength: 3 },
    number: { type: String, required: true, minlength: 8, validate: {
        validator: phoneValidator,
        message: props => `${props.value} is not a valid phone number`
    } }, // With Custom validator
});

personSchema.set("toJSON", {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString();
        delete returnedObject._id;
        delete returnedObject.__v;
    },
});

module.exports = mongoose.model("person", personSchema);
