const stockService = require('../services/stockService');

const getStockInfoFromService = async (stock) => {
  const data = await fetch(`https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stock}/quote`);
  const json = await data.json();
  return {
    "stock": json.symbol,
    "price": json.latestPrice
  };

};

const saveStockInformation = async (stockJson, doLike, ipAddress) => {
  return await stockService.upsertStock(stockJson, doLike, ipAddress);
};


const saveStocksInformation = async (stockJsonArr, doLike, ipAddress) => {
  return await stockService.upsertTwoStocks(stockJsonArr, doLike, ipAddress);
};

exports.upsertStock = async (req, res) => {
  try {
    const desiredStocks = req.query.stock;
    const doLike = true ? req.query.like : false;
    const ipAddress = req.ip;

    if (desiredStocks.constructor === Array) {
      const stocksJson = [];
      for (const stock of desiredStocks) {
        const stockJson =  await getStockInfoFromService(stock);
        stocksJson.push(stockJson);
      }
      const stocks = await saveStocksInformation(stocksJson, doLike, ipAddress);
      
      res.json({stockData: stocks});

    } else {
      const stockJson = await getStockInfoFromService(desiredStocks);
      const stock = await saveStockInformation(stockJson, doLike, ipAddress);
      
      res.json({stockData: stock});

    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}