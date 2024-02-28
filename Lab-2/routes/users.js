const express = require("express")
const router = express.Router()
const data = require('../data')
const userData = data.users
const recipeData = data.recipes
const commentData = data.comments
const likeData = data.likes
const xss = require('xss')
const bcrypt = require('bcryptjs')
const validation = require('../helper');
const { recipes } = require('../data')

router
.route('/signup')
.post(async (req, res) => {
    let name = req.body.name
    let username = req.body.username
    let password = req.body.password

    username = username.toLowerCase()

    if(!username){
      res.status(400).json({error: "Enter username"})
      throw 'Enter username'
    } 
    if (username.trim().length === 0){
      res.status(400).json({error: "Enter username and not just spaces"})
      throw "Enter username and not just spaces";
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
        let insertedUser = await userData.createUser(name, username, password)

        if(insertedUser)   res.status(200).json(insertedUser)
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

        //req.session.user = {id: loggedUser.id, username: loggedUser.username}

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

module.exports = router;