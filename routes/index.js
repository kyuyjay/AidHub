const route_data = require('./data.js');
const route_count = require('./count.js');

module.exports = function(app, db, errorHandler) {
    return {
        data: route_data(app, db, errorHandler), 
        count: route_count(app, db, errorHandler),
        aidpool: route_count(app, db, errorHandler) 
    }
}

