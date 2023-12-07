const express = require('express')
const { requestLogger, unknownEndpoint } = require('./middlewares')
const cors = require('cors')
const app = express()
app.use(cors())
app.use(express.json())
app.use(requestLogger)
let notes = [
    {
      id: 1,
      content: "HTML is easy",
      important: true
    },
    {
      id: 2,
      content: "Browser can execute only JavaScript",
      important: false
    },
    {
      id: 3,
      content: "GET and POST are the most important methods of HTTP protocol",
      important: true
    }
]

const generateId = () => {
    return notes.length > 0 ?
        Math.max(...notes.map(note => note.id)) + 1 :
        0
}

app.get('/', (req, res) => {
    res.send('<h1>hello world</h1>')
})

app.get('/api/notes', (req, res) => {
    res.status(200)
    res.json(notes)
})

app.get('/api/notes/:id', (req, res) => {
    const { id } = req.params;
    const note = notes.find(note => note.id === Number(id));
    if(!note) {
        res.status(404).end();
    } else {
        res.json(note);
    }
})

app.post('/api/notes', (req, res) => {
    const {body} = req;

    if(!body.content) {
        return res.status(400).json({ 
            error: 'content missing' 
        })
    }

    const note = {
        content: body.content,
        important: body.important || false,
        id: generateId()
    }

    console.log(note)
    notes.push(note)
    res.json(note);
})

app.delete('/api/notes/:id', (req, res) => {
    const { id } = req.params;
    notes = notes.filter(note => note.id !== Number(id));
    res.status(204).end();
})

app.use(unknownEndpoint)

const PORT = process.env.PORT || 3001
console.log(PORT)
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})