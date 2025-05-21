const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');
const { test, beforeEach } = require('mocha');
const Stock = require('../models/stock');

chai.use(chaiHttp);

const stocks = [
    new Stock({ _id: 'goog', price: 12.3, ip_addresses: [], likes: 0})
];

suite('Functional Tests', function() {

    beforeEach((done) => {
        Stock.deleteMany({})
        .then(() => {
            Stock.insertMany(stocks)
            .then(() => {
                done();
            })
            .catch(err => console.log(err));
        })
        .catch(err => console.log(err));
    });

    test('Viewing one stock without liking it: GET request to /api/stock-prices/', (done) => {
        const expectedResponse = {
            "stockData":
                {
                    "stock": "GOOG",
                    "price": 12.3,
                    "likes": 0
                }
            };
        chai
            .request(server)
            .keepOpen()
            .get('/api/stock-prices?stock=GOOG')
            .end((err, res) => {
                console.log('here')
                if (res.error) {
                    console.log(res.error)
                } else {
                    assert.equal(res.status, 200, 'Response status should be 200')
                    assert.deepEqual(res.body, expectedResponse)
                }
                done();
            });
    });
});
