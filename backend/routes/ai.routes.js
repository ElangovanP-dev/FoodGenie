const express = require("express");
const router = express.Router();
const aiController = require("../controllers/ai.controller");

// Test status
router.get("/test", (req, res) => {
  res.json({ status: "success", message: "Food Genie AI Engine Online" });
});

// Feature 1: Dish Description Generator
router.post("/generate-food-ai", aiController.generateFoodAI);
router.post("/generate-food-ai/:foodId", aiController.generateAndSaveFoodAI);

// Feature 2: AI Review Analyzer
router.put("/admin/restaurants/:id/analyze", aiController.analyzeRestaurantReviews);
router.put("/stores/:id/review", aiController.addReview);

// Feature 3: Smart Food Recommender
router.post("/recommend", aiController.recommendFood);

// Feature 4: Natural Language Search
router.post("/nl-search", aiController.naturalLanguageSearch);

module.exports = router;
