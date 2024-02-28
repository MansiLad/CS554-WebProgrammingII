const recipeData = require('./recipes')
const userData = require('./users')
const commentData = require('./comments')
const likeData = require('./likes')

module.exports = {
    recipes: recipeData,
    users: userData,
    comments: commentData,
    likes: likeData
};