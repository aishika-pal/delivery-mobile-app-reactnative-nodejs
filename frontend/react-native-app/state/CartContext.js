import React, { createContext, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebaseSetup';

export const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);

  React.useEffect(() => {
    AsyncStorage.getItem('cart').then(data => {
      if (data) setCart(JSON.parse(data));
    });
  }, []);

  React.useEffect(() => {
    AsyncStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // Add product to cart or increment quantity
  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      } else {
        return [...prev, { ...product, quantity: 1 }];
      }
    });
  };

  // Remove product completely from cart
  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  // Change quantity (increment or decrement)
  const changeQuantity = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        if (newQty <= 0) return null;
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(Boolean));
  };

  const clearCart = () => setCart([]);

  // Place order with quantities
  const placeOrder = async () => {
    try {
      const placeOrderFn = httpsCallable(functions, 'placeOrder');
      await placeOrderFn({ items: cart });
      clearCart();
      alert('Order placed successfully!');
    } catch (e) {
      alert('Order failed. Please try again.');
    }
  };

  // Fetch user orders
  const getOrders = async () => {
    try {
      const getOrdersFn = httpsCallable(functions, 'getOrders');
      const result = await getOrdersFn();
      setOrders(result.data || []);
    } catch (e) {
      alert('Failed to fetch orders.');
    }
  };

  // Cancel an order
  const cancelOrder = async (orderId) => {
    try {
      const cancelOrderFn = httpsCallable(functions, 'cancelOrder');
      await cancelOrderFn({ orderId });
      alert('Order cancelled.');
      getOrders();
    } catch (e) {
      alert('Failed to cancel order.');
    }
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, changeQuantity, clearCart, placeOrder, orders, getOrders, cancelOrder }}>
      {children}
    </CartContext.Provider>
  );
}
