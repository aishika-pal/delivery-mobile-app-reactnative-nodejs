# Instant Delivery App

A cross-platform mobile app for instant delivery of food, groceries, medicines, and wellness products from nearby stores.

## Tech Stack
- React Native (iOS & Android)
- Node.js (iOS & Android)
- Swift (iOS native)
- Kotlin (Android native)
- Firebase (Firestore, Auth, Functions)
- SQLite (local caching)

## Structure
- `/frontend/react-native-app`: Main cross-platform app
- `/frontend/ios-native`: Swift iOS app
- `/frontend/android-native`: Kotlin Android app
- `/backend/firebase`: Firebase backend (Firestore, Functions, Rules)

## Backend structure
/backend
  /models
    orderModel.js
    itemModel.js
    userModel.js
  /controllers
    orderController.js
    itemController.js
    userController.js
  /routes
    orderRoutes.js
    itemRoutes.js
    userRoutes.js
  index.js

## Features
- Responsive UI for phones and tablets
- Search bar at the bottom
- Categories: Food, Groceries, Medicines and Healthcare & Wellness Products
- Nearby store/eatery listing

---

Start by running the React Native app in `/frontend/react-native-app`.
