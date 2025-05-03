import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebaseSetup';
import { getCache, setCache } from '../database';

export default function StoreProductsScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { store } = route.params;
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [store, categoryKey, subCategoryKey]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let q = collection(db, 'products');
      // Filtering logic based on categoryKey and subCategoryKey
      if (categoryKey === 'food') {
        q = query(q, where('storeId', '==', store.id), where('category', '==', 'food'));
      } else if (categoryKey === 'groceries') {
        q = query(q, where('storeId', '==', store.id), where('category', '==', 'groceries'));
      } else if (categoryKey === 'healthcare-wellness') {
        if (subCategoryKey === 'medicines') {
          q = query(q, where('storeId', '==', store.id), where('category', '==', 'medicines'));
        } else if (subCategoryKey === 'healthcare-wellness') {
          q = query(q, where('storeId', '==', store.id), where('category', '==', 'healthcare-wellness'));
        }
      } else {
        // fallback: show all products for the store
        q = query(q, where('storeId', '==', store.id));
      }
      const snapshot = await getDocs(q);
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (e) {
      setProducts([]);
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{store.name} Products</Text>
      {loading ? <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 30 }} /> : (
        <FlatList
          data={products}
          keyExtractor={item => item.id || item.name}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.productCard} onPress={() => navigation.navigate('ProductDetail', { product: item })}>
              <Text style={styles.productName}>{item.name}</Text>
              <Text style={styles.productPrice}>₹{item.price}</Text>
              <Text style={styles.productStock}>{item.inStock ? 'In Stock' : 'Out of Stock'}</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 30, color: '#888' }}>No products found.</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  productCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
  },
  productPrice: {
    fontSize: 16,
    color: '#007AFF',
  },
  productStock: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
});
