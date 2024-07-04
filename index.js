const express = require('express')
const morgan = require('morgan');
const app = express()

// Parse JSON bodies (as sent by API clients)
app.use(express.json());

// Serve static files from the 'dist' directory
app.use(express.static('dist'))

// Morgan middleware (logging)
morgan.token('body', (req) => JSON.stringify(req.body)); // Custom token to log the body of the request
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body')); // From https://www.npmjs.com/package/morgan
//app.use(morgan('tiny'));

let persons = [
    {
        "id": "1",
        "name": "Arto Hellas",
        "number": "040-123456"
    },
    {
        "id": "2",
        "name": "Ada Lovelace",
        "number": "39-44-5323523"
    },
    {
        "id": "3",
        "name": "Dan Abramov",
        "number": "12-43-234345"
    },
    {
        "id": "4",
        "name": "Mary Poppendieck",
        "number": "39-23-6423122"
    }
]

app.get('/', (request, response) => {
    response.send('<h1>Hello World!</h1>')
})

app.get('/api/persons', (request, response) => {
    response.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
    const id = request.params.id
    const person = persons.find(person => person.id === id)

    if (person) {
        response.json(person)
    } else {
        response.status(404).send({ error: 'Person not found' });
    }
})

app.delete('/api/persons/:id', (request, response) => {
    const id = request.params.id
    const initialLength = persons.length;
    persons = persons.filter(person => person.id !== id)

    if (persons.length < initialLength) {
        response.status(204).end();
    } else {
        response.status(404).send({ error: 'Person not found' });
    }
})

app.post('/api/persons', (request, response) => {
    const body = request.body;

    if (!body.name && !body.number) {
        return response.status(400).json({ error: 'Info is missing (name and phone number)' });
    } else if (!body.name) {
        return response.status(400).json({ error: 'Info is missing (name)' });
    } else if (!body.number) {
        return response.status(400).json({ error: 'Info is missing (phone number)' });
    }

    const foundPerson = persons.find(person => person.name === body.name);
    if (foundPerson) {
        return response.status(400).json({ error: 'Name already exists in the phonebook' });
    }

    const newId = Math.floor(Math.random() * 10000000000);
    const newPerson = {
        id: newId.toString(),
        name: body.name,
        number: body.number
    };

    persons = persons.concat(newPerson);
    response.json(newPerson);
});

app.get('/info', (request, response) => {
    const personsCount = persons.length;
    const requestTime = new Date();

    response.send(`
        <p>Phonebook has info for ${personsCount} people</p>
        <p>${requestTime}</p>
    `)
})


const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})