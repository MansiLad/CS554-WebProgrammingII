const express = require('express')
const router = express.Router()
const data = require('../data')
const userData = data.users
const recipeData = data.recipes
const commentData = data.comments
const likeData = data.likes
const xss = require('xss')
const bcrypt = require('bcryptjs')
const validation = require('../helper');
const { recipes } = require('../data');
let { ObjectId } = require('mongodb')

router
.route('/signup')
.post(async (req, res) => {
    name = req.body.name
    username = req.body.username
    password = req.body.password

    username = username.toLowerCase()

    if(!username){
      res.status(400).json({error: "Enter username"})
      throw 'Enter username'
    } 
    if (username.trim().length === 0){
      res.status(400).json({error: "Enter username and not just spaces"})
      throw "Enter username and not just spaces";
    } 
    if(!/^(?=.*[a-zA-Z])[a-zA-Z\d]+$/.test(username)) {
        res.status(400).json({error: "username should only contain letters and numbers"})
        //throw 'username should only contain letters and numbers'
    }
    username = username.trim()

    if(!password){
      res.status(400).json({error: "Enter password"})
      throw 'Enter password'
    } 
    if (password.trim().length === 0){
      res.status(400).json({error: "Enter password and not just spaces"})
      throw "Enter password and not just spaces";
    } 
    password = password.trim()

    try {
        let {insertedUser} = await userData.createUser(name, username, password)

        if(insertedUser)   res.status(200).json({"Success":"User created"})
        else    res.status(404).json({error: "User not entered"})
    } catch(e){
        res.status(404).json({ error: e });
    }
});

router
.route('/login')
.post(async (req, res) =>{
    try {

        let username = req.body.username
        let password = req.body.password

        username = username.toLowerCase()
  
        if(!username){
          res.status(400).render({error: "Enter username"})
          throw 'Enter username'
        } 
        if (username.trim().length === 0){
          res.status(400).render({error: "Enter username and not just spaces"})
          throw "Enter username and not just spaces";
        } 
        username = username.trim()
    
        if(!password){
          res.status(400).render({error: "Enter password"})
          throw 'Enter password'
        } 
        if (password.trim().length === 0){
          res.status(400).render({error: "Enter password and not just spaces"})
          throw "Enter password and not just spaces";
        } 
        password = password.trim()

        const loggedUser = await userData.checkUser(username, password)

        req.session.user = {id: loggedUser.id, username: loggedUser.username}

        res.status(200).json({"success":"Authenticated"})

    } catch(e){
        let error = e.toString();
        res.status(404).json({ error: error });
    }

});

router
.route('/logout')
.post(async (req, res) => {
    req.session.destroy();
    return res.json({message:"You are logged out"});
});

router
    .route('/recipes')
    .get(async (req, res) => {
        if (req.query.page && !/^\d+$/.test(req.query.page)) {
            return res.status(400).json({ error: "Page must be a positive number" });
        }

        let start = 0
        const count = 50

        if(req.query.page)     start = parseInt(req.query.start)
        else    start = 0

        const allRecipes = await recipes.getAllRecipe()
        res.status(200).json(allRecipes.slice(start*count, start+count))

    })
    .post(async (req, res) => {
        if(!req.session.user){
            return res.status(404).json({error:'User needs to log in to post'});
        }

        let {title, ingredients, cookingSkillRequired, steps } = req.body

        if(!title)            return res.status(400).json({error: "Provide title of recipe"})
        if(typeof title != 'string')  return res.status(400).json({error: "Provide title of recipe as string"})
        if(title.trim().length === 0)   return res.status(400).json({error: "Provide title of recipe"})
        title = title.trim()
        if(!/^[A-Za-z0-9\s]+$/.test(title))  return res.status(400).json({error: "Title should only contain letters and numbers"})

        if(!ingredients)    return res.status(400).json({error: "Provide ingredients of recipe"})
        if(!Array.isArray(ingredients)) return res.status(400).json({error: "Provide ingredients of recipe"})
        if(ingredients.length === 0)    return res.status(400).json({error: "Provide ingredients of recipe"})
        for (let i = 0; i < ingredients.length; i++) {
            if (typeof ingredients[i]!='string')  return res.status(400).json({error: "Ingredients must be a string"})
        }

        if(!steps)return res.status(400).json({error: "Provide Steps of recipe"})
        if(!Array.isArray(steps))   return res.status(400).json({error: "Provide Steps of recipe"})
        if(steps.length === 0)  return res.status(400).json({error: "Provide Steps of recipe"})
        for (let i = 0; i < steps.length; i++) {
            if (typeof steps[i]!='string')  return res.status(400).json({error: "Ingredients must be a string"})
        }
        
        if(!cookingSkillRequired)   return res.status(400).json({error: "Provide cooking skill for recipe"})
        if(typeof cookingSkillRequired != 'string') return res.status(400).json({error: "provide cooking skill for recipe as string"})
        if (cookingSkillRequired.trim().length === 0)   return res.status(400).json({error: "Provide cooking skill for recipe"})
        cookingSkillRequired = cookingSkillRequired.trim()

        let user = {id: req.session.user.id, username: req.session.user.username }
        userThatPosted = user;

        try {
            const newRecipe = await recipeData.createRecipe(title, ingredients, cookingSkillRequired, steps, userThatPosted)
            return res.status(200).json(newRecipe)
        } catch(e) {
            console.log(e)
            return res.status(400).json({error: e})
        }
    });

