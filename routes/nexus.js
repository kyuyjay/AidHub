const express = require('express')
const mongo = require('mongodb'); 
const history = require('connect-history-api-fallback');

module.exports = function(db, errorHandler) {
    var nexus = express.Router();

    nexus.use('/', express.static('nexus'));

    nexus.get('/content/nodes', function(req, res) {
        db.collection('nodes')
            .find()
            .toArray()
            .then(data => {
                payload = { "nodes": data };
                res.json(payload);
            })
            .catch(err => errorHandler(err, res));
    });

    nexus.post('/content/nodes', function(req, res) {
        db.collection('nodes')
            .insertOne({
                "id": req.body.id,
                "name": req.body.name, 
                "type": req.body.type,
                "sphere": req.body.sphere, 
                "img": req.body.img,
                "activities": req.body.activities,
                "offers": req.body.offers,
                "requests": req.body.requests
            })
            .then(data => {
                res.sendStatus(200);
            })
            .catch(err => errorHandler(err, res));
    });
    
    nexus.get('/content/nodes/:nodeId', function(req, res) {
        db.collection('nodes')
            .find({ "id": req.params.nodeId })
            .next()
            .then(data => {
                res.json(data);
            })
            .catch(err => errorHandler(err, res));
    });

    nexus.delete('/content/nodes/:nodeId', function(req, res) {
        db.collection('nodes')
            .deleteOne({ "id": req.params.nodeId })
            .then(result => {
                if (result.result.n == 1) {
                    res.sendStatus(200);
                } else {
                    res.sendStatus(500);
                }
            })
            .catch(err => errorHandler(err, res));
    });

    nexus.put('/content/nodes/:nodeId', function(req, res) {
        db.collection('nodes')
            .findOneAndReplace({ "id": req.params.nodeId }, {
                "id": req.body.id,
                "name": req.body.name, 
                "type": req.body.type,
                "sphere": req.body.sphere, 
                "img": req.body.img,
                "activities": req.body.activities,
                "offers": req.body.offers,
                "requests": req.body.requests
            })
            .then(result => {
                res.sendStatus(200)
            })
            .catch(err => errorHandler(err, res));
    });

    nexus.get('/content/links', function(req, res) {
        db.collection('links')
            .find()
            .toArray()
            .then(data => {
                payload = { "links": data };
                res.json(payload);
            })
            .catch(err => errorHandler(err, res));
    });

    nexus.post('/content/links', function(req, res) {
        db.collection('links')
            .updateOne({ "id": req.body.id }, {
                $set: {
                    "id": req.body.id,
                    "source": req.body.source,
                    "target": req.body.target
                }
            }, { "upsert": true })
            .then(data => {
                res.sendStatus(200);
            })
            .catch(err => errorHandler(err, res));
    });
    
    nexus.get('/content/links/:linkId', function(req, res) {
        db.collection('link')
            .find({ "id": req.params.linkId })
            .next()
            .then(data => {
                res.json(data);
            })
            .catch(err => errorHandler(err, res));
    });

    nexus.delete('/content/links/:linkId', function(req, res) {
        db.collection('links')
            .deleteOne({ "id": req.params.linkId })
            .then(result => {
                if (result.result.n == 1) {
                    res.sendStatus(200);
                } else {
                    res.sendStatus(500);
                }
            })
            .catch(err => errorHandler(err, res));
    });

    nexus.delete('/content/links/multi/:nodeId', function(req, res) {
        db.collection('links')
            .deleteMany({ $or: [
                { "source": req.params.nodeId },
                { "target": req.params.nodeId }
            ]})
            .then(result => {
                res.sendStatus(200);
            })
            .catch(err => errorHandler(err, res));
    });

    nexus.put('/content/links/:linkId', function(req, res) {
        db.collection('nodes')
            .findOneAndReplace({ "id": req.params.linkId }, {
                "id": req.body.id,
                "source": req.body.source,
                "target": req.body.target
            })
            .then(result => {
                res.sendStatus(200)
            })
            .catch(err => errorHandler(err, res));
    });

    nexus.use(history({
        rewrites: [
            { from: /\*/, to: '/' },
        ],
    }));

    nexus.use('/', express.static('nexus'));

    return nexus;
};
