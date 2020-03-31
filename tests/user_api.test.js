const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const app = require('../app');
const supertest = require('supertest');
const helper = require('./test_helper');
const User = require('../models/user');

const api = supertest(app);

beforeEach(async () => {
  await User.deleteMany({});

  const passwordHash = await bcrypt.hash('secret', 10);
  const user = new User({ username: 'root', passwordHash });

  await user.save();
});

test('creation succeeds with a fresh user', async () => {
  const usersAtStart = await helper.usersInDb();

  const newUser = {
    username: 'akki',
    name: 'Akhil Sagiraju',
    password: 'akhil234'
  };

  await api
    .post('/api/users')
    .send(newUser)
    .expect(200)
    .expect('Content-Type', /application\/json/);

  const usersAtEnd = await helper.usersInDb();
  expect(usersAtEnd).toHaveLength(usersAtStart.length + 1);

  const usernames = usersAtEnd.map(u => u.username);
  expect(usernames).toContain(newUser.username);
});

test.only('user with less than 3 characters in username and password is not created', async () => {
  const usersAtStart = await helper.usersInDb();
  const newUser = {
    username: 'ak',
    name: 'Akhil',
    password: 'ak'
  };

  await api
    .post('/api/users')
    .send(newUser)
    .expect(400);

  const usersAtEnd = await helper.usersInDb();
  expect(usersAtEnd).toHaveLength(usersAtStart.length);
});

afterAll(() => {
  mongoose.connection.close();
});