router
    .route('/recipes/:recipeId')
    .get(async (req, res) => {
        let recipeId = req.params.recipeId

        if (!recipeId)  res.status(400).json({error: "You must provide an recipeId to search for"}) 
        if (typeof recipeId != 'string')   res.status(400).json({error: "recipeId must be a string"})
        recipeId = recipeId.trim();
        if (recipeId.length === 0)  res.status(400).json({error: "recipeId cannot be an empty string or just spaces"})
        if (!ObjectId.isValid(recipeId))    res.status(400).json({error: "Invalid object ID"})
    
        try{
            const recipe = await recipeData.getRecipeById(xss(recipeId));
            return res.status(200).json(recipe)
        } catch(e) {
            return res.status(404).json({error:"Recipe not found!"})
        }
    })
    .patch(async (req, res) => {
        if(!req.session.user){
            return res.status(404).json({error:'User needs to log in to post'});
        }
        let {title, ingredients, cookingSkillRequired, steps} = req.body
        //console.log(title)
        let recipeId = req.params.recipeId
        if(!title){
            return res.status(400).json({error: "Provide title of recipe"})
        }
        if(typeof title != 'string'){
            return res.status(400).json({error: "Provide title of recipe as string"})
        }
        if(title.trim().length === 0){
            return res.status(400).json({error: "Provide title of recipe"})
        }    
        title = title.trim()
        if(!/^[A-Za-z0-9\s]+$/.test(title)) {
            return res.status(400).json({error: "Title should only contain letters and numbers"})
        }

        if(!ingredients){
            return res.status(400).json({error: "Provide ingredients of recipe"})
        }
        if(!Array.isArray(ingredients)){
            return res.status(400).json({error: "Provide ingredients of recipe"})
        }
        if(ingredients.length === 0){
            return res.status(400).json({error: "Provide ingredients of recipe"})
        }
        for (let i = 0; i < ingredients.length; i++) {
            if (typeof ingredients[i]!='string') {
                return res.status(400).json({error: "Ingredients must be a string"})
            }
        }

        if(!steps){
            return res.status(400).json({error: "Provide Steps of recipe"})
        }
        if(!Array.isArray(steps)){
            return res.status(400).json({error: "Provide Steps of recipe"})
        }
        if(steps.length === 0){
            return res.status(400).json({error: "Provide Steps of recipe"})
        }
        for (let i = 0; i < steps.length; i++) {
            if (typeof steps[i]!='string') {
                return res.status(400).json({error: "Ingredients must be a string"})
            }
        }
        
        if(!cookingSkillRequired){
            return res.status(400).json({error: "Provide cooking skill for recipe"})
        }
        if(typeof cookingSkillRequired != 'string'){
            return res.status(400).json({error: "provide cooking skill for recipe as string"})
        }
        if (cookingSkillRequired.trim().length === 0){
            return res.status(400).json({error: "Provide cooking skill for recipe"})
        }   
        cookingSkillRequired = cookingSkillRequired.trim()

        try{
            const currentUserId = req.session.id
            let Recipe = await recipeData.getRecipeById(recipeId)
            //console.log(Recipe)
            if(title !== Recipe.title)   Recipe.title = title
            if(ingredients !== Recipe.ingredients)   Recipe.ingredients = ingredients
            if(steps !== Recipe.steps)   Recipe.steps = steps
            if(cookingSkillRequired !== Recipe.cookingSkillRequired)   Recipe.cookingSkillRequired = cookingSkillRequired

            if(Recipe.userThatPosted.id !== req.session.user.id){
                res.status(404).json({error: "You cannot update someone elses recipe"})
            }

            const updated = await recipeData.updateRecipe(
                req.params.id,
                title, ingredients, cookingSkillRequired, steps
            );
            console.log(updated)
            res.status(200).json(updated);
        } catch (e) {
            res.status(500).json({error: e });
        }

/* 
        try {
            let Recipe = await recipeData.getRecipeById(req.params.recipeId)
            console.log(Recipe)
            if(title !== Recipe.title)   Recipe.title = title
            if(ingredients !== Recipe.ingredients)   Recipe.ingredients = ingredients
            if(steps !== Recipe.steps)   Recipe.steps = steps
            if(cookingSkillRequired !== Recipe.cookingSkillRequired)   Recipe.cookingSkillRequired = cookingSkillRequired

            console.log(Recipe)
        } catch (e) {
            res.status(404).json({error: "Recipe not found"})
        } */
/* 
        try {
            //console.log(updatedObject);
            const updated = await recipeData.updateRecipe(
              req.params.id,
              title, ingredients, cookingSkillRequired, steps
            );
            res.status(200).json(updated);
        } catch (e) {
            res.status(500).json({error: e });
        } */
    });


