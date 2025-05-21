const StockModel = require('../models/stock')

const getStock = async (stockSymbol) => {
    return await StockModel.findById(stockSymbol);
}

const isLikeAllowed = (stock, ipAdress) => {
    return stock.ip_addresses.contains(ipAdress);
};

exports.upsertStock = async (stockJson, doLike = false, ipAdress = '') => {
    let returnedStock = await getStock(stockJson.stock);;
    
    if (!returnedStock) {
        // create a new stock
        returnedStock = await StockModel.create({ _id: stockJson.stock, price: stockJson.price, likes: 0, ip_adresses: []});
    }

    const query = { _id: stockJson.stock };
    const options = { upsert: true };
    let update;
    if (doLike && isLikeAllowed(returnedStock, ipAdress)) {
        update = {
            $set: { _id: stockJson.stock, price: stockJson.price },
            $inc: { likes: 1 },
            $push: { ip_addresses: ipAdress }
        };
    } else {
        update = {
            $set: { _id: stockJson.stock, price: stockJson.price }
        };
    }
    returnedStock = await StockModel.findOneAndUpdate(query, update, options);
    console.log('Changed stock: ', returnedStock);
    return {
        stockData: {
            stock: returnedStock._id,
            price: returnedStock.price,
            likes: returnedStock.likes
        }
    };

}