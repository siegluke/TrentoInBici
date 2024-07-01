const Path = require('path');

const express = require('express');
const app = express();
const cors = require('cors')

app.use(express.static('public'));

const biciPropria = require('./biciPropria.js');
const googleMaps = require('./googleMaps.js');
const senzaBici = require('./senzaBici.js');
const infoStallo = require('./infoStallo.js');
const gestoreDataBase = require('./gestoreDataBase.js');
const adminDatabase = require('./adminDatabase.js');
const authentication = require('./authentication.js');
const tokenChecker = require('./tokenChecker.js');
const tokenCheckerAdmin = require('./tokenCheckerAdmin.js');


app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); // Consentire l'accesso da qualsiasi origine
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE'); // Metodi consentiti
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Intestazioni consentite
    next();
  });

/**
 * Configure Express.js parsing middleware
 */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * CORS requests
 */
app.use(cors())

// If process.env.FRONTEND folder does not contain index.html then use the one from static
app.use('/', express.static('static')); // expose also this folder

app.use((req,res,next) => {
    console.log(req.method + ' ' + req.url)
    next()
})

/**
 * Authentication routing and middleware
 */
app.use('/api/v2/authentication', authentication);

app.use('/api/v2/gestoreDataBase', tokenChecker);
app.use('/api/v2/adminDatabase', tokenCheckerAdmin);

//version 1.0
app.use('/api/v1/biciPropria', biciPropria);
app.use('/api/v1/googleMaps', googleMaps);

//version 2.0
app.use('/api/v2/biciPropria', biciPropria);
app.use('/api/v2/googleMaps', googleMaps);
app.use('/api/v2/senzaBici', senzaBici);
app.use('/api/v2/infoStallo', infoStallo);
app.use('/api/v2/gestoreDataBase', gestoreDataBase);
app.use('/api/v2/adminDatabase', adminDatabase);


/* Default 404 handler */
app.use((req, res) => {
    res.status(404);
    res.json({ error: 'Not found' });
});

module.exports = app;