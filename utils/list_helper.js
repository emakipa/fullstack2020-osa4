const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  const reducer = (sum, item) => {
    return sum + item.likes
  }
  return blogs.length === 0
    ? 0
    : blogs.reduce(reducer, 0)
}

const favoriteBlog = (blogs) => {
  const filteredBlog = blogs.reduce((a, item) => {
    return (a.likes > item.likes) ? a : item
  })

  const result = {
    title: filteredBlog.title,
    author: filteredBlog.author,
    likes: filteredBlog.likes
  }

  return result
}

const mostBlogs = (blogs) => {
  let authors = {}

  blogs.forEach(blog => {
    if (blog.author in authors) {
      authors[blog.author] += 1
    } else {
      authors[blog.author] = 1
    }
  })

  const most = Object.keys(authors).reduce((a, b) => {
    return (authors[a] > authors[b]) ? a : b
  })

  const result = {
    author: most,
    blogs: authors[most]
  }

  return result
}

const mostLikes = (blogs) => {
  let authors = {}

  blogs.forEach(blog => {
    if (blog.author in authors) {
      authors[blog.author] += blog.likes
    } else {
      authors[blog.author] = blog.likes
    }
  })

  const most = Object.keys(authors).reduce((a, b) => {
    return (authors[a] > authors[b]) ? a : b
  })

  const result = {
    author: most,
    likes: authors[most]
  }

  return result
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}