import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, ScrollView } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useAuth } from '../state/AuthContext'; // Adjust import based on your auth context/provider

export default function AddressScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { cart, prescriptions } = route.params;
  const { user } = useAuth(); // Assumes user object has a 'name' property

  const [buildingName, setBuildingName] = useState('');
  const [streetName, setStreetName] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [country, setCountry] = useState('');
  const [pin, setPin] = useState('');

  const handlePlaceOrder = async () => {
    const address = {
      name: user?.name || '',
      buildingName,
      streetName,
      city,
      state: stateName,
      country,
      pin,
    };

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
  };

  const isFormValid = () =>
    buildingName && streetName && city && stateName && country && pin;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Delivery Address</Text>
      <Text style={styles.label}>Name</Text>
      <TextInput
        style={[styles.input, { backgroundColor: '#eee' }]}
        value={user?.name || ''}
        editable={false}
      />
      <Text style={styles.label}>Building Name</Text>
      <TextInput
        style={styles.input}
        value={buildingName}
        onChangeText={setBuildingName}
        placeholder="Building Name"
      />
      <Text style={styles.label}>Street Name</Text>
      <TextInput
        style={styles.input}
        value={streetName}
        onChangeText={setStreetName}
        placeholder="Street Name"
      />
      <Text style={styles.label}>City</Text>
      <TextInput
        style={styles.input}
        value={city}
        onChangeText={setCity}
        placeholder="City"
      />
      <Text style={styles.label}>State</Text>
      <TextInput
        style={styles.input}
        value={stateName}
        onChangeText={setStateName}
        placeholder="State"
      />
      <Text style={styles.label}>Country</Text>
      <TextInput
        style={styles.input}
        value={country}
        onChangeText={setCountry}
        placeholder="Country"
      />
      <Text style={styles.label}>PIN</Text>
      <TextInput
        style={styles.input}
        value={pin}
        onChangeText={setPin}
        placeholder="PIN"
        keyboardType="numeric"
      />
      <Button
        title="Confirm & Place Order"
        onPress={handlePlaceOrder}
        disabled={!isFormValid()}
      />
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
  label: {
    marginTop: 12,
    marginBottom: 4,
    fontWeight: '600',
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#bbb',
    borderRadius: 6,
    padding: 10,
    fontSize: 16,
    backgroundColor: '#fff',
  },
});