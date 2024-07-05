const mongoose = require('mongoose')

// Check if the password is provided as an argument
if (process.argv.length < 3) {
  console.log('Need to pass the password as an argument: node mongo.js <password>')
  process.exit(1)
}

// Get command line arguments
const password = process.argv[2]
const name = process.argv[3]
const number = process.argv[4]

// Define the URL for the MongoDB database
const url = `mongodb+srv://inigoalonso:${password}@cluster0.tahvxxc.mongodb.net/phonebookApp?retryWrites=true&w=majority&appName=Cluster0`

// Connect to MongoDB
mongoose.set('strictQuery', false)
mongoose.connect(url)

// Define the schema for the phonebook entries
const phonebookSchema = new mongoose.Schema({
  name: String,
  number: String,
})

// Create a model for the phonebook entries
const Person = mongoose.model('Person', phonebookSchema)

// Check the number of arguments
try {
  if (process.argv.length === 3) {
    // Display all entries if only the password is provided
    Person.find({}).then(result => {
      console.log('phonebook:')
      result.forEach(person => {
        console.log(`${person.name} ${person.number}`)
      })
    })
  } else if (process.argv.length === 5) {
    // Add new entry if name and number are provided
    const person = new Person({
      name: name,
      number: number,
    })

    person.save().then(() => {
      console.log(`added ${name} number ${number} to phonebook`)
    })
  } else {
    console.log('Wrong number of arguments. Use: "node mongo.js <password>" or "node mongo.js <password> <name> <number>"')
  }
} catch (error) {
  console.error('Error:', error.message)
} finally {
  // Close the connection to the database
  mongoose.connection.close()
}
