const _ = require('lodash');

const dummy = blogPostList => {
  console.log(blogPostList);
  return 1;
};

const totalLikes = blogPostList => {
  const reducer = (sum, item) => sum + item.likes;
  return blogPostList.length === 0 ? 0 : blogPostList.reduce(reducer, 0);
};

const favoriteBlog = blogPostList => {
  return blogPostList.reduce((a, b) =>
    a.likes > b.likes
      ? { title: a.title, author: a.author, likes: a.likes }
      : { title: b.title, author: b.author, likes: b.likes }
  );
};

const mostBlogs = blogPostList => {
  const resultObject = _.countBy(blogPostList, 'author');
  const authorWithMostBlogs = Object.keys(resultObject).reduce((a, b) =>
    resultObject[a] > resultObject[b] ? a : b
  );
  return {
    author: authorWithMostBlogs,
    blogs: resultObject[authorWithMostBlogs]
  };
};

const mostLikes = blogPostList => {
  const authorsList = _.uniq(_.map(blogPostList, 'author'));
  const finalArray = authorsList.map(author => ({
    author,
    likes: blogPostList
      .filter(post => post.author === author)
      .reduce((sum, item) => sum + item.likes, 0)
  }));

  return _.maxBy(finalArray, 'likes');
};

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
};
