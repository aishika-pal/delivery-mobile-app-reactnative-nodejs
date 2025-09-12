import React from 'react';
import { View, Text, FlatList, Button, StyleSheet, ScrollView } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';

export default function CheckoutScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { cart, prescriptions, address } = route.params;

  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleProceedToPayment = () => {
    navigation.navigate('PaymentScreen', { cart, prescriptions, address, totalAmount });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Checkout</Text>
      <Text style={styles.sectionHeader}>Delivery Address</Text>
      <View style={styles.addressBox}>
        <Text>{address.name}</Text>
        <Text>{address.buildingName}</Text>
        <Text>{address.streetName}</Text>
        <Text>{address.city}, {address.state}</Text>
        <Text>{address.country} - {address.pin}</Text>
      </View>
      <Text style={styles.sectionHeader}>Order Items</Text>
      <FlatList
        data={cart}
        keyExtractor={item => item.id || item.productId || item.name}
        renderItem={({ item }) => (
          <View style={styles.itemRow}>
            <Text style={styles.itemName}>{item.name} x{item.quantity}</Text>
            <Text style={styles.itemPrice}>₹{item.price * item.quantity}</Text>
          </View>
        )}
        scrollEnabled={false}
      />
      <Text style={styles.total}>
        Total: ₹{totalAmount}
      </Text>
      <Button title="Proceed to Payment" onPress={handleProceedToPayment} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 18,
    textAlign: 'center',
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 18,
    marginBottom: 6,
  },
  addressBox: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  itemName: {
    fontSize: 16,
    flex: 2,
  },
  itemPrice: {
    fontSize: 16,
    flex: 1,
    textAlign: 'right',
  },
  total: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 18,
    textAlign: 'right',
  },
});