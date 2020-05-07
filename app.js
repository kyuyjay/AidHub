/**
 * Main application for aidhub
 * 
 * Dependencies can be found in the package.json
 * Routes found in ./routes
 * Written on Vim 8.0
 *
 * Install: 
 *      npm install
 *
 * Run:
 *      npm start
 *
 * Test (without https):
 *      npm test
 */

const fs = require('fs');
const http = require('http');
const https = require('https');
const express = require('express');
const mongo = require('mongodb');
const app = express();
const route_dir = require('./routes')

// Set test ports
const port = 8080;
const port_s = 8443;

// Get app environment
var argv = require('minimist')(process.argv.slice(2), {
    string: ['env'],
    alias: { e: 'env' },
    default: { env: 'prod' }
});

// Load credentials if production
if (argv.env == 'prod') {
    
    // Set production port to 80 for http
    const port = 80;

    // Set production port to 443 for https
    const port_s = 443;

    // HTTPS credentials
    var privateKey  = fs.readFileSync('/etc/letsencrypt/live/aidhubsg.com/privkey.pem', 'utf8');
    var certificate = fs.readFileSync('/etc/letsencrypt/live/aidhubsg.com/cert.pem', 'utf8');
    var ca = fs.readFileSync('/etc/letsencrypt/live/aidhubsg.com/chain.pem', 'utf8');
    var credentials = {key: privateKey, cert: certificate};
}

//////// DB Functions ////////

// Set mongoDB port to 27017
// Set db to aidhub
url = 'mongodb://localhost:27017/aidhub'

// Connect to mongodb
async function connectDB() {
    console.log("Connecting to DB");
    client = await mongo.MongoClient.connect(url, {
        "useUnifiedTopology": true,
    })
    return client.db();
}

//////// BOOTSTRAP ////////

function errorHandler(err, res) {
    res.status(503);
    res.send("Help! I seem to be overwhelmed. Please email <a href=\"mailto:qyongjian@gmail.com\">YJ</a>")
    console.log("Error encountered!");
    console.log(err);
}

// Start app
function start() {
    console.log("Starting App");
    connectDB().then(db => {
        route(route_dir(app, db, errorHandler));
        // Start server
        var httpServer = http.createServer(app);
        httpServer.listen(port);
        // Start https server in production
        if (argv.env == 'prod') {
            var httpsServer = https.createServer(credentials, app);
            httpsServer.listen(port_s);
        }
        console.log("Listening on port " + port + "/" + port_s);
    }).catch(err => {
        console.log("Error: Connection failed");
        console.log(err);
        app.use("/", function(req, res) {
            errorHandler(err, res);
            start();
        });
        app.listen(port);
        var httpsServer = https.createServer(credentials, app);
        httpsServer.listen(port_s);
    });
}

//////// MIDDLEWARE ////////

// Connect to routers
function route(routes) {
    // Utility middleware
    app.use(express.json());
    app.use(express.urlencoded({extended: true}));

    // Static middleware
    app.use('/', express.static('static'));

    // Use data router for resource listing
    app.use('/data', routes.data);

    // Use count router for stats tracking
    app.use('/count', routes.count);
    
    //// BETA FEATURES ////

    // Use aidpool router for user based mutual aid pooling
    app.use('/aidpool', routes.aidpool);
}

start()

