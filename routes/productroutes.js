const express = require("express");
const router = express.Router();

const {
  getallproduct,
  getproductbyid,
  deleteProduct,
  recommendations,
} = require("../controller/productcontroller");

const {
  addReview,
  deleteReview,
  getReviews,
} = require("../controller/reviewcontroller");

const protect = require("../middleware/authMiddleware");
const isAdmin = require("../middleware/adminmiddleware");


router.get("/", getallproduct);
router.get("/:id/recommendations", recommendations);
router.get("/:id/reviews", getReviews);
router.post("/:id/review", protect, addReview);
router.delete("/:id/review/:reviewId", protect, deleteReview);
router.get("/:id", getproductbyid);


router.delete("/:id", protect, isAdmin, deleteProduct);

module.exports = router;