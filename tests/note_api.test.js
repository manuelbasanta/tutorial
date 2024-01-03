const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Note = require('../models/note')
const User = require('../models/user')
const { initialNotes, notesInDb, nonExistingId } = require('./test_helper')
mongoose.set('bufferTimeoutMS', 30000)

const api = supertest(app)
let token

beforeEach(async () => {
  await Note.deleteMany({})
  await Note.insertMany(initialNotes)
}, 20000)

beforeAll(async () => {
  await User.deleteMany({})
  const newUser = {
    username: 'tester_test',
    name: 'Tom',
    password: '1231'
  }

  await api
    .post('/api/users')
    .send(newUser)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const loginData = await api
    .post('/api/login')
    .send({
      username: newUser.username,
      password: newUser.password
    })

  token = loginData._body.token
}, 20000)

describe('Note api', () => {
  describe('GET all notes', () => {
    test('notes are returned as json', async () => {
      await api
        .get('/api/notes')
        .expect(200)
        .expect('Content-Type', /application\/json/)
    }, 20000)

    test('all notes are returned', async () => {
      const response = await api.get('/api/notes')

      expect(response.body).toHaveLength(initialNotes.length)
    })

    test('a specific note is within the returned notes', async () => {
      const response = await api.get('/api/notes')

      const contents = response.body.map(r => r.content)
      expect(contents).toContain(
        'Browser can execute only JavaScript'
      )
    })
  })
  describe('GET single note', () => {
    test('a specific note can be viewed', async () => {
      const notesAtStart = await notesInDb()
      const noteToView = notesAtStart[0]

      const note = await api
        .get(`/api/notes/${noteToView.id}`)
        .expect(200)
        .expect('Content-Type', /application\/json/)

      expect(note.body).toEqual(noteToView)
    })
    test('fails with statuscode 404 if note does not exist', async () => {
      const validNonexistingId = await nonExistingId()

      await api
        .get(`/api/notes/${validNonexistingId}`)
        .expect(404)
    })

    test('fails with statuscode 400 if id is invalid', async () => {
      const invalidId = '5a3d5da59070081a82a3445'

      await api
        .get(`/api/notes/${invalidId}`)
        .expect(400)
    })
  })
  describe('POST note', () => {
    test('a valid note can be added', async () => {
      const newNote = {
        content: 'async/await simplifies making async calls',
        important: true,
      }

      console.log(token)
      await api
        .post('/api/notes')
        .send(newNote)
        .set({ authorization: `Bearer ${token}` })
        .expect(201)
        .expect('Content-Type', /application\/json/)

      const notesAtEnd = await notesInDb()
      expect(notesAtEnd).toHaveLength(initialNotes.length + 1)

      const contents = notesAtEnd.map(n => n.content)
      expect(contents).toContain(
        'async/await simplifies making async calls'
      )
    })

    test('note without content is not added', async () => {
      const newNote = {
        important: true,
        userId: '12345'
      }

      await api
        .post('/api/notes')
        .send(newNote)
        .set({ authorization: `Bearer ${token}` })
        .expect(400)

      const notesAtEnd = await notesInDb()
      expect(notesAtEnd).toHaveLength(initialNotes.length)
    })
  })
  describe('DELETE note', () => {
    test('a note can be deleted', async () => {
      const notesAtStart = await notesInDb()
      const noteToDelete = notesAtStart[0]

      await api
        .delete(`/api/notes/${noteToDelete.id}`)
        .expect(204)

      const notesAtEnd = await notesInDb()
      expect(notesAtEnd.length).toEqual(notesAtStart.length - 1)

      const content = notesAtEnd.map(r => r.content)
      expect(content).not.toContain(noteToDelete.content)
    })
  })
})

afterAll(async () => {
  await mongoose.connection.close()
})
