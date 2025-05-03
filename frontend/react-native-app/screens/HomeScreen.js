import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, FlatList, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebaseSetup';
import { initLocalDB, setCache, getCache } from '../database';

const categories = [
  { label: 'Food', icon: '🍕', key: 'food' },
  {
    label: 'Medicines and Healthcare & Wellness Products',
    icon: '⛨',
    key: 'healthcare-wellness',
    subcategories: [
      { label: 'Medicines', key: 'medicines' },
      { label: 'Healthcare & Wellness', key: 'healthcare-wellness' }
    ]
  }
];

export default function HomeScreen() {
  const navigation = useNavigation();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(categories[0].key);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    initLocalDB();
    if (selectedCategory === 'healthcare-wellness') {
      // Default to 'medicines' subcategory if not set
      fetchStores(selectedCategory, selectedSubCategory || 'medicines');
    } else {
      fetchStores(selectedCategory);
    }
  }, [selectedCategory, selectedSubCategory]);

  const fetchStores = async (categoryKey, subCategoryKey = null) => {
    setLoading(true);
    let storeTypeFilter = null;
    if (categoryKey === 'food') {
      storeTypeFilter = 'eatery';
    } else if (categoryKey === 'groceries') {
      storeTypeFilter = 'grocery';
    } else if (categoryKey === 'healthcare-wellness') {
      if (subCategoryKey === 'medicines') {
        storeTypeFilter = 'pharmacy';
      } else if (subCategoryKey === 'healthcare-wellness') {
        storeTypeFilter = ['pharmacy', 'grocery'];
      }
    }
    const cacheKey = subCategoryKey ? `stores_${categoryKey}_${subCategoryKey}` : `stores_${categoryKey}`;
    getCache(cacheKey, async (cached) => {
      if (cached) {
        setStores(JSON.parse(cached));
        setLoading(false);
      }
      try {
        const getStores = httpsCallable(functions, 'getNearbyStores');
        const result = await getStores({ category: categoryKey, subCategory: subCategoryKey, storeType: storeTypeFilter });
        if (result?.data) {
          setStores(result.data);
          setCache(cacheKey, JSON.stringify(result.data));
        }
      } catch (e) {
        if (!cached) setStores([]);
      } finally {
        setLoading(false);
      }
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Instant Delivery</Text>
        <Text style={styles.subtitle}>Get anything delivered within minutes</Text>
      </View>
      <ScrollView contentContainerStyle={styles.categoriesContainer} horizontal showsHorizontalScrollIndicator={false}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.key}
            style={[styles.categoryCard, selectedCategory === cat.key && styles.categoryCardSelected]}
            onPress={() => {
              setSelectedCategory(cat.key);
              if (cat.key === 'healthcare-wellness') setSelectedSubCategory('medicines');
              else setSelectedSubCategory(null);
            }}
          >
            <Text style={styles.categoryIcon}>{cat.icon}</Text>
            <Text style={styles.categoryLabel}>{cat.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {/* Subcategory Tabs */}
      {selectedCategory === 'healthcare-wellness' && (
        <View style={styles.subCategoryRow}>
          {categories.find(c => c.key === 'healthcare-wellness').subcategories.map(sub => (
            <TouchableOpacity
              key={sub.key}
              style={[
                styles.subCategoryTab,
                selectedSubCategory === sub.key && styles.subCategoryTabActive
              ]}
              onPress={() => setSelectedSubCategory(sub.key)}
            >
              <Text style={{ color: selectedSubCategory === sub.key ? '#007AFF' : '#333' }}>{sub.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      <View style={styles.listContainer}>
        {loading ? (
          <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 30 }} />
        ) : (
          <FlatList
            data={stores.filter(store => store.name.toLowerCase().includes(search.toLowerCase()))}
            keyExtractor={item => item.id || item.name}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.storeCard} onPress={() => navigation.navigate('StoreProducts', { store: item })}>
                <Text style={styles.storeName}>{item.name}</Text>
                <Text style={styles.storeType}>{item.type}</Text>
                <Text style={styles.storeLocation}>{item.location}</Text>
                <Text style={styles.storeRating}>⭐ {item.rating}</Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 30, color: '#888' }}>No stores found.</Text>}
          />
        )}
      </View>
      <View style={styles.searchBarContainer}>
        <TextInput
          style={styles.searchBar}
          placeholder="Search for food, medicines, wellness products..."
          value={search}
          onChangeText={setSearch}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'flex-end',
  },
  header: {
    paddingTop: 40,
    paddingHorizontal: 24,
    paddingBottom: 8,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#222',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 10,
  },
  categoryCard: {
    width: 180,
    height: 100,
    backgroundColor: '#f2f2f2',
    borderRadius: 16,
    margin: 10,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  categoryCardSelected: {
    backgroundColor: '#e0f7fa',
    borderWidth: 2,
    borderColor: '#00bcd4',
  },
  categoryIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  categoryLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  subCategoryRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  subCategoryTab: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f2f2f2',
    marginHorizontal: 6,
  },
  subCategoryTabActive: {
    backgroundColor: '#e0f7fa',
    borderColor: '#00bcd4',
    borderWidth: 2,
  },
  listContainer: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 80,
  },
  storeCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    elevation: 1,
  },
  storeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
  },
  storeType: {
    fontSize: 14,
    color: '#555',
  },
  storeLocation: {
    fontSize: 12,
    color: '#888',
  },
  storeRating: {
    fontSize: 12,
    color: '#007AFF',
    marginTop: 4,
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
    paddingVertical: 12,
    fontSize: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
});