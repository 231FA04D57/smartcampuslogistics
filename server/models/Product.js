const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  salePrice: { type: Number },
  rentPrice: { type: Number },
  category: { type: String, required: true, enum: ['Engineering', 'Electronics', 'Apparel', 'Sports', 'Books', 'Other'] },
  location: { type: String, required: true },
  rating: { type: Number, default: 5.0 },
  image: { type: String, required: true },
  seller: { type: String, required: true },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  uploadDate: { type: Date, default: Date.now },
  status: { type: String, default: 'available', enum: ['available', 'sold', 'rented'] },
  rentalEndDate: { type: Date },
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
