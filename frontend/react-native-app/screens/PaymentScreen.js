import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, Alert, TouchableOpacity, TextInput, Platform } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';

const paymentMethods = [
  { key: 'credit_card', label: 'Credit Card' },
  { key: 'debit_card', label: 'Debit Card' },
  { key: 'upi', label: 'UPI' },
  { key: 'stripe', label: 'Stripe' },
  { key: 'cod', label: 'Cash on Delivery' },
];

export default function PaymentScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { cart, prescriptions, address, totalAmount } = route.params;
  const [selectedMethod, setSelectedMethod] = useState('cod');
  const [paying, setPaying] = useState(false);
  const [upiId, setUpiId] = useState('');
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvv: '' });

  const handlePay = async () => {
    setPaying(true);

    // Simulate payment gateway for demo
    if (selectedMethod === 'cod') {
      // Place order directly for COD
      await placeOrder();
    } else if (selectedMethod === 'upi') {
      if (!upiId) {
        Alert.alert('Enter UPI ID');
        setPaying(false);
        return;
      }
      // Simulate UPI payment
      setTimeout(async () => {
        Alert.alert('Payment Successful', 'UPI payment received.');
        await placeOrder();
      }, 1500);
    } else if (selectedMethod === 'credit_card' || selectedMethod === 'debit_card') {
      if (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvv) {
        Alert.alert('Enter all card details');
        setPaying(false);
        return;
      }
      // Simulate card payment
      setTimeout(async () => {
        Alert.alert('Payment Successful', 'Card payment received.');
        await placeOrder();
      }, 1500);
    } else if (selectedMethod === 'stripe') {
      // Simulate Stripe payment
      setTimeout(async () => {
        Alert.alert('Payment Successful', 'Stripe payment received.');
        await placeOrder();
      }, 1500);
    }
  };

  const placeOrder = async () => {
    try {
      // Replace with your actual API endpoint
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cart, prescriptions, address }),
      });
      if (response.ok) {
        Alert.alert('Order placed!');
        navigation.navigate('OrdersScreen');
      } else {
        const err = await response.json();
        Alert.alert('Order failed', err.error || 'Unknown error');
      }
    } catch (e) {
      Alert.alert('Order failed', e.message);
    }
    setPaying(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Payment</Text>
      <Text style={styles.amount}>Pay ₹{totalAmount}</Text>
      <Text style={styles.sectionHeader}>Select Payment Method</Text>
      {paymentMethods.map(method => (
        <TouchableOpacity
          key={method.key}
          style={[
            styles.methodBtn,
            selectedMethod === method.key && styles.methodBtnSelected,
          ]}
          onPress={() => setSelectedMethod(method.key)}
        >
          <Text style={{ color: selectedMethod === method.key ? '#007AFF' : '#333' }}>
            {method.label}
          </Text>
        </TouchableOpacity>
      ))}

      {selectedMethod === 'upi' && (
        <TextInput
          style={styles.input}
          placeholder="Enter UPI ID"
          value={upiId}
          onChangeText={setUpiId}
          autoCapitalize="none"
        />
      )}

      {(selectedMethod === 'credit_card' || selectedMethod === 'debit_card') && (
        <View>
          <TextInput
            style={styles.input}
            placeholder="Card Number"
            value={cardDetails.number}
            onChangeText={number => setCardDetails({ ...cardDetails, number })}
            keyboardType="numeric"
            maxLength={16}
          />
          <TextInput
            style={styles.input}
            placeholder="Expiry (MM/YY)"
            value={cardDetails.expiry}
            onChangeText={expiry => setCardDetails({ ...cardDetails, expiry })}
            maxLength={5}
          />
          <TextInput
            style={styles.input}
            placeholder="CVV"
            value={cardDetails.cvv}
            onChangeText={cvv => setCardDetails({ ...cardDetails, cvv })}
            keyboardType="numeric"
            maxLength={4}
            secureTextEntry
          />
        </View>
      )}

      <Button
        title={`Pay ₹${totalAmount}`}
        onPress={handlePay}
        disabled={paying}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#fff',
    flex: 1,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 18,
    textAlign: 'center',
  },
  amount: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 18,
    textAlign: 'center',
    color: '#007AFF',
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 18,
    marginBottom: 6,
  },
  methodBtn: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    marginVertical: 4,
  },
  methodBtnSelected: {
    backgroundColor: '#e0f7fa',
    borderColor: '#00bcd4',
    borderWidth: 2,
  },
  input: {
    borderWidth: 1,
    borderColor: '#bbb',
    borderRadius: 6,
    padding: 10,
    fontSize: 16,
    backgroundColor: '#fff',
    marginVertical: 6,
  },
});