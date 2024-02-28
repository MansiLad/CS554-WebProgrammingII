const mongoCollection = require("../config/mongoCollections")
const recipesData = mongoCollection.recipes
const commentsData = mongoCollection.comments
const usersData = mongoCollection.users
const comment = require("./comments")
let { ObjectId } = require('mongodb')

const createRecipe = async(
    title, 
    ingredients, 
    cookingSkillRequired, 
    steps, 
    userThatPosted,
) => {
    
    if(!title)  throw 'You must provide a title'
    if (typeof title !== 'string')    throw 'Title must be a string';
    if (title.trim().length === 0)    throw 'Title cannot be an empty string or just spaces';
    title = title.trim()
    if(title.length < 2)               throw 'Title must of atleast 2 characters'
    if(!/^[A-Za-z0-9\s]+$/.test(title))  throw 'Title should only contain letters and numbers'


    if (!ingredients || !Array.isArray(ingredients))  throw 'You must provide an array of ingredients';
    if (ingredients.length < 3) throw 'You must supply at least three ingredient';
    for (i in ingredients) {
      if (typeof ingredients[i] !== 'string' || ingredients[i].trim().length === 0) {
        throw 'One or more ingredients is not a string or is an empty string';
      }
      if(!/^[A-Za-z0-9./%$\s]+$/.test(ingredients[i])) throw 'Ingredients can have only characters and numbers'
      ingredients[i] = ingredients[i].trim();
      if(ingredients[i].length < 3)    throw 'Ingredients should have min 3 characters'
    }

    if (!steps || !Array.isArray(steps))  throw 'You must provide an array of steps';
    if (steps.length < 5) throw 'You must supply at least five steps';
    for (i in steps) {
      if (typeof steps[i] !== 'string' || steps[i].trim().length === 0) {
        throw 'One or more steps is not a string or is an empty string';
      }
      //if(!/^[a-zA-Z0-9!@#$%^&*]+$/.test(steps)) throw 'Steps can have only characters and numbers and few special charachters'
      //if(!/^[A-Za-z0-9\s]+$/.test(steps[i])) 
      steps[i] = steps[i].trim();
      if(steps[i].length < 20)    throw 'Steps should have min 20 characters'
    }

    if (!cookingSkillRequired) throw 'You must provide a Cooking Skill';
    if (typeof cookingSkillRequired !== 'string')    throw 'Cooking Skill must be a string';
    if (cookingSkillRequired.trim().length === 0)    throw 'Cooking Skill cannot be an empty string or just spaces';
    cookingSkillRequired = cookingSkillRequired.trim()
    validcookingSkill = ["Novice", "Intermediate", "Advanced"]
    cnt = 0;
    for (let i = 0; i < validcookingSkill.length; i++) {
      if(validcookingSkill[i].toLowerCase() == cookingSkillRequired.toLowerCase()){
        cnt++
      }
    }
    if(cnt == 0)  throw "Invalid Cooking Skill. Cooking Skill should be one of the following: Novice, Intermediate, Advanced"

    const newRecipe = {
        title: title,
        ingredients: ingredients, 
        cookingSkillRequired: cookingSkillRequired,
        steps: steps,
        userThatPosted: userThatPosted,
        comments:[],
        likes: []
      };
    
      const recipeCollection = await recipesData();
      const insertInfo = await recipeCollection.insertOne(newRecipe);
      if (!insertInfo.acknowledged || !insertInfo.insertedId) throw 'Could not add recipe';
      const recipe = await getRecipeById(insertInfo.insertedId.toString());
      return JSON.parse(JSON.stringify(recipe));

};

const getAllRecipe = async(pagenumber) => {
    const recipeCollection = await recipesData();

    const allrecipe = await recipeCollection.find({}).toArray()

    if(allrecipe.length < pagenumber) {
      throw 'Error: no more recipes'
    }

    const recipeList = await recipeCollection.find({}).skip(pagenumber).limit(50).toArray()
    return JSON.parse(JSON.stringify(recipeList));
};

const getRecipe = async() => {
  const recipeCollection = await recipesData();
  const recipeList = await recipeCollection.find({}).toArray();
  return JSON.parse(JSON.stringify(recipeList));
}

const getRecipeById = async(
    recipeId
) => {
    if (!recipeId) throw 'Error: You must provide an recipeId to search for';
    if (typeof recipeId !== 'string') throw 'Error: recipeId must be a string';
    recipeId = recipeId.trim();
    if (recipeId.length === 0)
      throw 'Error: recipeId cannot be an empty string or just spaces';
    if (!ObjectId.isValid(recipeId)) throw 'Error: invalid object ID';

    const recipeCollection = await recipesData();
    const recipe = await recipeCollection.findOne({_id: ObjectId(recipeId)});
    if (!recipe) throw 'No recipe with that id';
    return JSON.parse(JSON.stringify(recipe))
};