router
    .route('/recipes/:recipeId/comments')
    .post(async (req, res) => {
        if(!req.session.user){
            return res.status(404).json({error:'User needs to log in to post'});
        }

        let recipeId = req.params.recipeId
        const comment = req.body.comment
        let userid = req.session.user.id

        if(comment === null)     return res.status(400).json({error: "Enter a comment"})
        if(typeof comment != "string")     return res.status(400).json({error: "Comment must be a string"})
        if(comment.trim().length == 0)     return res.status(400).json({error: "Comment should not be of spaces"})

        if (!recipeId)  res.status(400).json({error: "You must provide an recipeId to search for"}) 
        if (typeof recipeId !== 'string')   res.status(400).json({error: "recipeId must be a string"})
        recipeId = recipeId.trim();
        if (recipeId.length === 0)  res.status(400).json({error: "recipeId cannot be an empty string or just spaces"})
        if (!ObjectId.isValid(recipeId))    res.status(400).json({error: "Invalid object ID"})

        try {
            const recipe = await recipeData.getRecipeById(recipeId)
            const user = await userData.getUserById(userid.toString())
            if(recipe === null)      return res.status(404).json({error:"Recipe not found"})
            const updateRecipe = await commentData.createComment(recipeId, user, comment)
            console.log("Updated Recipe")
            console.log(updateRecipe)
            return res.status(200).json(updateRecipe)
        } catch (e) {
            return res.status(400).json({error: e})
        }
    });

router 
    .route('/recipes/:recipeId/:commentId')
    .delete(async (req, res) => {
        if(!req.session.user){
            return res.status(404).json({error:'User needs to log in to post'});
        }

        let recipeId = req.params.recipeId
        let commentId = req.params.commentId
        //console.log(recipeId, commentId)

        if (!recipeId)  res.status(400).json({error: "You must provide an recipeId to search for"}) 
        if (typeof recipeId !== 'string')   res.status(400).json({error: "recipeId must be a string"})
        recipeId = recipeId.trim();
        if (recipeId.length === 0)  res.status(400).json({error: "recipeId cannot be an empty string or just spaces"})
        if (!ObjectId.isValid(recipeId))    res.status(400).json({error: "Invalid object ID of recipe"})

        if (!commentId)  res.status(400).json({error: "You must provide an commentId to search for"}) 
        if (typeof commentId !== 'string')   res.status(400).json({error: "commentId must be a string"})
        commentId = commentId.trim();
        if (commentId.length === 0)  res.status(400).json({error: "commentId cannot be an empty string or just spaces"})
        if (!ObjectId.isValid(commentId))    res.status(400).json({error: "Invalid object ID of comment"})

        try {
            const recipe = await recipeData.getRecipeById(recipeId)
            if(recipe == null)  return res.status(404).json({ error: "Recipe not found"})
            let flag = 0
            const user = await userData.getUserById(req.session.user.id)
            let updatedRecipe;
            for (let comment of recipe.comments) {
                if (user.id.toString() !== comment.userThatPostedComment.id.toString()) {
                    return res.status(404).json({error: "Unauthorized: You can only delete comment made by you"})
                }
                
                if(comment.id.toString() === commentId) {
                    updatedRecipe = await commentData.removeComment(recipeId, commentId)
                    flag = 1
                    break;
                }
            }
            if(flag == 0)   return res.status(404).json({error: "Comment not found"})
            return res.status(200).json(updatedRecipe)
        } catch(e) {
            return res.status(500).json({error:"Server Error"})
        }
    });

router
    .route('/recipes/:recipeId/likes')
    .post(async (req, res) => {
        if(!req.session.user){
            return res.status(404).json({error:'User needs to log in to post'});
        }

        let recipeId = req.params.recipeId
        if (!recipeId)  res.status(400).json({error: "You must provide an recipeId to search for"}) 
        if (typeof recipeId !== 'string')   res.status(400).json({error: "recipeId must be a string"})
        recipeId = recipeId.trim();
        if (recipeId.length === 0)  res.status(400).json({error: "recipeId cannot be an empty string or just spaces"})
        if (!ObjectId.isValid(recipeId))    res.status(400).json({error: "Invalid object ID"})

        try {
            const recipe = await recipeData.getRecipeById(recipeId)
            const user = await userData.getUserById(req.session.user.id)
            if(recipe == null)  return res.status(404).json({ error: "Recipe not found"})
            let flag = 0
            let updatedRecipe;

            for (const like of recipe.likes) {
                if(like.toString() === user.id.toString()) {
                    updatedRecipe = await likeData.removeLikes(recipeId, user.id.toString())
                    flag += 1
                    break;
                }
            }
            if(flag == 0){
                updatedRecipe = await likeData.addLikes(recipeId, user.id.toString())
            }
            return res.status(200).json(updatedRecipe)
        } catch(e) {
            return res.status(404).json({error:"Server Error"})
        }
    });

module.exports = router;