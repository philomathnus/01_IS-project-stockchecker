const stockService = require('../services/stockService');

exports.upsertStock = async (req, res) => {
  try {
    const data = await fetch(`https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${req.query.stock}/quote`);
    const json = await data.json();
    //console.log('Response json: \n', json);
    const stockJson = {
      "stock": json.symbol,
      "price": json.latestPrice
    };

    const doLike = true ? req.query.like : false;
    const ipAddress = req.ip;
    const stock = await stockService.upsertStock(stockJson, doLike, ipAddress);

    res.json(stock);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}