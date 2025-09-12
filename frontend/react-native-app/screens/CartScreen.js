import React, { useContext, useState } from 'react';
import { View, Text, FlatList, Button, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { CartContext } from '../state/CartContext';
import * as DocumentPicker from 'expo-document-picker';

export default function CartScreen() {
  const { cart, removeFromCart, changeQuantity, clearCart, setPrescriptionForProduct, prescriptions } = useContext(CartContext);
  const [uploading, setUploading] = useState({});
  const navigation = useNavigation();

  // Only require prescription for non-OTC medicines from pharmacy stores
  const isNonOTCPharmacyMedicine = (item) =>
    item.store?.type === 'pharmacy' &&
    item.categoryKey === 'medicine-healthcare-wellness' &&
    (item.subCategoryKey === 'medicines' || item.subCategoryKey === 'all') &&
    item.category === 'medicines' &&
    !item.isOTC;

  const handleUploadPrescription = async (productId) => {
    try {
      setUploading(prev => ({ ...prev, [productId]: true }));
      const result = await DocumentPicker.getDocumentAsync({ type: 'image/*' });
      if (result.type === 'success') {
        setPrescriptionForProduct(productId, result.uri);
        Alert.alert('Success', 'Prescription uploaded!');
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to upload prescription.');
    }
    setUploading(prev => ({ ...prev, [productId]: false }));
  };

  const canPlaceOrder = cart.every(item =>
    !isNonOTCPharmacyMedicine(item) || (prescriptions && prescriptions[item.id])
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Cart</Text>
      <FlatList
        data={cart}
        keyExtractor={item => item.id || item.name}
        renderItem={({ item }) => (
          <View style={styles.cartItem}>
            <View style={{ flex: 3 }}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemPrice}>₹{item.price}</Text>
              {isNonOTCPharmacyMedicine(item) && (
                <View style={{ marginTop: 6 }}>
                  <Text style={{ color: 'red', fontWeight: 'bold' }}>Prescription Required</Text>
                  <Button
                    title={prescriptions && prescriptions[item.id] ? "Prescription Uploaded" : "Upload Prescription"}
                    onPress={() => handleUploadPrescription(item.id)}
                    color={prescriptions && prescriptions[item.id] ? "#4caf50" : "#007AFF"}
                    disabled={!!(prescriptions && prescriptions[item.id]) || uploading[item.id]}
                  />
                </View>
              )}
            </View>
            <View style={styles.quantityContainer}>
              <TouchableOpacity style={styles.qtyBtn} onPress={() => changeQuantity(item.id, -1)}>
                <Text style={styles.qtyBtnText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.qtyText}>{item.quantity}</Text>
              <TouchableOpacity style={styles.qtyBtn} onPress={() => changeQuantity(item.id, 1)}>
                <Text style={styles.qtyBtnText}>+</Text>
              </TouchableOpacity>
            </View>
            <Button title="Remove" onPress={() => removeFromCart(item.id)} />
          </View>
        )}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 30, color: '#888' }}>Your cart is empty.</Text>}
      />
      {cart.length > 0 && (
        <View style={styles.footer}>
          <Text style={styles.total}>Total: ₹{cart.reduce((sum, item) => sum + item.price * item.quantity, 0)}</Text>
          <Button
            title="Place Order"
            onPress={() => navigation.navigate('AddressScreen', { cart, prescriptions })}
            disabled={!canPlaceOrder}
          />
          {!canPlaceOrder && (
            <Text style={{ color: 'red', marginTop: 8, textAlign: 'center' }}>
              Please upload prescriptions for all non-OTC medicines from pharmacy stores.
            </Text>
          )}
          <Button title="Clear Cart" onPress={clearCart} color="#888" />
        </View>
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
  cartItem: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
    flex: 2,
  },
  itemPrice: {
    fontSize: 16,
    color: '#007AFF',
    flex: 1,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 2,
    justifyContent: 'center',
  },
  qtyBtn: {
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginHorizontal: 4,
  },
  qtyBtnText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  qtyText: {
    fontSize: 16,
    marginHorizontal: 8,
  },
  footer: {
    marginTop: 20,
    alignItems: 'center',
  },
  total: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});