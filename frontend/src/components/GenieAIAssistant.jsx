import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

const GenieAIAssistant = ({ onApplyFilters }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("recommend"); // 'recommend' | 'search' | 'dish'

  // Smart Recommender state
  const [mood, setMood] = useState("Comfort Food");
  const [diet, setDiet] = useState("Vegetarian");
  const [budget, setBudget] = useState(250);
  const [craving, setCraving] = useState("");
  const [recommending, setRecommending] = useState(false);
  const [recommendResults, setRecommendResults] = useState(null);

  // Natural Language Search state
  const [nlQuery, setNlQuery] = useState("");
  const [searchingNL, setSearchingNL] = useState(false);
  const [nlParsed, setNlParsed] = useState(null);

  // Dish Generator state
  const [dishName, setDishName] = useState("Paneer Tikka");
  const [dishCategory, setDishCategory] = useState("Veg");
  const [dishSpice, setDishSpice] = useState("Medium");
  const [dishPrice, setDishPrice] = useState(220);
  const [generatingDish, setGeneratingDish] = useState(false);
  const [dishResult, setDishResult] = useState(null);

  // Handle Smart Recommendations
  const handleGetRecommendations = async (e) => {
    e?.preventDefault();
    setRecommending(true);
    try {
      const { data } = await axios.post("/api/v1/ai/recommend", {
        mood,
        diet,
        budget: Number(budget),
        craving,
      });
      setRecommendResults(data);
      toast.success("Genie granted your food recommendation!");
    } catch (err) {
      console.error(err);
      toast.error("Could not fetch recommendations at this time");
    } finally {
      setRecommending(false);
    }
  };

  // Handle Natural Language Search
  const handleNLSearch = async (queryText) => {
    const q = queryText || nlQuery;
    if (!q.trim()) return toast.warning("Please type a search query");
    setSearchingNL(true);
    try {
      const { data } = await axios.post("/api/v1/ai/nl-search", {
        query: q,
      });
      setNlParsed(data);
      if (onApplyFilters) {
        onApplyFilters(data);
      }
      toast.success("AI search filters applied!");
    } catch (err) {
      console.error(err);
      toast.error("AI Search failed");
    } finally {
      setSearchingNL(false);
    }
  };

  // Handle Dish Description Generation
  const handleGenerateDish = async (e) => {
    e?.preventDefault();
    setGeneratingDish(true);
    try {
      const { data } = await axios.post("/api/v1/ai/generate-food-ai", {
        name: dishName,
        category: dishCategory,
        spiceLevel: dishSpice,
        price: Number(dishPrice),
      });
      setDishResult(data.data);
      toast.success("AI Dish metadata generated!");
    } catch (err) {
      console.error(err);
      toast.error("Dish generation failed");
    } finally {
      setGeneratingDish(false);
    }
  };

  return (
    <>
      {/* Floating or Banner Trigger */}
      <div className="genie-ai-trigger-banner my-3 p-3 text-white rounded d-flex flex-wrap align-items-center justify-content-between">
        <div className="d-flex align-items-center">
          <span className="genie-lamp-icon mr-3" style={{ fontSize: "2.2rem" }}>
            🧞‍♂️
          </span>
          <div>
            <h5 className="mb-0 text-white font-weight-bold">
              Food Genie AI Engine{" "}
              <span className="badge badge-warning text-dark ml-2">Groq LLaMA 3.1</span>
            </h5>
            <small className="text-light">
              "Genie grants your food wishes" — Smart Recommender, Natural Language Search & Review Insights
            </small>
          </div>
        </div>
        <div className="mt-2 mt-md-0">
          <button
            className="btn btn-warning font-weight-bold mr-2 text-dark"
            onClick={() => {
              setActiveTab("recommend");
              setIsOpen(true);
            }}
          >
            🎯 Smart Recommender
          </button>
          <button
            className="btn btn-outline-light font-weight-bold"
            onClick={() => {
              setActiveTab("search");
              setIsOpen(true);
            }}
          >
            🔍 AI Search
          </button>
        </div>
      </div>

      {/* Modal Dialog */}
      {isOpen && (
        <div className="genie-modal-backdrop">
          <div className="genie-modal-content card shadow-lg">
            <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center py-3">
              <h5 className="mb-0">
                🧞‍♂️ Food Genie AI Assistant
              </h5>
              <button
                className="close text-white"
                onClick={() => setIsOpen(false)}
                style={{ fontSize: "1.8rem", outline: "none" }}
              >
                &times;
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="nav nav-tabs px-3 pt-2 bg-light">
              <button
                className={`nav-link font-weight-bold ${activeTab === "recommend" ? "active text-success" : "text-muted"}`}
                onClick={() => setActiveTab("recommend")}
              >
                🎯 Smart Food Recommender
              </button>
              <button
                className={`nav-link font-weight-bold ${activeTab === "search" ? "active text-success" : "text-muted"}`}
                onClick={() => setActiveTab("search")}
              >
                🔍 Natural Language Search
              </button>
              <button
                className={`nav-link font-weight-bold ${activeTab === "dish" ? "active text-success" : "text-muted"}`}
                onClick={() => setActiveTab("dish")}
              >
                ✨ Dish Description Generator
              </button>
            </div>

            <div className="card-body p-4" style={{ maxHeight: "75vh", overflowY: "auto" }}>
              {/* TAB 1: SMART RECOMMENDER */}
              {activeTab === "recommend" && (
                <div>
                  <h6 className="text-muted mb-3">
                    Tell Genie your mood, dietary choice, and budget to receive curated dish suggestions.
                  </h6>

                  <form onSubmit={handleGetRecommendations}>
                    <div className="row">
                      <div className="col-md-6 form-group">
                        <label className="font-weight-bold">Your Mood / Vibe</label>
                        <select
                          className="form-control"
                          value={mood}
                          onChange={(e) => setMood(e.target.value)}
                        >
                          <option value="Comfort Food">🍲 Comfort Food</option>
                          <option value="Spicy & Bold">🌶️ Spicy & Bold</option>
                          <option value="Healthy & Fit">🥗 Healthy & Wholesome</option>
                          <option value="Celebration & Party">🎉 Celebration Feast</option>
                          <option value="Late Night Snack">🌙 Late Night Craving</option>
                        </select>
                      </div>

                      <div className="col-md-6 form-group">
                        <label className="font-weight-bold">Dietary Preference</label>
                        <select
                          className="form-control"
                          value={diet}
                          onChange={(e) => setDiet(e.target.value)}
                        >
                          <option value="Vegetarian">🌱 Pure Vegetarian</option>
                          <option value="Non-Vegetarian">🍗 Non-Vegetarian</option>
                          <option value="Any">🍽️ Any / All</option>
                        </select>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-6 form-group">
                        <label className="font-weight-bold">
                          Maximum Budget: <span className="text-success font-weight-bold">₹{budget}</span>
                        </label>
                        <input
                          type="range"
                          className="form-control-range"
                          min="100"
                          max="1000"
                          step="50"
                          value={budget}
                          onChange={(e) => setBudget(e.target.value)}
                        />
                      </div>

                      <div className="col-md-6 form-group">
                        <label className="font-weight-bold">Specific Craving (Optional)</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="e.g. Paneer roll, biryani, pizza"
                          value={craving}
                          onChange={(e) => setCraving(e.target.value)}
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="btn btn-success btn-block py-2 font-weight-bold"
                      disabled={recommending}
                    >
                      {recommending ? "🧞‍♂️ Genie is cooking recommendations..." : "✨ Ask Food Genie Now"}
                    </button>
                  </form>

                  {/* Recommendations Display */}
                  {recommendResults && (
                    <div className="mt-4 p-3 bg-light rounded border border-success">
                      <div className="alert alert-info py-2">
                        <strong>🧞‍♂️ Genie says:</strong> {recommendResults.genieMessage}
                      </div>

                      <h6 className="font-weight-bold text-dark mt-3">Recommended Dishes:</h6>
                      <div className="row">
                        {recommendResults.recommendations.map((rec, i) => (
                          <div className="col-md-6 my-2" key={i}>
                            <div className="card h-100 p-3 shadow-sm border-0 bg-white">
                              <div className="d-flex justify-content-between align-items-start">
                                <h6 className="font-weight-bold text-success mb-1">{rec.name}</h6>
                                <span className="badge badge-pill badge-primary">
                                  {rec.estimatedCalories || "350 kcal"}
                                </span>
                              </div>
                              <p className="text-muted small mb-2">{rec.matchedReason}</p>
                              {rec.dish && (
                                <div className="mt-auto d-flex justify-content-between align-items-center">
                                  <span className="font-weight-bold text-dark">₹{rec.dish.price}</span>
                                  {rec.dish.restaurant && (
                                    <Link
                                      to={`/eats/stores/${rec.dish.restaurant._id || rec.dish.restaurant}/menus`}
                                      className="btn btn-sm btn-outline-success"
                                      onClick={() => setIsOpen(false)}
                                    >
                                      View Menu
                                    </Link>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: NATURAL LANGUAGE SEARCH */}
              {activeTab === "search" && (
                <div>
                  <h6 className="text-muted mb-3">
                    Type in natural conversational English. Groq LLM parses filters like diet, price, and rating automatically!
                  </h6>

                  <div className="input-group mb-3">
                    <input
                      type="text"
                      className="form-control py-3"
                      placeholder="e.g. Show me veg food under ₹300 with good ratings"
                      value={nlQuery}
                      onChange={(e) => setNlQuery(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleNLSearch()}
                    />
                    <div className="input-group-append">
                      <button
                        className="btn btn-success px-4 font-weight-bold"
                        onClick={() => handleNLSearch()}
                        disabled={searchingNL}
                      >
                        {searchingNL ? "Parsing..." : "AI Search"}
                      </button>
                    </div>
                  </div>

                  {/* Sample Chips */}
                  <div className="mb-4">
                    <small className="text-muted d-block mb-1 font-weight-bold">Try quick prompts:</small>
                    {[
                      "Show me veg food under ₹300 with good ratings",
                      "Pure veg restaurant with 4.5+ star rating",
                      "Tasty biryani or rolls under ₹200",
                      "Desserts and sweets under ₹150",
                    ].map((sample, idx) => (
                      <button
                        key={idx}
                        className="btn btn-sm btn-outline-secondary mr-2 mb-2"
                        onClick={() => {
                          setNlQuery(sample);
                          handleNLSearch(sample);
                        }}
                      >
                        💡 {sample}
                      </button>
                    ))}
                  </div>

                  {/* Parsed Output */}
                  {nlParsed && (
                    <div className="p-3 bg-light rounded border border-info">
                      <h6 className="font-weight-bold text-info mb-2">
                        🤖 AI Parsed Search Filters:
                      </h6>
                      <div className="d-flex flex-wrap gap-2 mb-3">
                        {nlParsed.parsedFilters.isVeg !== null && (
                          <span className="badge badge-success p-2 mr-2">
                            {nlParsed.parsedFilters.isVeg ? "🌱 Pure Veg: YES" : "🍗 Veg: Any"}
                          </span>
                        )}
                        {nlParsed.parsedFilters.maxPrice && (
                          <span className="badge badge-warning p-2 mr-2 text-dark">
                            💰 Max Budget: ≤ ₹{nlParsed.parsedFilters.maxPrice}
                          </span>
                        )}
                        {nlParsed.parsedFilters.minRating && (
                          <span className="badge badge-primary p-2 mr-2">
                            ⭐ Min Rating: ≥ {nlParsed.parsedFilters.minRating} Stars
                          </span>
                        )}
                        {nlParsed.parsedFilters.keywords && (
                          <span className="badge badge-dark p-2 mr-2">
                            🔍 Keyword: {nlParsed.parsedFilters.keywords}
                          </span>
                        )}
                      </div>

                      <div className="alert alert-success py-2 mb-2">
                        {nlParsed.parsedFilters.summary}
                      </div>

                      <p className="small text-muted mb-0">
                        Found <strong>{nlParsed.count}</strong> matching restaurants and <strong>{nlParsed.foodItems?.length || 0}</strong> food items.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: DISH DESCRIPTION GENERATOR */}
              {activeTab === "dish" && (
                <div>
                  <h6 className="text-muted mb-3">
                    Auto-writes mouthwatering restaurant descriptions, food tags, and allergen warnings using Groq LLM.
                  </h6>

                  <form onSubmit={handleGenerateDish}>
                    <div className="row">
                      <div className="col-md-6 form-group">
                        <label className="font-weight-bold">Dish Name</label>
                        <input
                          type="text"
                          className="form-control"
                          value={dishName}
                          onChange={(e) => setDishName(e.target.value)}
                          required
                        />
                      </div>
                      <div className="col-md-6 form-group">
                        <label className="font-weight-bold">Category</label>
                        <select
                          className="form-control"
                          value={dishCategory}
                          onChange={(e) => setDishCategory(e.target.value)}
                        >
                          <option value="Veg">Vegetarian</option>
                          <option value="Non-Veg">Non-Vegetarian</option>
                          <option value="Dessert">Dessert</option>
                          <option value="Beverage">Beverage</option>
                        </select>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-6 form-group">
                        <label className="font-weight-bold">Spice Level</label>
                        <select
                          className="form-control"
                          value={dishSpice}
                          onChange={(e) => setDishSpice(e.target.value)}
                        >
                          <option value="Mild">Mild</option>
                          <option value="Medium">Medium</option>
                          <option value="Spicy">Spicy</option>
                          <option value="Extra Spicy">Extra Spicy</option>
                        </select>
                      </div>
                      <div className="col-md-6 form-group">
                        <label className="font-weight-bold">Price (₹)</label>
                        <input
                          type="number"
                          className="form-control"
                          value={dishPrice}
                          onChange={(e) => setDishPrice(e.target.value)}
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="btn btn-info btn-block py-2 font-weight-bold text-white"
                      disabled={generatingDish}
                    >
                      {generatingDish ? "Generating with Groq LLM..." : "✨ Generate Dish Description"}
                    </button>
                  </form>

                  {dishResult && (
                    <div className="mt-4 p-3 bg-light rounded border border-info">
                      <h6 className="font-weight-bold text-dark">AI Generated Culinary Description:</h6>
                      <p className="lead" style={{ fontSize: "1.05rem" }}>
                        "{dishResult.description}"
                      </p>

                      <div className="mb-2">
                        <strong>Chef Tags: </strong>
                        {(dishResult.tags || []).map((t, idx) => (
                          <span key={idx} className="badge badge-success mr-1">
                            #{t}
                          </span>
                        ))}
                      </div>

                      <div className="mb-2">
                        <strong>Allergens: </strong>
                        {(dishResult.allergens || []).map((a, idx) => (
                          <span key={idx} className="badge badge-warning text-dark mr-1">
                            ⚠️ {a}
                          </span>
                        ))}
                      </div>

                      <div>
                        <strong>Serves: </strong> {dishResult.serves || "1-2 persons"} |{" "}
                        <strong>Best For: </strong> {(dishResult.bestFor || []).join(", ")}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="card-footer bg-light text-right py-2">
              <button className="btn btn-secondary" onClick={() => setIsOpen(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GenieAIAssistant;
