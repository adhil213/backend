const express=require("express")
const routes=express.Router()
const {getallusers,getuserbyid,deleteuser,rolechanger}=require("../controller/userccontroller")
const protect = require("../middleware/authMiddleware")
const { isAdmin, isAdminOrGuest } = require("../middleware/adminmiddleware")

// Guests may browse users but cannot change roles or delete accounts
routes.get("/", protect, isAdminOrGuest, getallusers)
routes.get("/:id", protect, isAdminOrGuest, getuserbyid)
routes.put("/:id", protect, isAdmin, rolechanger)
routes.delete("/:id", protect, isAdmin, deleteuser)


module.exports=routes
