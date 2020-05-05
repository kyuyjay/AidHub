/**
 * Main application for aidhub
 * 
 * Dependencies can be found in the package.json
 * Written on Vim 8.0
 *
 * Install: 
 *      npm install
 * Run:
 *      npm start
 */

var fs = require('fs');
var http = require('http');
var https = require('https');
var privateKey  = fs.readFileSync('/etc/letsencrypt/live/aidhubsg.com/privkey.pem', 'utf8');
var certificate = fs.readFileSync('/etc/letsencrypt/live/aidhubsg.com/cert.pem', 'utf8');
var ca = fs.readFileSync('/etc/letsencrypt/live/aidhubsg.com/chain.pem', 'utf8');
var credentials = {key: privateKey, cert: certificate};
const express = require('express')
const mongo = require('mongodb');
const MongoClient = require('mongodb').MongoClient;
const app = express();

//Set port to 80 for http
const port = 8080;

//Set port to 443 for https
const port_s = 8443;

//Set mongoDB port to 27017
//Set db to aidhub
url = 'mongodb://localhost:27017/aidhub'

var db;

// Connect to mongodb
async function connectDB() {
    console.log("Connecting to DB");
    client = await MongoClient.connect(url, {useUnifiedTopology: true})
    db = client.db();
    return;
}

// Start app
async function start() {
    connectDB().then(function() {
        console.log("Starting App");
        var httpServer = http.createServer(app);
        httpServer.listen(port);
        var httpsServer = https.createServer(credentials, app);
        httpsServer.listen(port_s);
    }, function(err) {
        console.log("HELP")
        console.log(err);
        errorApp = express()
        errorApp.use("/", function(req, res) {
            res.send("Help! I seem to be overwhelemd. Please email <a href=\"mailto:qyongjian@gmail.com\">YJ</a>")
        });
        errorApp.listen(port);
        var httpsServer = https.createServer(credentials, errorApp);
        httpsServer.listen(port_s);
    });
}

start()

//////// Routers ////////
// KIV pushing them to their own modules
var data = express.Router()
var count = express.Router()

function errorHandler(err, res) {
    if (err) {
        console.log("Error " + err);
    }
}

data.get('/:visited', function(req,res) {
    var collection_test = db.collection('test');
    var collection_track = db.collection('track');
    collection_track.insertOne({ip: req.ip, date: new Date(), unique: req.params.visited})
    cursor = collection_test.find(); 
    data = cursor.toArray();
    data.then(function(data) {
        payload = {"listings": data};
        res.json(payload);
    }, function(err) {
        console.log("Error " + err)
    });
});

data.post('/', function(req,res) {
    var clean = {};
    for (var key in req.body) {
        if (key != "type") {
            clean[key] = req.body[key].trim().replace(/[-\/\\^$*+?()|[\]{}]/g, '\\$&');
        }
    }
    clean.type = req.body.type;
    var collection = db.collection('test');
    collection.insertOne(clean, function(err, result) {
        if (!err) {
            res.sendFile(__dirname + "/static/results.html");
        } else {
            errorHandler(err,result);
            res.sendStatus(500);
        }
    });
});

data.delete('/:tbd', function(req,res) {
    var collection = db.collection('test');
    collection.deleteOne({"_id": new mongo.ObjectId(req.params.tbd)}, errorHandler)
});

count.post('/cats', function(req,res) {
    var collection = db.collection('track_cat');
    collection.insertOne({date: new Date(), "name": req.body.name})
});

count.post('/outs', function(req,res) {
    var collection = db.collection('track_out');
    collection.insertOne({date: new Date(), resource: req.body.id, name: req.body.name});
});

count.get('/hits', function(req,res) {
    var collection = db.collection('track');
    cursor = collection.find()
    var stats = cursor.toArray();
    stats.then(function(stats) {
        res.json(stats);
    }, function(err) {
        console.log("Error " + err)
    });
});

count.get('/cats', function(req,res,next) {
    collection = db.collection('track_cat');
    cursor = collection.aggregate([
        {$group: {_id: "$name", count: {"$sum": 1}}},
        {$sort: {count: -1}}
    ])
    var stats = cursor.toArray();
    stats.then(function(stats) {
        res.json(stats);
    }, function(err) {
        console.log("Error " + err)
    });
});

count.get('/outs', function(req,res,next) {
    var collection = db.collection('track_out');
    cursor = collection.aggregate([
        {$group: {_id: "$name", count: {"$sum": 1}}},
        {$sort: {count: -1}},
        {$limit: 10}
    ])
    var stats = cursor.toArray();
    stats.then(function(stats) {
        res.json(stats);
    }, function(err) {
        console.log("Error " + err)
    });
});

// Utility middleware
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// Static middleware
app.use('/', express.static('static'));

// Use data router for resource listing
app.use('/data', data);

// Use count router for stats tracking
app.use('/count', count);


