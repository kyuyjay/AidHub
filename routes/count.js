const express = require('express');

module.exports = function(db, errorHandler) {
    
    var count = express.Router()

    count.post('/cats', function(req,res) {
        db.collection('track_cat')
            .insertOne({
                date: new Date(), 
                "name": req.body.name
            })
            .then(result => res.sendStatus(200))
            .catch(err => errorHandler(err, res));
    });

    count.post('/outs', function(req,res) {
        db.collection('track_out')
            .insertOne({
                date: new Date(), 
                resource: req.body.id, 
                name: req.body.name
            })
            .then(result => res.sendStatus(200))
            .catch(err => errorHandler(err, res));
    });

    count.get('/hits', function(req,res) {
        db.collection('track')
            .find()
            .toArray()
            .then(stats => res.json(stats))
            .catch(err => errorHandler(err, res));
    });

    count.get('/cats', function(req,res) {
        db.collection('track_cat')
            .aggregate([
                {
                    $group: {
                        _id: "$name", 
                        count: {
                            "$sum": 1
                        }
                    }
                },
                {
                    $sort: {
                        count: -1
                    }
                }
            ])
            .toArray()
            .then(stats => res.json(stats))
            .catch(err => errorHandler(err, res));
    });

    count.get('/outs', function(req,res) {
        db.collection('track_out')
            .aggregate([
                {
                    $group: {
                        _id: "$name", 
                        count: {
                            "$sum": 1
                        }
                    }
                },
                {
                    $sort: {
                        count: -1
                    }
                },
                {
                    $limit: 10
                }
            ])
            .toArray()
            .then(stats => res.json(stats))
            .catch(err => errorHandler(err, res));
    });

    return count;
}
