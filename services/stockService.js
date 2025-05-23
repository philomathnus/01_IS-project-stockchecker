const stock = require('../models/stock');
const StockModel = require('../models/stock')
const bcrypt = require('bcrypt');
const saltRounds = 10;

const getStock = async (stockSymbol) => {
    return await StockModel.findById(stockSymbol);
}

const encryptIpAddress = (plainIpAddress) => {
    return bcrypt.hashSync(plainIpAddress, saltRounds);
};

const compareIpAddress = (plainIpAddress, hasedIpAddress) => {
    return bcrypt.compareSync(plainIpAddress, hasedIpAddress);
};

const isLikeAllowed = (stock, ipAddress) => {
    return !stock.ip_addresses.some((hashedIpAddress) => compareIpAddress(ipAddress, hashedIpAddress));
};

exports.upsertStock = async (stockJson, doLike = false, ipAddress = '') => {
    let returnedStock = await getStock(stockJson.stock);;
    const encryptedIpAddress = encryptIpAddress(ipAddress);

    if (!returnedStock) {
        // create a new stock
        returnedStock = await StockModel.create({ _id: stockJson.stock, price: stockJson.price, likes: doLike ? 1 : 0, ip_addresses: doLike ? [encryptedIpAddress] : [] });
    } else {
        const query = { _id: stockJson.stock };
        const options = { upsert: true, new: true };
        let update;
        if (doLike && isLikeAllowed(returnedStock, ipAddress)) {
            update = {
                $set: { _id: stockJson.stock, price: stockJson.price },
                $inc: { likes: 1 },
                $push: { ip_addresses: encryptedIpAddress }
            };
        } else {
            update = {
                $set: { _id: stockJson.stock, price: stockJson.price }
            };
        }
        returnedStock = await StockModel.findOneAndUpdate(query, update, options);
    }

    return {
        stock: returnedStock._id,
        price: returnedStock.price,
        likes: returnedStock.likes
    };

}

exports.upsertTwoStocks = async (stockJsonArr, doLike = false, ipAddress = '') => {
    let returnedStocksInfo = [];
    for (const stock of stockJsonArr) {
        const stockData = await this.upsertStock(stock, doLike, ipAddress);
        returnedStocksInfo.push(stockData);
    }

    returnedStocksInfo[0]['rel-likes'] = returnedStocksInfo[0].likes - returnedStocksInfo[1].likes;
    returnedStocksInfo[1]['rel-likes'] = returnedStocksInfo[1].likes - returnedStocksInfo[0].likes;
    delete returnedStocksInfo[0].likes;
    delete returnedStocksInfo[1].likes;

    return returnedStocksInfo
}