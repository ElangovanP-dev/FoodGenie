const catchAsync = require("../middlewares/catchAsyncErrors");
const aiService = require("../services/ai.service");
const FoodItem = require("../models/foodItem");
const Restaurant = require("../models/restaurant");
const { analyzeReviewsWithAI } = require("../services/aiReviewAnalyzer");

// Feature 1: AI Dish Description Generator
exports.generateFoodAI = catchAsync(async (req, res) => {
  const { name, category, spiceLevel, price } = req.body;
  if (!name || !category || !spiceLevel || !price) {
    return res.status(400).json({
      success: false,
      message: "name, category, spiceLevel and price are required",
    });
  }

  const aiData = await aiService.generateDishDescription({
    name,
    category,
    spiceLevel,
    price,
  });

  res.status(200).json({
    success: true,
    data: aiData,
  });
});

exports.generateAndSaveFoodAI = catchAsync(async (req, res) => {
  const { foodId } = req.params;

  const food = await FoodItem.findById(foodId);
  if (!food) {
    return res.status(404).json({
      success: false,
      message: "Food item not found",
    });
  }

  const aiData = await aiService.generateDishDescription({
    name: food.name,
    category: food.category || "Veg",
    spiceLevel: food.spiceLevel || "Medium",
    price: food.price,
  });

  food.aiDescription = aiData.description;
  food.aiTags = aiData.tags;
  food.aiAllergens = aiData.allergens;
  food.aiServes = aiData.serves;
  food.aiBestFor = aiData.bestFor;
  await food.save();

  res.status(200).json({
    success: true,
    message: "AI metadata generated and saved",
    data: aiData,
  });
});

// Feature 2: AI Review Analyzer
exports.analyzeRestaurantReviews = catchAsync(async (req, res) => {
  try {
    const { id } = req.params;
    const restaurant = await Restaurant.findById(id);

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    if (!restaurant.reviews || !restaurant.reviews.length) {
      return res.status(400).json({ message: "No reviews to analyze" });
    }

    const aiData = await analyzeReviewsWithAI(restaurant.reviews);

    restaurant.reviewSentiment = aiData.sentiment;
    restaurant.reviewSummaryBullets = aiData.summaryBullets;
    restaurant.reviewTopMentions = aiData.topMentions;

    await restaurant.save();
    res.status(200).json({ success: true, aiData });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

exports.addReview = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { name, rating, Comment } = req.body;

  const restaurant = await Restaurant.findById(id);
  if (!restaurant) {
    return res.status(404).json({
      success: false,
      message: "Restaurant not found",
    });
  }

  // Add Review
  restaurant.reviews.push({
    name,
    rating,
    Comment,
  });

  restaurant.numOfReviews = restaurant.reviews.length;
  const totalRatings = restaurant.reviews.reduce((sum, review) => sum + review.rating, 0);
  restaurant.ratings = totalRatings / restaurant.reviews.length;

  // Auto trigger AI Review Analysis
  try {
    const aiData = await analyzeReviewsWithAI(restaurant.reviews);
    restaurant.reviewSentiment = aiData.sentiment;
    restaurant.reviewSummaryBullets = aiData.summaryBullets;
    restaurant.reviewTopMentions = aiData.topMentions;
  } catch (error) {
    console.log("AI Analysis Failed:", error.message);
  }

  await restaurant.save();

  res.status(200).json({
    success: true,
    message: "Review Added Successfully with AI Analysis",
    restaurant,
  });
});

// Feature 3: Smart Food Recommender (Suggests dishes by mood, diet & budget)
exports.recommendFood = catchAsync(async (req, res) => {
  const { mood, diet, budget, craving } = req.body;

  const filter = {};
  if (budget) {
    filter.price = { $lte: Number(budget) };
  }

  const availableItems = await FoodItem.find(filter)
    .populate("restaurant", "name address isVeg ratings")
    .limit(40);

  const aiResult = await aiService.recommendDishesWithAI({
    mood,
    diet,
    budget,
    craving,
    availableItems,
  });

  // Attach matched database items
  const recommendations = (aiResult.recommendations || []).map((rec) => {
    const matchedItem = availableItems.find(
      (it) => it.name.toLowerCase().includes(rec.name.toLowerCase()) ||
              rec.name.toLowerCase().includes(it.name.toLowerCase())
    );
    return {
      ...rec,
      dish: matchedItem || null,
    };
  });

  res.status(200).json({
    success: true,
    recommendations,
    genieMessage: aiResult.genieMessage,
  });
});

// Feature 4: Natural Language Search (Converts plain English to smart filters)
exports.naturalLanguageSearch = catchAsync(async (req, res) => {
  const { query } = req.body;
  if (!query) {
    return res.status(400).json({ success: false, message: "Query text is required" });
  }

  const filters = await aiService.parseNaturalLanguageSearch(query);

  const restFilter = {};
  if (filters.isVeg === true) {
    restFilter.isVeg = true;
  }
  if (filters.minRating) {
    restFilter.ratings = { $gte: Number(filters.minRating) };
  }
  if (filters.keywords && filters.keywords.length > 2) {
    restFilter.$or = [
      { name: { $regex: filters.keywords, $options: "i" } },
      { address: { $regex: filters.keywords, $options: "i" } },
    ];
  }

  let restaurants = await Restaurant.find(restFilter).limit(20);

  if (restaurants.length === 0) {
    const relaxed = {};
    if (filters.isVeg === true) relaxed.isVeg = true;
    if (filters.minRating) relaxed.ratings = { $gte: Number(filters.minRating) };
    restaurants = await Restaurant.find(relaxed).limit(20);
  }

  // Also query matching food items
  const foodFilter = {};
  if (filters.maxPrice) foodFilter.price = { $lte: Number(filters.maxPrice) };
  if (filters.keywords && filters.keywords.length > 2) {
    foodFilter.name = { $regex: filters.keywords, $options: "i" };
  }
  const foodItems = await FoodItem.find(foodFilter)
    .populate("restaurant", "name isVeg")
    .limit(10);

  res.status(200).json({
    success: true,
    parsedFilters: filters,
    restaurants,
    foodItems,
    count: restaurants.length,
  });
});
