/**
 * Main application for Car.m.a web application
 * 
 * Dependencies can be found in the associated package.json
 * Written on Vim 8.0
 */

/**
 * Required libraries
 *
 * Express.js for middleware management
 * mongoDB for backend communicaiton
 */

const express = require('express')
const MongoClient = require('mongodb').MongoClient
const expressSanitizer = require('express-sanitizer');
const app = express()

//Set localhost port to 8000
const port = 8000

//Set mongoDB port to 27017
const mgd = new MongoClient('mongodb://localhost:27017')

var data;

app.listen(port)

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use(expressSanitizer());

//Print requested files to console
app.use('/', function(req,res,next) {
    console.log(req.path);
    next();
});

//Serve static files from static folder
app.use('/', express.static('static'));

//Dynamic GET function 
//:zip to specify zip code to pull nearby listings

app.use('/data', function(req,res,next) {
    mgd.connect(function() {
        console.log("Connected to local db");
        const db = mgd.db("aidhub");
        cursor = db.collection('test').find(); 
        var data = cursor.toArray();
        data.then(function(data) {
            payload = {"listings": data};
            res.json(payload);
        }, function(err) {
            console.log("Error " + err)
        });
    }, function(err) {
        console.log("Error " + err)
    });
});

app.use('/contribute', function(req,res,next) {
    mgd.connect(function() {
        const db = mgd.db("aidhub");
        const collection = db.collection("test");
        var clean = {};
        for (var key in req.body) {
            if (key != "type") {
                clean[key] = req.body[key].trim().replace(/[-\/\\^$*+?()|[\]{}]/g, '\\$&');
                clean[key] = req.sanitize(req.body[key]);
            }
        }
        clean.type = req.body.type;
        console.log(clean);
        collection.insertOne(clean);
        res.sendFile(__dirname + "/static/results.html");
    }, function(err) {
        res.sendStatus(500);
        console.log("Error " + err)
    });
});
