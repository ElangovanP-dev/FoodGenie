# Food Genie 🍔
> *"Genie grants your food wishes"* — A Full-Stack Food Ordering Platform Supercharged with AI

[![MERN Stack](https://img.shields.io/badge/Stack-MERN-green.svg)](https://reactjs.org/)
[![AI-Powered](https://img.shields.io/badge/AI-Groq%20LLaMA%203.1-blueviolet.svg)](https://groq.com/)
[![Database](https://img.shields.io/badge/Database-MongoDB%20Atlas-brightgreen.svg)](https://www.mongodb.com/)
[![License: ISC](https://img.shields.io/badge/License-ISC-yellow.svg)](https://opensource.org/licenses/ISC)

---

## 📖 Project Overview

**Food Genie** is a full-stack web application built using the modern **MERN** stack (MongoDB, Express.js, React, Node.js) and integrated with the ultra-fast **Groq Large Language Model (LLaMA 3.1)**. 

Beyond conventional food ordering, Food Genie adds an AI "brain" to the shopping experience:
- It understands natural conversational queries.
- It recommends custom dishes tailored to personal mood, dietary restriction, and budget.
- It summarizes real user reviews with sentiment and key bullet points.
- It auto-generates appetizing restaurant descriptions and allergen tags.

---

## 🌟 Four Core AI Features

```
+-----------------------------------------------------------------------------------+
|                                 THE AI BRAIN                                      |
|                       Large Language Model (Groq LLaMA 3.1)                       |
|               Prompt  --->  Fast Groq Inference  --->  Structured JSON           |
+-----------------------------------------------------------------------------------+
       |                          |                        |                  |
       v                          v                        v                  v
1. Dish Description       2. Review Analyzer      3. Smart Food        4. Natural Language
      Generator                                      Recommender             Search
 Auto-writes gourmet      Sentiment analysis &     Suggests dishes by   Converts English to
 descriptions, tags &     key takeaway bullets     mood, diet & budget  live database filters
 realistic allergens     from customer reviews    with instant add     (e.g., pure veg < ₹300)
```

### 1. ✍️ Dish Description Generator
- **Input:** Dish Name (e.g., *Paneer Tikka*), Category (*Veg*), Spice Level (*Medium*), Price (*₹220*).
- **AI Output:** Delectable restaurant-style descriptions, chef tags (e.g., `#NorthIndian`, `#Tandoori`), realistic allergens (e.g., `Dairy`), serving portion size, and recommended meal timings (`Lunch`, `Dinner`).

### 2. 📊 AI Review Analyzer
- **Input:** All aggregated customer reviews for a restaurant.
- **AI Output:** 
  - Sentiment classification (`Positive 😊`, `Mixed 😐`, `Negative 🙁`).
  - Key bullet summary highlighting food quality and delivery speed.
  - Top trending mention tags (e.g., `#AuthenticTaste`, `#FastDelivery`).

### 3. 🎯 Smart Food Recommender
- **Input:** Customer mood (*Comfort Food, Spicy & Bold, Late Night Snack*), dietary restriction (*Pure Veg, Non-Veg*), and budget (*₹200*).
- **AI Output:** Up to 4 tailored dish recommendations from the restaurant catalog matching the exact budget and craving, complete with calories and reasons.

### 4. 🔍 Natural Language Search
- **Input:** Natural conversational English (e.g., *"Show me veg food under ₹300 with good ratings"*).
- **AI Output:** Structured filter extraction:
  - `isVeg: true`
  - `maxPrice: 300`
  - `minRating: 4.0`
  - Instant live filtering on restaurant cards and menu items.

---

## 🛠️ Tech Stack

- **Frontend:**
  - React 18
  - Redux Toolkit (State management for Cart, User, Restaurants, Menus)
  - Vite (Fast development & production build)
  - React Router DOM v7
  - React Toastify & FontAwesome Icons
  - Bootstrap 4 & Custom Responsive CSS

- **Backend:**
  - Node.js & Express.js REST API
  - MongoDB Atlas Cloud Database with Mongoose ODM
  - Groq Cloud SDK / REST API (LLaMA 3.1 model series)
  - JWT Authentication with HTTP-Only Cookies
  - Stripe Payment Integration
  - Cloudinary for Media & Restaurant Image Storage

---

## 📁 Repository Structure

```
FoodGenie/
├── backend/
│   ├── config/
│   │   ├── config.env.example
│   │   ├── database.js
│   │   └── cloudinary.js
│   ├── controllers/
│   │   ├── ai.controller.js          <-- 4 AI features implementation
│   │   ├── authController.js
│   │   ├── cartController.js
│   │   ├── foodItemController.js
│   │   ├── menuController.js
│   │   ├── orderController.js
│   │   └── restaurantController.js
│   ├── middlewares/
│   │   ├── authorizeRoles.js
│   │   ├── catchAsyncErrors.js
│   │   └── errors.js
│   ├── models/
│   │   ├── cartModel.js
│   │   ├── foodItem.js               <-- Contains AI metadata fields
│   │   ├── menu.js
│   │   ├── order.js
│   │   ├── restaurant.js             <-- Contains AI sentiment fields
│   │   └── user.js
│   ├── routes/
│   │   ├── ai.routes.js              <-- AI REST endpoints
│   │   ├── auth.js
│   │   ├── cart.js
│   │   ├── foodItem.js
│   │   ├── menu.js
│   │   ├── order.js
│   │   └── restaurant.js
│   ├── services/
│   │   ├── ai.service.js             <-- Groq LLaMA 3.1 LLM integration
│   │   └── aiReviewAnalyzer.js      <-- Sentiment & review analyzer service
│   ├── app.js
│   ├── server.js
│   └── package.json
│
└── frontend/
    ├── public/
    │   └── images/
    ├── src/
    │   ├── components/
    │   │   ├── cart/
    │   │   ├── layout/
    │   │   │   ├── Header.jsx
    │   │   │   ├── Footer.jsx
    │   │   │   ├── Search.jsx
    │   │   │   └── Loader.jsx
    │   │   ├── order/
    │   │   ├── user/
    │   │   ├── Fooditem.jsx
    │   │   ├── GenieAIAssistant.jsx  <-- Interactive AI UI Assistant
    │   │   ├── Home.jsx              <-- Main home with AI banner & filters
    │   │   ├── Menu.jsx              <-- Restaurant menu with AI tags
    │   │   └── Restaurant.jsx        <-- AI Review summary cards
    │   ├── redux/
    │   │   ├── actions/
    │   │   ├── slices/
    │   │   └── store.js
    │   ├── App.jsx
    │   ├── App.css
    │   └── main.jsx
    ├── index.html
    ├── package.json
    └── vite.config.js
```

---

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/ElangovanP-dev/FoodGenie.git
cd FoodGenie
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Configure environment variables in `backend/config/config.env` using `config.env.example` as a template:
```env
PORT=4000
NODE_ENV=DEVELOPMENT
DB_LOCAL_URI=your_mongodb_atlas_connection_string
GROQ_API_KEY=your_groq_api_key
JWT_SECRET=your_secret_key
FRONTEND_URL=http://localhost:5173
```

Start the backend server:
```bash
npm start
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 📸 Internship Report Requirements

- **Food Genie Home Page:** Displays active restaurants, pure veg toggles, review ratings, and the Genie AI Assistant.
- **Menu & Cart:** Interactive food item cards with live stock counters, AI tags, and persistent cart order summaries.
- **AI Features:**
  - *Smart Food Recommender*: Recommends dishes by mood, diet, and budget.
  - *Natural Language Search*: Instant query translation into filters.
  - *Dish Description Generator*: Instant culinary prompt completions.
  - *Review Sentiment Analyzer*: Real customer review sentiment breakdown.
- **MongoDB Atlas Data:** Live collections for restaurants, fooditems, menus, users, and carts.
- **GitHub Repository:** [https://github.com/ElangovanP-dev/FoodGenie](https://github.com/ElangovanP-dev/FoodGenie)

---

## 👨‍💻 Author
**Elangovan P**  
GitHub: [@ElangovanP-dev](https://github.com/ElangovanP-dev)  
Email: [elangovanp222@gmail.com](mailto:elangovanp222@gmail.com)
