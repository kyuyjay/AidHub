const route_data = require('./data.js');
const route_count = require('./count.js');
const route_nexus = require('./nexus.js');

module.exports = function(db, errorHandler) {
    return {
        data: route_data(db, errorHandler), 
        count: route_count(db, errorHandler),
        nexus: route_nexus(db, errorHandler) 
    }
}

