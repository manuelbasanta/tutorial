const express = require('express')
const Note = require('../models/note')

const notesRouter = express.Router()


notesRouter.get('/', async (req, res) => {
  const notes = await Note.find({})
  res.json(notes)
})

notesRouter.get('/:id', async (req, res) => {
  const { id } = req.params

  const note = await Note.findById(id)
  if (note) {
    res.json(note)
  } else {
    res.status(404).end()
  }
})

notesRouter.post('/', async (req, res) => {
  const { body } = req

  const note = new Note({
    content: body.content,
    important: body.important || false,
  })

  const newNote = await note.save()
  res.status(201).json(newNote)
})

notesRouter.delete('/:id', async (req, res) => {
  const { id } = req.params
  await Note.findByIdAndDelete(id)
  res.status(204).end()
})

notesRouter.put('/:id', async (req, res) => {
  const body = req.body

  const note = {
    content: body.content,
    important: body.important || false,
  }

  const updatedNote = await Note.findByIdAndUpdate(req.params.id, note, { new: true })
  res.json(updatedNote)
})


module.exports = notesRouter
