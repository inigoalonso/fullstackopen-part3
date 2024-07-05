require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const app = express();
const cors = require("cors");

const Person = require("./models/person");

// Serve static files from the 'dist' directory
app.use(express.static("dist"));

// Parse JSON bodies (as sent by API clients)
app.use(express.json());

// Morgan middleware (logging)
morgan.token("body", (req) => JSON.stringify(req.body)); // Custom token to log the body of the request
app.use(
    morgan(":method :url :status :res[content-length] - :response-time ms :body")
); // From https://www.npmjs.com/package/morgan

// Enable CORS
app.use(cors());

// Get all persons from the MongoDB
let persons = Person.find({}).then((result) => {
    console.log("phonebook:");
    result.forEach((person) => {
        console.log(`${person.name} ${person.number}`);
    });
});

app.get("/", (request, response) => {
    response.send("<h1>Hello World!</h1>");
});

app.get("/api/persons", (request, response) => {
    Person.find({})
        .then((persons) => {
            response.json(persons);
        })
        .catch((error) => next(error));
});

app.get("/api/persons/:id", (request, response) => {
    const id = request.params.id;
    Person.findById(id)
        .then((person) => {
            if (person) {
                response.json(person);
            } else {
                response.status(404).end();
            }
        })
        .catch((error) => next(error));
});

app.delete("/api/persons/:id", (request, response, next) => {
    const id = request.params.id;
    Person.findByIdAndDelete(id)
        .then((result) => {
            response.status(204).end();
        })
        .catch((error) => {
            next(error);
        });
});

app.put("/api/persons/:id", (request, response, next) => {
    const body = request.body;

    const person = {
        name: body.name,
        number: body.number,
    };

    Person.findByIdAndUpdate(request.params.id, person, { new: true })
        .then((updatedNote) => {
            response.json(updatedNote);
        })
        .catch((error) => next(error));
});

app.post("/api/persons", (request, response) => {
    const body = request.body;

    // Check if both name and number are missing
    if (!body.name && !body.number) {
        return response
            .status(400)
            .json({ error: "Info is missing (name and phone number)" });
    }

    // Check if name is missing
    if (!body.name) {
        return response.status(400).json({ error: "Info is missing (name)" });
    }

    // Check if number is missing
    if (!body.number) {
        return response
            .status(400)
            .json({ error: "Info is missing (phone number)" });
    }

    // Check if the name already exists
    Person.findOne({ name: body.name })
        .then((foundPerson) => {
            if (foundPerson) {
                return response
                    .status(400)
                    .json({ error: "Name already exists in the phonebook" });
            }

            // Add new person
            const newPerson = new Person({
                name: body.name,
                number: body.number,
            });

            newPerson
                .save()
                .then((savedPerson) => {
                    console.log(
                        `added ${savedPerson.name} number ${savedPerson.number} to phonebook`
                    );
                    return response.json(savedPerson);
                })
                .catch((error) => next(error));
        })
        .catch((error) => next(error));
});

app.get("/info", (request, response) => {
    Person.countDocuments({}).then((count) => {
        response.send(`
            <p>Phonebook has info for ${count} people</p>
            <p>${new Date()}</p>
        `);
    });
});

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: "unknown endpoint" });
};

// handler of requests with unknown endpoint
app.use(unknownEndpoint);

// Error handler middleware
const errorHandler = (error, request, response, next) => {
    console.error(error.message);

    if (error.name === "CastError") {
        return response.status(400).send({ error: "malformatted id" });
    }

    next(error);
};

// this has to be the last loaded middleware, also all the routes should be registered before this!
app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
