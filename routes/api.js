'use strict';

const { upsertStock } = require('../controllers/stockController');

module.exports = function (app) {


  app.route('/api/stock-prices')
    .get(upsertStock);
};
