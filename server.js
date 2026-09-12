const express=require("express")
const mongoose=require("mongoose")
const cors=require("cors")
require("dotenv").config()
const connectdb=require("./config/db")
const productroutes=require("./routes/productroutes")
const autheroutes=require("./routes/Authroutes")
const cartroute=require("./routes/cartroutes")
const checkroute=require("./routes/checkoutroutes")
const orderRoutes=require("./routes/orderroute")
const allusers=require("./routes/userroutess")
const addproduct=require("./routes/addproduct")
const adminorder=require("./routes/adminordercontroller")
const updatepro=require("./routes/updateproduct")
const payment=require("./routes/paymentrouter")
const protect = require("./middleware/authMiddleware")
const verifyRoute = require("./routes/paymentverify");
const { isAdmin, isAdminOrGuest } = require("./middleware/adminmiddleware");
const { ensureGuestAdmin } = require("./config/guestseed");


const app=express()
app.use(cors())
app.use(express.json())


connectdb().then(() => ensureGuestAdmin())


app.use("/auth", autheroutes)
app.use("/cart",protect,cartroute)
app.use("/order", protect, checkroute);
app.use("/orders",protect, orderRoutes);
// users router decides its own method-level guards
app.use("/users", protect, allusers)
// guests may add products; the route is now authenticated
app.use("/admin/products", protect, isAdminOrGuest, addproduct)
// only full admins may edit products
app.use("/updatepro", protect, isAdmin, updatepro)
// guests may view and update order status
app.use("/all", protect, isAdminOrGuest, adminorder)
app.use("/payment",payment)
app.use("/payment/verify", protect, verifyRoute) 
app.get("/", (req,res)=>{
    res.send("EzBuy API Running")
})
app.use("/products", productroutes)
app.use("/images", express.static("images"))
const port=process.env.PORT

app.listen(port,()=>{
    console.log(`surver is running ${port}`)
})