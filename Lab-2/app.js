const express = require('express')
const app = express()
const session = require('express-session')
const redis = require('redis');
const connectRedis = require('connect-redis');
const configRoutes = require('./routes')
const recipes = require("./data").recipes

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const RedisStore = connectRedis(session)

const redisClient = redis.createClient({
  legacyMode: true,
  host: 'localhost',
  port: 6379
})
redisClient.connect().then(() => {});

redisClient.on('error', function (err) {
    console.log('Could not establish a connection with redis. ' + err);
});

redisClient.on('connect', function (err) {
    console.log('Connected to redis successfully');
});

app.use(session({
    store: new RedisStore({ client: redisClient }),
    name: 'AuthCookie',
    secret: 'MMCS554',
    resave: false,
    saveUninitialized: true
}));

const urlCnt = {}

app.use((req, res, next) => {
  date = new Date();

  const url = req.originalUrl
  if(urlCnt[url] == undefined) {
    urlCnt[url] = 1
  } else {
    urlCnt[url] = urlCnt[url] + 1
  }
  console.log(
    `[${date.toUTCString()}]:\t${req.method}\t${req.originalUrl}\t${urlCnt[url]}\t${
      req.session.user ? "(Authenticated User)" : "(Non-Authenticated User)"
    }`
  )
  next()
})

app.use('/recipes/:recipeid', async(req, res, next) => {

  let id = req.params.recipeid

  const recipe = await redisClient.exists(id)

  if(req.method == "PATCH" || req.method == "POST" || req.method == "DELETE"){
    if(!req.session.user){
      return res.status(404).json({error:'User needs to log in to post/patch/delete'});
    }
    next()
  } else{
    if(recipe) {
      const recipebyid = await redisClient.v4.hGetAll(id)
      let count = parseInt(recipebyid.count) + 1
      await redisClient.v4.zIncrBy('RecipeCount', 1, id);
      await redisClient.v4.hSet(id, "count", count)
      return res.status(200).json(JSON.parse(recipebyid.data))
    } else {
      next();
    }
  }
})

app.use('/recipes', async(req, res, next) => {
  if (req.query.page && !/^\d+$/.test(req.query.page)) {
    return res.status(400).json({ error: "Page must be a positive number" });
  }

  let cnt     
  if(req.method == "PATCH" || req.method == "POST" || req.method == "DELETE"){
    if(!req.session.user){
      return res.status(404).json({error:'User needs to log in to post/patch/delete'});
    }
    next()
  } else{
    if(typeof(req.query.page) == Number && req.query.page > 1)     cnt = (req.query.page - 1) * 50
    else    cnt = 1

    const checkdata = await redisClient.v4.exists("page"+cnt)

    if(checkdata) {
      const allRecipesList = await redisClient.v4.get("page"+cnt)
      const allRecipes = await recipes.getAllRecipe(cnt)
      let cachedata = []
      let dbdata = []
      for(const data of JSON.parse(allRecipesList)) {
        cachedata.push(data._id)
      }
      for(const data of allRecipes) {
        dbdata.push(data._id)
      } 
      const samepage = await recipes.compareArrays(cachedata, dbdata)
      
      if(samepage) {
        return res.status(200).json(JSON.parse(allRecipesList))
      } else {
        next()
      }
    } else {
      next();
    }
  }
})

//most accessed
app.use('/mostaccessed', async(req, res, next) => {
  const favrecipes = await redisClient.v4.zRange('RecipeCount', 0, 9, {REV: true});
  sortedrecipe = []

  for(const recipeid of favrecipes) {
    const recipedata = await recipes.getRecipeById(recipeid)
    sortedrecipe.push(recipedata)
  }

  if(favrecipes){
    return res.status(200).json(sortedrecipe)
  } else {
    next()
  }

})

configRoutes(app);

app.listen(3000, () => {
    console.log("We've now got a server!")
    console.log("Your routes will be running on http://localhost:3000")
}) 
