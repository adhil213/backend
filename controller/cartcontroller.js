const User = require("../models/user");
const Product = require("../models/product");

// ADD TO CART
const addtocart = async (req, res) => {
  try {
    const userId = req.user.id; 
    const { productId } = req.body;
    const qty = Number(req.body.qty);

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const existingItem = user.cart.find(
      (item) => item.productId.toString() === productId
    );

    if (existingItem) {
      existingItem.qty += qty;
    } else {
      user.cart.push({
        productId: productId,
        qty: qty,
      });
    }

    await user.save();

    res.status(200).json({
      message: "Product added to cart",
      cart: user.cart,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET CART
const getcart = async (req, res) => {
  try {
    const userId = req.user.id; 

    const user = await User.findById(userId).populate("cart.productId");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const cart = user.cart.map((item) => ({
      _id: item.productId._id,
      id: item.productId.id,
      name: item.productId.name,
      price: item.productId.price,
      brand: item.productId.brand,
      image: item.productId.image,
      stock: item.productId.stock,
      qty: item.qty,
    }));

    res.json(cart);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE CART
const updateCart = async (req, res) => {
  try {
    const userId = req.user.id; 
    const { productId, qty } = req.body;

    const user = await User.findById(userId);

    const item = user.cart.find(
      (item) => item.productId.toString() === productId
    );

    if (item) {
      item.qty = qty;
    }

    await user.save();

    res.json({ message: "Cart updated" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// REMOVE FROM CART
const removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id; // ✅ from JWT
    const { productId } = req.body;

    const user = await User.findById(userId);

    user.cart = user.cart.filter(
      (item) => item.productId.toString() !== productId
    );

    await user.save();

    res.json({ message: "Item removed" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { addtocart, getcart, updateCart, removeFromCart };