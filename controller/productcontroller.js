const express = require("express");
const Product = require("../models/product");
const User = require("../models/user");
const asyncErrorResolver =require("../middleware/asyncErrorResolver")

const getallproduct = asyncErrorResolver( async (req,res)=>{
  const {category, brand, search, sort}=req.query
  let query={}
  if(category&&category!=="ALL"){
    query.category=category
  }
  if (brand && brand !== "All") {
    query.brand = brand;
  }
  
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } }
      
      // { description: { $regex: search, $options: "i" } },
      // { category: { $regex: search, $options: "i" } }
    ];
  }
   let products =  Product.find(query)
   // SORTING
  if (sort === "priceLowHigh") {
    products = products.sort({ price: 1 });
  }

  if (sort === "priceHighLow") {
    products = products.sort({ price: -1 });
  }
 const allproducts= await products
  // if(allproducts.length ==0){
  //   return res.status(404).json({message:"no product found"})
  // }
   res.status(200).json({
    status: "Success",
    results: allproducts.length,
    data: allproducts
  });

})

const getproductbyid = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById( id );
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    await Product.findByIdAndDelete(id);

    res.json({ message: "Product deleted" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const recommendations = async (req, res) => {
  try {
    const { id } = req.params;

    const users = await User.find({}, { orders: 1 }).lean();
    const coCount = new Map();

    for (const user of users) {
      if (!user.orders) continue;
      for (const order of user.orders) {
        const items = order.items || [];
        const includesTarget = items.some(
          (i) => i.productId && i.productId.toString() === id
        );
        if (!includesTarget) continue;

        for (const item of items) {
          const pid = item.productId && item.productId.toString();
          if (!pid || pid === id) continue;
          coCount.set(pid, (coCount.get(pid) || 0) + 1);
        }
      }
    }

    let products = [];

    if (coCount.size) {
      const ranked = [...coCount.entries()].sort((a, b) => b[1] - a[1]);
      products = await Product.find({ _id: { $in: ranked.map(([pid]) => pid) } }).lean();
      const rankPos = new Map(ranked.map(([pid], i) => [pid, i]));
      products.sort((a, b) => rankPos.get(a._id.toString()) - rankPos.get(b._id.toString()));
    } else {
      const target = await Product.findById(id).lean();
      if (target) {
        products = await Product.find({
          _id: { $ne: target._id },
          category: target.category,
        })
          .limit(4)
          .lean();
      }
    }

    res.json(products.slice(0, 4));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getallproduct,
  getproductbyid,
  deleteProduct,
  recommendations,
};