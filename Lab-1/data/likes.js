const mongoCollections = require('../config/mongoCollections')
let { ObjectId } = require("mongodb")
const recipes = mongoCollections.recipes
const comment = mongoCollections.comments
const likes = mongoCollections.likes

const addLikes = async(recipeId, userId) => {

    if (!recipeId) throw 'Error: You must provide an recipeId to search for';
    if (typeof recipeId !== 'string') throw 'Error: recipeId must be a string';
    recipeId = recipeId.trim();
    if (recipeId.length === 0)
      throw 'Error: recipeId cannot be an empty string or just spaces';
    if (!ObjectId.isValid(recipeId)) throw 'Error: invalid object ID';

    if (!userId) throw 'Error: You must provide an userId to search for';
    if (typeof userId !== 'string') throw 'Error: userId must be a string';
    userId = userId.trim();
    if (userId.length === 0)
      throw 'Error: userId cannot be an empty string or just spaces';
    if (!ObjectId.isValid(userId)) throw 'Error: invalid object ID';

    const recipe = await recipes()

    const recipeExist = await recipe.findOne({_id: ObjectId(recipeId)})

    if(recipeExist === null)    throw "Recipe not found"
    
    const Update_recipe = await recipe.updateOne(
      {_id: ObjectId(recipeId)}, 
      {$push: {"likes": userId}}
    )

    let recipeComm = await recipe.findOne({_id: ObjectId(recipeId)});
    return recipeComm
  }

const removeLikes = async(recipeId, userId) => {
    if (!recipeId) throw 'Error: You must provide an recipeId to search for';
    if (typeof recipeId !== 'string') throw 'Error: recipeId must be a string';
    recipeId = recipeId.trim();
    if (recipeId.length === 0)
      throw 'Error: recipeId cannot be an empty string or just spaces';
    if (!ObjectId.isValid(recipeId)) throw 'Error: invalid object ID';

    if (!userId) throw 'Error: You must provide an userId to search for';
    if (typeof userId !== 'string') throw 'Error: userId must be a string';
    userId = userId.trim();
    if (userId.length === 0)
      throw 'Error: userId cannot be an empty string or just spaces';
    if (!ObjectId.isValid(userId)) throw 'Error: invalid object ID';

    const recipeCol = await recipes()

    const recipeExist = await recipeCol.findOne({_id: ObjectId(recipeId)})

    if(recipeExist === null)    throw "Recipe not found"
    
    const Update_recipe = await recipeCol.updateOne(
      {_id: ObjectId(recipeId)}, 
      {$pull: {"likes": userId}}
    )

    let recipeComm = await recipeCol.findOne({_id: ObjectId(recipeId)});
    return recipeComm
}

module.exports = {
    addLikes, 
    removeLikes
};