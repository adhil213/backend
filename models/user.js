const mongoose = require("mongoose")
const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "products", // your model name
  },
  qty: Number,
});

const orderschema = new mongoose.Schema({
  orderId: String,
  items: [orderItemSchema], 
  address: Object,
  paymentMethod: String,
  totalAmount: Number,
  status: String,
  date: String,
});


const cartItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "products",
    required: true
  },
  qty: {
    type: Number,
    default: 1,
    min: 1
  }
})

const userSchema = new mongoose.Schema({
  id:String,
  name:String,
  email:{type:String,unique:true},
  password:String,
  role:{type:String,default:"user"},
  cart:[cartItemSchema],
  orders:[orderschema]
})

module.exports = mongoose.model("User", userSchema)