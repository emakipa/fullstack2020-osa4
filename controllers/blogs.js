const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

//get all blogs
blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
  response.json(blogs)
})

//get blog with specific id
blogsRouter.get('/:id', async (request, response) => {
  const blog = await Blog.findById(request.params.id)

  if (!blog) {
    response.status(404).json({ error: 'blog not found' })
  } else {
    response.json(blog)
  }
})

//add new blog
blogsRouter.post('/', async (request, response) => {
  const body = request.body

  //verify token's correctness and get decoded token
  //middleware is used to isolate token from authorization
  const decodedToken = jwt.verify(request.token, process.env.SECRET)
  if (!request.token || !decodedToken.id) {
    return response.status(401).json({ error: 'token is missing or invalid' })
  }
  //get user with decode token id from users database
  const user = await User.findById(decodedToken.id)

  //  const user = await User.findById(body.userId)

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes || 0,
    user: user._id
  })

  if(blog.title === '' || blog.url === '') {
    response.status(400).json({ error: 'invalid title and/or url' })
  } else {
    const savedBlog = await blog.save()
    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()
    response.status(201).json(savedBlog.toJSON())
  }
})

//update blog
blogsRouter.put('/:id', async (request, response) => {
  const body = request.body

  const blog = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
  }

  if (!blog) {
    response.status(500).json({ error: 'blog not found' })
  } else {
    const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true })
    response.status(201).json(updatedBlog.toJSON())
  }
})

//delete a specific blog
blogsRouter.delete('/:id', async (request, response) => {
  //middleware is used to isolate token from authorization
  const token = request.token

  //verify token's correctness and get decoded token
  const decodedToken = jwt.verify(token, process.env.SECRET)
  if (!token || !decodedToken.id) {
    return response.status(401).json({ error: 'token is missing or invalid' })
  }

  //get user with decoded token id from users database
  const user = await User.findById(decodedToken.id)
  //get blog with specified id from blogs database
  const blog = await Blog.findById(request.params.id)

  if (blog.user.toString() === user.id.toString()) {
    await Blog.findByIdAndRemove(request.params.id)
    response.status(204).end()
  } else {
    response.status(401).json({ error: 'unauthorized user to remove a blog' })
  }
})

module.exports = blogsRouter
