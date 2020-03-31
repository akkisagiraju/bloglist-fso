const bcrypt = require('bcrypt');
require('express-async-errors');
const usersRouter = require('express').Router();
const User = require('../models/user');
const middleware = require('../utils/middleware');

usersRouter.use(middleware.tokenExtractor);

usersRouter.post('/', async (request, response) => {
  const { name, username, password } = request.body;
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const user = new User({
    username,
    name,
    passwordHash
  });

  const savedUser = await user.save();
  response.json(savedUser);
});

usersRouter.get('/', async (request, response) => {
  const users = await User.find({}).populate('blogs', {
    url: 1,
    title: 1,
    author: 1,
    id: 1
  });
  response.json(users.map(u => u.toJSON()));
});

module.exports = usersRouter;
