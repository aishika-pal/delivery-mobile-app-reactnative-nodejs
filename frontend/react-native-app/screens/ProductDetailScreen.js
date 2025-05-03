import React, { useContext } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { CartContext } from '../state/CartContext';

export default function ProductDetailScreen() {
  const route = useRoute();
  const { product } = route.params;
  const { addToCart } = useContext(CartContext);

  return (
    <View style={styles.container}>
      <Text style={styles.name}>{product.name}</Text>
      <Text style={styles.price}>₹{product.price}</Text>
      <Text style={styles.stock}>{product.inStock ? 'In Stock' : 'Out of Stock'}</Text>
      <Text style={styles.desc}>{product.description || 'No description available.'}</Text>
      <Button title="Add to Cart" onPress={() => addToCart(product)} disabled={!product.inStock} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  price: {
    fontSize: 18,
    color: '#007AFF',
    marginBottom: 8,
  },
  stock: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  desc: {
    fontSize: 14,
    color: '#888',
    marginBottom: 20,
    textAlign: 'center',
  },
});
