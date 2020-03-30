const blogRouter = require('express').Router();
const Blog = require('../models/blog');

blogRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({});
  response.json(blogs.map(blog => blog.toJSON()));
});

blogRouter.post('/', async (request, response) => {
  let blog;
  if (request.body.title && request.body.url) {
    if (!request.body.likes) {
      blog = new Blog({ ...request.body, likes: 0 });
    } else {
      blog = new Blog(request.body);
    }
    const result = await blog.save();
    response.status(201).json(result);
  } else {
    response.status(400).end();
  }
});

blogRouter.delete('/:id', async (request, response) => {
  await Blog.findByIdAndRemove(request.params.id);
  response.status(204).end();
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
