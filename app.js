const config = require('./utils/config')
const express = require('express')
require('express-async-errors')
const app = express()
const cors = require('cors')
const blogsRouter = require('./controllers/blogs')
const middleware = require('./utils/middleware')
const logger = require('./utils/logger')
const mongoose = require('mongoose')

//returns the changed object to caller
mongoose.set('useFindAndModify', false)

mongoose.connect(config.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    logger.info('connected to MongoDB')
  })
  .catch((error) => {
    logger.error('error connecting to MongoDB:', error.message)
  })

app.use(cors())
app.use(express.json())

//custom request logger
app.use(middleware.requestLogger)

//routes
app.use('/api/blogs', blogsRouter)

// unknown endpoint handling
app.use(middleware.unknownEndpoint)

// unknown request handling
app.use(middleware.errorHandler)

module.exports = app