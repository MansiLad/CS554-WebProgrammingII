const mongoCollections = require('../config/mongoCollections')
let { ObjectId } = require("mongodb")
const data = require('./recipes')
const recipes = mongoCollections.recipes

const createComment = async(
    recipeId, userThatPostedComment, comment
) => {
    if (!recipeId) throw 'Error: You must provide an recipeId to search for';
    if (typeof recipeId !== 'string') throw 'Error: recipeId must be a string';
    recipeId = recipeId.trim();
    if (recipeId.length === 0)
      throw 'Error: recipeId cannot be an empty string or just spaces';
    if (!ObjectId.isValid(recipeId)) throw 'Error: invalid object ID';

    if(!userThatPostedComment)  throw "Error: pass the user who posted the comment"

    if(!comment)  throw 'You must provide a comment'
    if (typeof comment !== 'string')    throw 'Comment must be a string';
    if (comment.trim().length === 0)    throw 'Comment cannot be an empty string or just spaces';
    comment = comment.trim()

    const recipeCol = await recipes()
    let newComment = {
        _id: ObjectId(),
        userThatPostedComment: userThatPostedComment,
        comment: comment
    }
    const newComments = await recipeCol.updateOne({_id: ObjectId(recipeId)}, {$push:{comments: newComment}})
    //console.log(newComments)
    let recipeComm = await recipeCol.findOne({_id: ObjectId(recipeId)});
    return recipeComm
}

const removeComment = async(
    recipeId, commentId
) => {

    if (!recipeId) throw 'Error: You must provide an recipeId to search for';
    if (typeof recipeId !== 'string') throw 'Error: recipeId must be a string';
    recipeId = recipeId.trim();
    if (recipeId.length === 0)
      throw 'Error: recipeId cannot be an empty string or just spaces';
    if (!ObjectId.isValid(recipeId)) throw 'Error: invalid object ID';

    if (!commentId) throw 'Error: You must provide an commentId to search for';
    if (typeof commentId !== 'string') throw 'Error: commentId must be a string';
    commentId = commentId.trim();
    if (commentId.length === 0)
      throw 'Error: commentId cannot be an empty string or just spaces';
    if (!ObjectId.isValid(commentId)) throw 'Error: invalid object ID';

    const recipesCol = await recipes()
    const updateInfo = await recipesCol.updateOne(
        {_id: ObjectId(recipeId)},
        { $pull: {comments: {_id: ObjectId(commentId)}}}
    )
    //console.log(updateInfo)
    let recipeComm = await recipesCol.findOne({_id: ObjectId(recipeId)});
    return recipeComm
}

module.exports = {
    createComment,
    removeComment
}