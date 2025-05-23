const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');
const { test, beforeEach } = require('mocha');
const Stock = require('../models/stock');


chai.use(chaiHttp);

const stocks = [
    new Stock({ _id: 'AAPL', price: 12.3, ip_addresses: ['test_ip1', 'test_ip2'], likes: 2 })
];

suite('Functional Tests', function () {

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

    test('Viewing one stock: GET request to /api/stock-prices/', (done) => {
        chai
            .request(server)
            .keepOpen()
            .get('/api/stock-prices')
            .set("content-type", "application/json")
            .query({ stock: 'GOOG' })
            .end((err, res) => {
                if (res.error) {
                    console.log(res.error)
                } else {
                    assert.equal(res.status, 200, 'Response status should be 200')
                    assert.property(res.body, 'stockData', 'Stock info should be contained in a StockData object');
                    assert.property(res.body.stockData, 'stock', 'Stock info should contain the stock symbol');
                    assert.equal(res.body.stockData.stock, 'GOOG');
                    assert.property(res.body.stockData, 'likes', 'Stock info should contain number of likes');
                    assert.property(res.body.stockData, 'price', 'Stock info should contain its price');
                }
                done();
            });
    });

    test('Viewing one stock and liking it: GET request to /api/stock-prices/', (done) => {
        chai
            .request(server)
            .keepOpen()
            .get('/api/stock-prices')
            .set("content-type", "application/json")
            .query({ stock: 'GOOG', like: true })
            .end((err, res) => {
                if (res.error) {
                    console.log(res.error)
                } else {
                    assert.equal(res.status, 200, 'Response status should be 200')
                    assert.property(res.body, 'stockData', 'Stock info should be contained in a StockData object');
                    assert.property(res.body.stockData, 'stock', 'Stock info should contain the stock symbol');
                    assert.equal(res.body.stockData.stock, 'GOOG');
                    assert.property(res.body.stockData, 'likes', 'Stock info should contain number of likes');
                    assert.equal(res.body.stockData.likes, 1)
                    assert.property(res.body.stockData, 'price', 'Stock info should contain its price');
                }
                done();
            });
    });

    test('Viewing the same stock and liking it again: GET request to /api/stock-prices/', (done) => {
        chai
            .request(server)
            .keepOpen()
            .get('/api/stock-prices')
            .set("content-type", "application/json")
            .query({ stock: 'MSFT', like: true })
            .end((err, res) => {
                if (res.error) {
                    console.log(res.error)
                } else {
                    const likesAfterFirstCall = res.body.stockData.likes;
                    chai.request(server)
                        .keepOpen()
                        .get('/api/stock-prices')
                        .set("content-type", "application/json")
                        .query({ stock: 'MSFT', like: true })
                        .end((err, res) => {
                            assert.equal(res.status, 200, 'Response status should be 200')
                            assert.property(res.body, 'stockData', 'Stock info should be contained in a StockData object');
                            assert.property(res.body.stockData, 'stock', 'Stock info should contain the stock symbol');
                            assert.equal(res.body.stockData.stock, 'MSFT');
                            assert.property(res.body.stockData, 'likes', 'Stock info should contain number of likes');
                            assert.equal(res.body.stockData.likes, likesAfterFirstCall)
                            assert.property(res.body.stockData, 'price', 'Stock info should contain its price');
                            done();
                        })
                }
            });
    });

    test('Viewing two stocks: GET request to /api/stock-prices/', (done) => {
        chai
            .request(server)
            .keepOpen()
            .get('/api/stock-prices')
            .set("content-type", "application/json")
            .query({ stock: ['GOOG', 'AAPL'] })
            .end((err, res) => {
                if (res.error) {
                    console.log(res.error)
                } else {
                    assert.equal(res.status, 200, 'Response status should be 200')
                    console.log(res.body);
                    assert.property(res.body, 'stockData', 'Stock info should be contained in a StockData object');
                    assert.isArray(res.body.stockData);
                    assert.equal(res.body.stockData.length, 2);
                    assert.property(res.body.stockData[0], 'rel_likes', 'Stock info should contain relative number of likes');
                    assert.property(res.body.stockData[1], 'rel_likes', 'Stock info should contain relative number of likes');
                }
                done();
            });
    });

    test('Viewing two stocks and liking them: GET request to /api/stock-prices/', (done) => {
        chai
            .request(server)
            .keepOpen()
            .get('/api/stock-prices')
            .set("content-type", "application/json")
            .query({ stock: ['GOOG', 'AAPL'], like: true })
            .end((err, res) => {
                if (res.error) {
                    console.log(res.error)
                } else {
                    assert.equal(res.status, 200, 'Response status should be 200')
                    console.log(res.body);
                    assert.property(res.body, 'stockData', 'Stock info should be contained in a StockData object');
                    assert.isArray(res.body.stockData);
                    assert.equal(res.body.stockData.length, 2);
                    assert.property(res.body.stockData[0], 'rel_likes', 'Stock info should contain relative number of likes');
                    assert.property(res.body.stockData[1], 'rel_likes', 'Stock info should contain relative number of likes');
                }
                done();
            });
    });


});
