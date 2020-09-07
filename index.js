const config = require('./utils/config')
const http = require('http')
const express = require('express')
const app = express()
const cors = require('cors')
const blogsRouter = require('./controllers/blogs')
const mongoose = require('mongoose')
const Blog = require('./models/blog')
const logger = require('./utils/logger')
const middleware = require('./utils/middleware')

//returns the changed object to caller
mongoose.set('useFindAndModify', false)

const mongoUrl = config.MONGODB_URI
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true})
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

//const PORT = process.env.PORT || 3003
app.listen(config.PORT, () => {
  logger.info(`Server running on port ${config.PORT}`)
})