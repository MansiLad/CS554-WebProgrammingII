const express = require('express')
const { Cookie } = require('express-session')
const app = express()
const session = require('express-session')
const configRoutes = require('./routes')
const recipes = require("./data").recipes

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(session({
    name: 'AuthCookie',
    secret: 'some secret string!',
    resave: false,
    saveUninitialized: true
}));

const isUserlogin = function (req) {
  return req.session.user;
};
// app.use('/propertyRegistration',prop_route)
app.use(function (req, res, next) {
  console.log(
    `[${new Date().toUTCString()}]\t${
      isUserlogin(req) ? "User Authenticated" : "User not Authenticated"
    }\t${req.originalUrl}\t${req.method}`
  );
  next();
});

configRoutes(app);

app.listen(3000, () => {
    console.log("We've now got a server!")
    console.log("Your routes will be running on http://localhost:3000")
}) 
