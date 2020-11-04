const mongoose = require('mongoose')
const helper = require('./test_helper')
const supertest = require('supertest')
const app = require('../app')
const bcrypt = require('bcrypt')
const User = require('../models/user')
const { usersInDatabase } = require('./test_helper')
const api = supertest(app)

describe('Initially one user at database', () => {
  //create one user
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('secret', 10)

    const userObject = new User({
      username: 'root',
      name: 'User',
      passwordHash
    })

    await userObject.save()
  })

  test('adding a new user with a fresh username succeeds', async () => {
    const usersBeforeAdding = await usersInDatabase()

    const newUser = {
      username: 'emakip',
      name: 'Esa Mäkipää',
      password: 'salasana'
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAfterAdding = await helper.usersInDatabase()
    expect(usersAfterAdding).toHaveLength(usersBeforeAdding.length + 1)

    const usernames = usersAfterAdding.map(user => user.username)
    expect(usernames).toContain(newUser.username)
  })

  test('Username is already taken, creation fails with proper statuscode and message', async () => {
    const usersBeforeAdding = await helper.usersInDatabase()

    const newUser = {
      username: 'root',
      name: 'Superuser',
      password: 'anasalas',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('`username` to be unique')

    const usersAfterAdding = await helper.usersInDatabase()
    expect(usersAfterAdding).toHaveLength(usersBeforeAdding.length)
  })

  test('adding a new user with username length < 3 characters returns bad request 400 and message', async () => {
    const usersBeforeAdding = await usersInDatabase()

    const newUser = {
      username: 'em',
      name: 'Esa Mäkipää',
      password: 'salainen'
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain(`User validation failed: username: Path \`username\` (\`${newUser.username}\`) is shorter than the minimum allowed length (3).`)

    const usersAfterAdding = await helper.usersInDatabase()
    expect(usersAfterAdding).toHaveLength(usersBeforeAdding.length)
  })

  test('adding a new user with password length < 3 characters returns bad request 400 and message', async () => {
    const usersBeforeAdding = await usersInDatabase()

    const newUser = {
      username: 'ema',
      name: 'Esa Mäkipää',
      password: 'sa'
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('Minimum password length is 3 characters')

    const usersAfterAdding = await helper.usersInDatabase()
    expect(usersAfterAdding).toHaveLength(usersBeforeAdding.length)
  })
})

afterAll(() => {
  mongoose.connection.close()
})
