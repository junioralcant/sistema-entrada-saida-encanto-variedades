const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');

const SellerSchema = new mongoose.Schema({
  name: {
    type: String,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

SellerSchema.plugin(mongoosePaginate);
module.exports = mongoose.model('Seller', SellerSchema);
