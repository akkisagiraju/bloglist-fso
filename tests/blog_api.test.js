const mongoose = require('mongoose');
const app = require('../app');
const supertest = require('supertest');
const helper = require('./test_helper');
const Blog = require('../models/blog');

const api = supertest(app);

beforeEach(async () => {
  await Blog.deleteMany({});

  let blogObject = new Blog(helper.initialBlogs[0]);
  await blogObject.save();

  blogObject = new Blog(helper.initialBlogs[1]);
  await blogObject.save();
});

describe('where are some blogs saved initially', () => {
  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-type', /application\/json/);
  });

  test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs');
    expect(response.body.length).toBe(helper.initialBlogs.length);
  });

  test('all blogs have a property called id', async () => {
    const response = await api.get('/api/blogs');
    response.body.forEach(blog => {
      expect(blog.id).toBeDefined();
    });
  });
});

describe('addition of blogs', () => {
  test('a valid blog post can be added', async () => {
    const newBlog = {
      title: 'React patterns',
      author: 'Michael Chan',
      url: 'https://reactpatterns.com/',
      likes: 7
    };
    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-type', /application\/json/);

    const blogsAtEnd = await helper.blogsInDb();
    expect(blogsAtEnd.length).toBe(helper.initialBlogs.length + 1);
  });

  test('if likes property is missing from the request, it should default to 0', async () => {
    const newBlogSansLikes = {
      title: 'My Testing Journey',
      author: 'Akhil Sagiraju',
      url: 'https://twitter.com/akhilalltheway'
    };
    await api
      .post('/api/blogs')
      .send(
        newBlogSansLikes.likes
          ? newBlogSansLikes
          : { ...newBlogSansLikes, likes: 0 }
      )
      .expect(201);
    const blogsAtEnd = await helper.blogsInDb();
    console.log(blogsAtEnd);
    expect(blogsAtEnd.length).toBe(helper.initialBlogs.length + 1);
  });

  test('fails with 400, if title and url are missing from the request', async () => {
    const blog = {
      author: 'Akhil Sagiraju',
      likes: 4
    };
    await api
      .post('/api/blogs')
      .send(blog)
      .expect(400);
  });
});

describe('deletion of a blog', () => {
  test('succeeds with status code 204 if id is valid', async () => {
    const blogsAtStart = await helper.blogsInDb();
    const blogToDelete = blogsAtStart[0];

    await api.delete(`/api/blogs/${blogToDelete.id}`).expect(204);
    const blogsAtEnd = await helper.blogsInDb();
    expect(blogsAtEnd.length).toBe(blogsAtStart.length - 1);

    const titles = blogsAtEnd.map(blog => blog.title);
    expect(titles).not.toContain(blogToDelete.title);
  });
});

describe('updating a blog', () => {
  test('succeeds updating likes when likes is provided in request body', async () => {
    const blogsAtStart = await helper.blogsInDb();
    const blogToUpdate = blogsAtStart[0];

    await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send({ likes: 20 })
      .expect(200);

    const blogsAtEnd = await helper.blogsInDb();
    expect(blogsAtEnd.length).toBe(blogsAtStart.length);

    const updatedBlog = blogsAtEnd.filter(
      blog => blog.id === blogToUpdate.id
    )[0];
    expect(updatedBlog.likes).toBe(20);
  });
});

afterAll(() => {
  mongoose.connection.close();
});
