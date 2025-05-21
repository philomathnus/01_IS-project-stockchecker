const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const stockSchema = new Schema(
    {
        _id: {
            type: Schema.Types.String
        },
        price: {
            type: Schema.Types.Number,
            required: true
        },
        ip_addresses: {
            type: [Schema.Types.String],
            required: true
        },
        likes: {
            type: Schema.Types.Number,
            required: true,
            default: 0
        }
    },
    {
        collection: 'stocks'
    });

module.exports = mongoose.model("Stock", stockSchema);