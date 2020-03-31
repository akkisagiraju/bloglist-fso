const jwt = require('jsonwebtoken');
const blogRouter = require('express').Router();
const Blog = require('../models/blog');
const User = require('../models/user');
require('express-async-errors');
const middleware = require('../utils/middleware');

blogRouter.use(middleware.tokenExtractor);

blogRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', {
    username: 1,
    name: 1,
    id: 1
  });
  response.json(blogs.map(blog => blog.toJSON()));
});

blogRouter.post('/', async (request, response) => {
  let blog;
  const decodedToken = jwt.verify(request.token, process.env.SECRET);
  const user = await User.findById(decodedToken.id);

  if (request.body.title && request.body.url) {
    if (!request.body.likes) {
      blog = new Blog({ ...request.body, likes: 0, user: user._id });
    } else {
      blog = new Blog({ ...request.body, user: user._id });
    }
    const savedBlog = await blog.save();
    user.blogs = user.blogs.concat(savedBlog._id);
    await user.save();
    response.status(201).json(savedBlog);
  } else {
    response.status(400).end();
  }
});

blogRouter.delete('/:id', async (request, response) => {
  const decodedToken = jwt.verify(request.token, process.env.SECRET);
  const user = await User.findById(decodedToken.id);
  const blog = await Blog.findById(request.params.id);
  if (blog.user.toString() === user._id.toString()) {
    await Blog.findByIdAndRemove(request.params.id);
    return response.status(204).end();
  }
  response
    .status(401)
    .send({ error: 'This blog does not belong to the user' })
    .end();
});

blogRouter.put('/:id', async (request, response) => {
  const newBlog = request.body;
  await Blog.findByIdAndUpdate(
    request.params.id,
    { $set: newBlog },
    { upsert: true, new: true }
  );
  response.status(200).end();
});

module.exports = blogRouter;
