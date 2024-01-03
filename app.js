const config = require('./utils/config')
const logger = require('./utils/logger')
const express = require('express')
const cors = require('cors')
require('express-async-errors')
const { requestLogger, unknownEndpoint, errorHandler } = require('./middlewares')
const notesRouter = require('./controllers/notes')
const userRouter = require('./controllers/users')
const { default: mongoose } = require('mongoose')
const loginRouter = require('./controllers/login')
const app = express()

mongoose.set('strictQuery', false)

const { MONGODB_URI } = config

logger.info('connecting to', MONGODB_URI)

mongoose.connect(MONGODB_URI)
  .then(() => {
    logger.info('connected to MongoDB')
  })
  .catch((error) => {
    logger.info('error connecting to MongoDB:', error.message)
  })


app.use(cors())
app.use(express.json())
app.use(express.static('dist'))
app.use(requestLogger)

app.use('/api/login', loginRouter)
app.use('/api/notes', notesRouter)
app.use('/api/users', userRouter)

app.use(unknownEndpoint, errorHandler)

module.exports = app
