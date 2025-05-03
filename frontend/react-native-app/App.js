import React from 'react';
import AppNavigator from './navigation';
import { CartProvider } from './state/CartContext';

export default function App() {
  return (
    <CartProvider>
      <AppNavigator />
    </CartProvider>
  );
}
const styles = StyleSheet.create({
  // ...other styles...

  // Paste here:
  categoryCard: {
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  categoryIcon: {
    fontSize: isTablet ? 48 : 32,
    marginBottom: 8,
  },
  categoryLabel: {
    fontSize: isTablet ? 22 : 16,
    fontWeight: '600',
    color: '#333',
  },
  searchBarContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 30 : 20,
    left: 0,
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  searchBar: {
    width: '100%',
    maxWidth: 500,
    backgroundColor: '#f5f5f5',
    borderRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: isTablet ? 16 : 12,
    fontSize: isTablet ? 20 : 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
});