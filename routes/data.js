const express = require('express')
const mongo = require('mongodb'); 

module.exports = function(db, errorHandler) {

    var data = express.Router()

    data.get('/:visited', function(req,res) {
        db.collection('track')
            .insertOne({
                ip: req.ip, 
                date: new Date(), 
                unique: req.params.visited
            })
            .catch(err => {});
        db.collection('test')
            .find() 
            .toArray()
            .then(data => {
                payload = {"listings": data};
                res.json(payload);
            })
            .catch(err => errorHandler(err, res));
    });

    data.post('/', function(req,res) {
        var clean = {};
        for (var key in req.body) {
            if (key != "type") {
                clean[key] = req.body[key].trim().replace(/[-\/\\^$*+?()|[\]{}]/g, '\\$&');
            }
        }
        clean.type = req.body.type;
        db.collection('test')
            .insertOne(clean)
            .then(result => {
                res.redirect("/results.html");
            })
            .catch(err => errorHandler(err, res));
    });

    data.delete('/:tbd', function(req,res) {
        db.collection('test')
            .deleteOne({
                "_id": new mongo.ObjectId(req.params.tbd)
            })
            .then(result => {
                res.sendStatus(200);
            }).catch(err => errorHandler(err, res));
    });

    return data;
}
