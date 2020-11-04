// to generate JSON web token formatted tokens
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const loginRouter = require('express').Router()
const User = require('../models/user')

// route(s)
loginRouter.post('/', async (request, response) => {
  const body = request.body

  const user = await User.findOne({ username: body.username })

  // to compare given password with the saved one
  const passwordCorrect = user === null
    ? false
    : await bcrypt.compare(body.password, user.passwordHash)

  // user does not exist or password is invalid
  if (!(user && passwordCorrect)) {
    return response.status(401).json({
      error: 'invalid username and/or password'
    })
  }

  // username and password are valid, user for token is created
  const userForToken = {
    username: user.username,
    id: user._id,
  }

  // token is created
  const token = jwt.sign(userForToken, process.env.SECRET)

  // returns token, username and name
  response
    .status(200)
    .send({ token, username: user.username, name: user.name })
})

module.exports = loginRouter