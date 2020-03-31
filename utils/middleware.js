const logger = require('./logger');
const jwt = require('jsonwebtoken');

const tokenExtractor = (request, response, next) => {
  let authorization = request.get('authorization');
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    authorization = authorization.substring(7);
  }

  if (authorization) {
    const decodedToken = jwt.verify(authorization, process.env.SECRET);
    if (!authorization || !decodedToken) {
      return response.status(401).json({ error: 'Invalid token' });
    } else {
      request.token = authorization;
      next();
    }
  } else {
    response.send({ error: 'Token is not supplied' });
  }
};

const requestLogger = (request, response, next) => {
  logger.info('Method:', request.method);
  logger.info('Path:  ', request.path);
  logger.info('Body:  ', request.body);
  logger.info('---');
  next();
};

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' });
};

const errorHandler = (error, request, response, next) => {
  logger.error(error.message);

  if (error.name === 'CastError' && error.kind === 'ObjectId') {
    return response.status(400).send({ error: 'malformatted id' });
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message });
  } else if (error.name === 'JsonWebTokenError') {
    return response.status(401).json({
      error: 'Invalid token'
    });
  }

  next(error);
};

module.exports = {
  requestLogger,
  tokenExtractor,
  unknownEndpoint,
  errorHandler
};