const removeRecipe = async(
    recipeId
) => {
    if (!recipeId) throw 'Error: You must provide an recipeId to search for';
    if (typeof recipeId !== 'string') throw 'Error: recipeId must be a string';
    recipeId = recipeId.trim();
    if (recipeId.length === 0)
      throw 'Error: recipeId cannot be an empty string or just spaces';
    if (!ObjectId.isValid(recipeId)) throw 'Error: invalid object ID';

    const recipeCollection = await recipesData()
    let recipe = await getRecipeById(recipeId)
    const deletionInfo = await recipeCollection.deleteOne({_id: ObjectId(recipeId)})

    if(deletionInfo.deletedCount === 0) {
        throw `Could not delete recipe with id of ${id} : Recipe not present`
    }
    return `${recipe.title} is deleted successfully!`
};

const getListOfRecipes = async (skip, limit) => {
  if (limit > 50) throw "50 Max can be displayed at a time";
  if (!/^[1-9][0-9]*$/.test(skip) || skip < 0) throw 'Enter Valid page number';
  const recipesCollection = await recipesData();
  const recipesList = await recipesCollection.find({}).skip(skip).limit(limit).toArray();
  return JSON.parse(JSON.stringify(recipesList));
}

const updateRecipe = async(
    recipeId, 
    title, 
    ingredients,
    cookingSkillRequired,
    steps
    
) => {

    if(!title)  throw 'You must provide a title'
    if (typeof title !== 'string')    throw 'Title must be a string';
    if (title.trim().length === 0)    throw 'Title cannot be an empty string or just spaces';
    title = title.trim()
    if(title.length < 2)               throw 'Title must of atleast 2 characters'
    if(!/^[A-Za-z0-9\s]+$/.test(title))  throw 'Title should only contain letters and numbers'


    if (!ingredients || !Array.isArray(ingredients))  throw 'You must provide an array of ingredients';
    if (ingredients.length < 3) throw 'You must supply at least three ingredient';
    for (i in ingredients) {
      if (typeof ingredients[i] !== 'string' || ingredients[i].trim().length === 0) {
        throw 'One or more ingredients is not a string or is an empty string';
      }
      if(!/^[A-Za-z0-9\s]+$/.test(ingredients[i])) throw 'Ingredients can have only characters and numbers'
      ingredients[i] = ingredients[i].trim();
      if(ingredients[i].length < 3)    throw 'Ingredients should have min 3 characters'
    }

    if (!steps || !Array.isArray(steps))  throw 'You must provide an array of steps';
    if (steps.length < 5) throw 'You must supply at least five steps';
    for (i in steps) {
      if (typeof steps[i] !== 'string' || steps[i].trim().length === 0) {
        throw 'One or more steps is not a string or is an empty string';
      }
      //if(!/^[a-zA-Z0-9!@#$%^&*]+$/.test(steps)) throw 'Steps can have only characters and numbers and few special charachters'
      steps[i] = steps[i].trim();
      if(steps[i].length < 20)    throw 'Steps should have min 20 characters'
    }

    if (!cookingSkillRequired) throw 'You must provide a Cooking Skill';
    if (typeof cookingSkillRequired !== 'string')    throw 'Cooking Skill must be a string';
    if (cookingSkillRequired.trim().length === 0)    throw 'Cooking Skill cannot be an empty string or just spaces';
    cookingSkillRequired = cookingSkillRequired.trim()
    validcookingSkill = ["Novice", "Intermediate", "Advanced"]
    cnt = 0;
    for (let i = 0; i < validcookingSkill.length; i++) {
      if(validcookingSkill[i].toLowerCase() == cookingSkillRequired.toLowerCase()){
        cnt++
      }
    }
    if(cnt == 0)  throw "Invalid Cooking Skill. Cooking Skill should be one of the following: Novice, Intermediate, Advanced"

    const recipeCollection = await recipesData();
    const updatedListing = {
        title: title,
        ingredients: ingredients, 
        cookingSkillRequired: cookingSkillRequired,
        steps: steps
    };
  
    let temprecipe = await getRecipeById(recipeId);

    if(temprecipe.title == title && temprecipe.ingredients === ingredients && temprecipe.cookingSkillRequired === cookingSkillRequired && temprecipe.steps === steps)
        throw "All values are same! No changes to be made"   
  
    const updatedInfo = await recipeCollection.updateOne(
      { _id: ObjectId(recipeId) },
      { $set: updatedListing }
    );
    if (updatedInfo.modifiedCount === 0) {
      throw "could not update property successfully";
    }

    const recipe = await getRecipeById(recipeId);

    return JSON.parse(JSON.stringify(recipe));

};

const compareArrays = async(array1, array2) => {
  if(array1.length!= array2.length){
    return false
  }
  for (let i = 0; i < array1.length; i++) {
    if(array1[i] != array2[i]){
      return false
    } 
  }
  return true
}

module.exports = {
    createRecipe,
    getAllRecipe,
    getRecipeById,
    removeRecipe,
    updateRecipe, 
    compareArrays,
    getRecipe, 
    getListOfRecipes
}