const recipeRoute = require('./recipes');
const userRoute = require('./users');

const constructorMethod = (app) => {
    // app.use("/", userRoute);
    app.use("/", recipeRoute);

    app.use('*', (req, res) => {
        res.json({error: 'Not Found'})
    });

    
}

module.exports = constructorMethod;