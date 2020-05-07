const route_data = require('./data.js');
const route_count = require('./count.js');

module.exports = function(db, errorHandler) {
    return {
        data: route_data(db, errorHandler), 
        count: route_count(db, errorHandler),
        aidpool: route_count(db, errorHandler) 
    }
}

