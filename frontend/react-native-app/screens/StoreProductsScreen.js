import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebaseSetup';

export default function StoreProductsScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { store, categoryKey, subCategoryKey } = route.params;
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line
  }, [store, categoryKey, subCategoryKey]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let q = collection(db, 'products');
      if (categoryKey === 'food') {
        q = query(q, where('storeId', '==', store.id), where('category', '==', 'food'));
      } else if (categoryKey === 'groceries') {
        q = query(q, where('storeId', '==', store.id), where('category', '==', 'groceries'));
      } else if (categoryKey === 'medicine-healthcare-wellness') {
        if (subCategoryKey === 'medicines') {
          q = query(q, where('storeId', '==', store.id), where('category', '==', 'medicines'));
        } else if (subCategoryKey === 'healthcare-wellness') {
          q = query(q, where('storeId', '==', store.id), where('category', '==', 'healthcare-wellness'));
        } else if (subCategoryKey === 'all') {
          q = query(q, where('storeId', '==', store.id), where('category', 'in', ['medicines', 'healthcare-wellness']));
        }
      } else {
        q = query(q, where('storeId', '==', store.id));
      }
      const snapshot = await getDocs(q);
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (e) {
      setProducts([]);
    }
    setLoading(false);
  };

  // Only show OTC/non-OTC badge for medicines from pharmacy stores
  const isPharmacyStore = store.type === 'pharmacy' && categoryKey === 'medicine-healthcare-wellness' && (subCategoryKey === 'medicines' || subCategoryKey === 'all');

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{store.name} Products</Text>
      {loading ? <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 30 }} /> : (
        <FlatList
          data={products}
          keyExtractor={item => item.id || item.name}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.productCard} onPress={() => navigation.navigate('ProductDetail', { product: item, store, categoryKey, subCategoryKey })}>
              <Text style={styles.productName}>{item.name}</Text>
              <Text style={styles.productPrice}>₹{item.price}</Text>
              <Text style={styles.productStock}>{item.inStock ? 'In Stock' : 'Out of Stock'}</Text>
              {isPharmacyStore && item.category === 'medicines' && (
                <Text style={{ color: item.isOTC ? 'green' : 'red', fontWeight: 'bold' }}>
                  {item.isOTC ? 'OTC' : 'Prescription Required'}
                </Text>
              )}
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