import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, StyleSheet } from 'react-native';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, query, where, onSnapshot, doc } from 'firebase/firestore';
import { firebaseApp } from '../firebaseConfig';
import MapView, { Marker } from 'react-native-maps';

export default function OrdersScreen() {
  const [orders, setOrders] = useState([]);
  const [progressMap, setProgressMap] = useState({});
  const db = getFirestore(firebaseApp);
  const auth = getAuth(firebaseApp);

  useEffect(() => {
    if (!auth.currentUser) return;
    const q = query(collection(db, 'orders'), where('userId', '==', auth.currentUser.uid));
    const unsub = onSnapshot(q, (snap) => {
      const items = [];
      snap.forEach(doc => items.push({ id: doc.id, ...doc.data() }));
      setOrders(items);
    });
    return () => unsub();
  }, [auth.currentUser]);

  useEffect(() => {
    // Simulate delivery progress for demo (for orders not delivered/cancelled)
    const interval = setInterval(() => {
      setProgressMap(prev => {
        const updated = { ...prev };
        orders.forEach(order => {
          if (order.status !== 'delivered' && order.status !== 'cancelled') {
            const curr = prev[order.id] || 0;
            updated[order.id] = Math.min(curr + 0.05, 1);
          }
        });
        return updated;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [orders]);

  const renderOrderItem = ({ item }) => (
    <View style={styles.orderItem}>
      <Text style={styles.orderId}>Order ID: {item.id}</Text>
      <View style={styles.statusRow}>
        <Text style={[styles.statusBadge, getStatusStyle(item.status)]}>{item.status?.toUpperCase()}</Text>
      </View>
      <Text>Items:</Text>
      {item.items?.map((prod, idx) => (
        <Text key={idx} style={styles.productLine}>{prod.name} x{prod.quantity} - ₹{prod.price * prod.quantity}</Text>
      ))}
      <Text style={styles.total}>Total: ₹{item.items?.reduce((sum, prod) => sum + prod.price * prod.quantity, 0)}</Text>
      {item.driverName && (
        <Text style={styles.driverText}>Driver: {item.driverName}</Text>
      )}
      {item.status !== 'cancelled' && item.status !== 'delivered' && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBar, { width: `${Math.round((progressMap[item.id] || 0) * 100)}%` }]} />
          </View>
          <Text style={styles.progressText}>{progressMap[item.id] >= 1 ? 'Out for Delivery' : 'Preparing...'}</Text>
        </View>
      )}
      {item.driverLocation && (
        <View style={{ height: 150, marginTop: 10, borderRadius: 8, overflow: 'hidden' }}>
          <MapView
            style={{ flex: 1 }}
            initialRegion={{
              latitude: item.driverLocation.lat,
              longitude: item.driverLocation.lng,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            region={{
              latitude: item.driverLocation.lat,
              longitude: item.driverLocation.lng,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            scrollEnabled={false}
            zoomEnabled={false}
          >
            <Marker
              coordinate={{ latitude: item.driverLocation.lat, longitude: item.driverLocation.lng }}
              title={item.driverName || 'Driver'}
              description={'Current driver location'}
            />
          </MapView>
        </View>
      )}
      {item.status !== 'cancelled' && (
        <Button title="Cancel Order" color="#c00" onPress={() => cancelOrder(item.id)} />
      )}
    </View>
  );

  function getStatusStyle(status) {
    switch (status) {
      case 'placed': return { backgroundColor: '#f0ad4e', color: '#fff' };
      case 'processing': return { backgroundColor: '#5bc0de', color: '#fff' };
      case 'out_for_delivery': return { backgroundColor: '#0275d8', color: '#fff' };
      case 'delivered': return { backgroundColor: '#5cb85c', color: '#fff' };
      case 'cancelled': return { backgroundColor: '#d9534f', color: '#fff' };
      default: return { backgroundColor: '#888', color: '#fff' };
    }
  }

  // Cancel order logic (for compatibility, you may want to keep using existing function)
  async function cancelOrder(orderId) {
    // You can use a callable function or update Firestore directly
    try {
      await db.collection('orders').doc(orderId).update({ status: 'cancelled' });
      alert('Order cancelled.');
    } catch (e) {
      alert('Failed to cancel order.');
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Orders</Text>
      <FlatList
        data={orders}
        keyExtractor={item => item.id}
        renderItem={renderOrderItem}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 30, color: '#888' }}>No orders found.</Text>}
      />
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
  orderItem: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    fontWeight: 'bold',
    fontSize: 12,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  productLine: {
    fontSize: 14,
    marginLeft: 10,
  },
  total: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
  },
  progressContainer: {
    marginTop: 10,
    marginBottom: 10,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    width: '100%',
    overflow: 'hidden',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#555',
    marginTop: 2,
    marginLeft: 2,
  },
  driverText: {
    marginTop: 8,
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0275d8',
  },
});
