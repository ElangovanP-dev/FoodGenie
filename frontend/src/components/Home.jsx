import React, { useEffect, useState } from "react";
import {
  sortByRatings,
  sortByReviews,
  toggleVegOnly,
} from "../redux/slices/restaurantSlice";

import {
  createRestaurant,
  getRestaurants,
} from "../redux/actions/restaurantAction";
import Restaurant from "./Restaurant";
import Loader from "./layout/Loader";
import Message from "./Message";
import { useDispatch, useSelector } from "react-redux";
import CountRestaurant from "./CountRestaurant";
import { useParams, Link } from "react-router-dom";
import GenieAIAssistant from "./GenieAIAssistant";

const Home = () => {
  const dispatch = useDispatch();
  const { keyword } = useParams();

  const {
    loading: restaurantsLoading,
    error: restaurantsError,
    restaurants,
    showVegOnly,
    creating,
    createError,
  } = useSelector((state) => state.restaurants);

  const {
    loading: authLoading,
    isAuthenticated,
    user,
  } = useSelector((state) => state.user);

  // AI Filter State
  const [aiData, setAiData] = useState(null);

  useEffect(() => {
    if (restaurantsError) {
      return alert(restaurantsError);
    }
    dispatch(getRestaurants(keyword));
  }, [dispatch, restaurantsError, keyword]);

  const handleSortByRatings = () => {
    dispatch(sortByRatings());
  };

  const handleSortByReviews = () => {
    dispatch(sortByReviews());
  };

  const handleApplyAIFilters = (result) => {
    setAiData(result);
  };

  const clearAIFilters = () => {
    setAiData(null);
  };

  // admin controls
  const [showCreate, setShowCreate] = useState(false);
  const [newRestaurant, setNewRestaurant] = useState({
    name: "",
    address: "",
    isVeg: false,
    location: { type: "Point", coordinates: [] },
    imageUrl: "",
  });
  const [coordsInput, setCoordsInput] = React.useState("");

  const handleOpenCreate = () => {
    setCoordsInput(newRestaurant.location.coordinates.join(","));
    setShowCreate(true);
  };

  const handleCloseCreate = () => {
    setShowCreate(false);
    setCoordsInput("");
  };

  const handleChange = (e) => {
    const { name, value, checked } = e.target;

    if (name === "isVeg") {
      setNewRestaurant({ ...newRestaurant, isVeg: checked });
    } else if (name === "coordinates") {
      setCoordsInput(value);

      const parts = value
        .split(",")
        .map((v) => v.trim())
        .filter((v) => v !== "");

      const coords = parts.map((v) => parseFloat(v)).filter((n) => !isNaN(n));

      setNewRestaurant({
        ...newRestaurant,
        location: { ...newRestaurant.location, coordinates: coords },
      });
    } else if (name === "imageUrl") {
      setNewRestaurant({ ...newRestaurant, imageUrl: value });
    } else {
      setNewRestaurant({ ...newRestaurant, [name]: value });
    }
  };

  const submitCreate = async (e) => {
    e.preventDefault();

    const payload = {
      name: newRestaurant.name,
      address: newRestaurant.address,
      isVeg: newRestaurant.isVeg,
      location: newRestaurant.location,
      images: [
        {
          public_id: "default",
          url: newRestaurant.imageUrl,
        },
      ],
    };

    const result = await dispatch(createRestaurant(payload));

    if (createRestaurant.fulfilled.match(result)) {
      handleCloseCreate();
      setCoordsInput("");
    }
  };

  const handleToggleVegOnly = () => {
    dispatch(toggleVegOnly());
  };

  // Determine list of restaurants to display
  const displayedRestaurants = aiData?.restaurants || restaurants || [];

  return (
    <>
      <CountRestaurant />

      {/* Genie AI Assistant Banner & Control */}
      <GenieAIAssistant onApplyFilters={handleApplyAIFilters} />

      {/* Active AI Filters Bar */}
      {aiData && (
        <div className="alert alert-success d-flex flex-wrap justify-content-between align-items-center my-3 py-2">
          <div>
            <strong>✨ Active AI Filters:</strong> {aiData.parsedFilters?.summary} (
            {displayedRestaurants.length} restaurants found)
          </div>
          <button className="btn btn-sm btn-outline-dark" onClick={clearAIFilters}>
            ✖ Reset to All Restaurants
          </button>
        </div>
      )}

      {/* Matching Food Items from AI Search */}
      {aiData?.foodItems && aiData.foodItems.length > 0 && (
        <div className="my-3 p-3 bg-white rounded shadow-sm">
          <h5 className="font-weight-bold text-success mb-3">
            🍽️ Matching Dishes found by Genie AI:
          </h5>
          <div className="row">
            {aiData.foodItems.map((item) => (
              <div key={item._id} className="col-md-4 my-2">
                <div className="card p-3 h-100 border-0 bg-light">
                  <h6 className="font-weight-bold mb-1">{item.name}</h6>
                  <p className="text-muted small mb-1">{item.description}</p>
                  <div className="d-flex justify-content-between align-items-center mt-auto">
                    <span className="font-weight-bold text-dark">₹{item.price}</span>
                    {item.restaurant && (
                      <Link
                        to={`/eats/stores/${item.restaurant._id || item.restaurant}/menus`}
                        className="btn btn-sm btn-success"
                      >
                        Order from {item.restaurant.name || "Restaurant"}
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {restaurantsLoading ? (
        <Loader />
      ) : restaurantsError ? (
        <Message variant="danger"> {restaurantsError}</Message>
      ) : (
        <>
          <section>
            <div className="sort">
              <button className="sort_veg p-3" onClick={handleToggleVegOnly}>
                {showVegOnly ? "Show All" : "Pure Veg"}
              </button>

              <button className="sort_rev p-3" onClick={handleSortByReviews}>
                Sort By Reviews
              </button>

              <button className="sort_rate p-3" onClick={handleSortByRatings}>
                Sort By ratings
              </button>
            </div>

            <div className="row mt-4">
              {displayedRestaurants && displayedRestaurants.length > 0 ? (
                displayedRestaurants.map((restaurant) =>
                  !showVegOnly || restaurant.isVeg ? (
                    <Restaurant key={restaurant._id} restaurant={restaurant} />
                  ) : null
                )
              ) : (
                <Message variant="info"> No restaurants Found. </Message>
              )}

              {/* admin add restaurant button */}
              {isAuthenticated && user && user.role === "admin" && (
                <div className="col-sm-12 col-md-6 col-lg-3 my-3">
                  <div
                    className="card p-3 rounded text-center d-flex align-items-center justify-content-center"
                    style={{ cursor: "pointer" }}
                    onClick={handleOpenCreate}
                  >
                    <h1 className="m-0">+</h1>
                    <p className="mb-0">Add Restaurant</p>
                  </div>
                </div>
              )}
            </div>

            {/* create form modal */}
            {showCreate && (
              <div className="create-modal">
                <div className="create-content">
                  <h3>Create Restaurant</h3>

                  <form onSubmit={submitCreate}>
                    {createError && (
                      <Message variant="danger">{createError}</Message>
                    )}

                    <div className="form-group">
                      <label>Name</label>
                      <input
                        type="text"
                        name="name"
                        value={newRestaurant.name}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Address</label>
                      <input
                        type="text"
                        name="address"
                        value={newRestaurant.address}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Pure Veg</label>
                      <input
                        type="checkbox"
                        name="isVeg"
                        checked={newRestaurant.isVeg}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="form-group">
                      <label>Coordinates (lat,lng)</label>
                      <input
                        type="text"
                        name="coordinates"
                        value={coordsInput}
                        onChange={handleChange}
                        placeholder="e.g. 40.77,-73.97"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Image URL</label>
                      <input
                        type="text"
                        name="imageUrl"
                        value={newRestaurant.imageUrl}
                        onChange={handleChange}
                        placeholder="https://..."
                        required
                      />
                    </div>

                    <button
                      className="btn btn-primary"
                      type="submit"
                      disabled={creating}
                    >
                      {creating ? "Creating..." : "Create"}
                    </button>

                    <button
                      className="btn btn-secondary ml-2"
                      type="button"
                      onClick={handleCloseCreate}
                    >
                      Cancel
                    </button>
                  </form>
                </div>
              </div>
            )}
          </section>
        </>
      )}
    </>
  );
};

export default Home;
