const Review = require("../models/review");
const Product = require("../models/product");
const User = require("../models/user");

const addReview = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { rating, comment } = req.body;

    const parsed = Number(rating);
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5 stars" });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const review = await Review.findOneAndUpdate(
      { productId: id, userId },
      { rating: parsed, comment: comment || "", date: new Date() },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).populate("userId", "name");

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteReview = async (req, res) => {
  try {
    const { id, reviewId } = req.params;
    const userId = req.user.id;

    const review = await Review.findOne({ _id: reviewId, productId: id });

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    const isAdmin = req.user.role === "admin";
    const isOwner = review.userId.toString() === userId;

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Not authorized to delete this review" });
    }

    await review.remove();

    res.json({ message: "Review deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getReviews = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const reviews = await Review.find({ productId: id })
      .populate("userId", "name")
      .sort({ date: -1 });

    const usersWithOrders = await User.find(
      { "orders.items.productId": id },
      { _id: 1 }
    ).lean();
    const buyerIds = new Set(usersWithOrders.map((u) => u._id.toString()));

    const list = reviews.map((r) => ({
      _id: r._id,
      rating: r.rating,
      comment: r.comment,
      date: r.date,
      user: r.userId ? { _id: r.userId._id, name: r.userId.name } : null,
      verifiedPurchase: buyerIds.has(r.userId?._id.toString()),
    }));

    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    for (const r of reviews) distribution[r.rating] = (distribution[r.rating] || 0) + 1;

    const avg =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    res.json({
      summary: {
        avg: Math.round(avg * 10) / 10,
        count: reviews.length,
        distribution,
      },
      reviews: list,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { addReview, deleteReview, getReviews };