import React, { useEffect, useState } from 'react';
import { FlatList, Text, Image, View } from 'react-native';
import * as SQLite from 'expo-sqlite';

const CartScreen = () => {
  const [cartItems, setCartItems] = useState([]);
  const [db, setDb] = useState(null); // State to hold the database instance
  const [loading, setLoading] = useState(true); // Loading state to wait for db initialization

  // Initialize the database
  const initDB = async () => {
    try {
      const database = await SQLite.openDatabaseAsync('mydb.db'); // Open the SQLite database asynchronously
      setDb(database); // Set the db state once the database is open
      await database.execAsync('PRAGMA journal_mode = WAL');
      await database.execAsync('PRAGMA foreign_keys = ON');
      
      // Ensure the cart table is created
      await database.execAsync(`
        CREATE TABLE IF NOT EXISTS cart (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT,
          price REAL,
          description TEXT,
          image TEXT
        );
      `);

      setLoading(false); // Mark loading as false once DB is ready
    } catch (error) {
      console.error('Failed to initialize DB:', error);
      setLoading(false); // If DB fails to load, mark loading as false
    }
  };

  // Fetch cart items from the database
  const fetchCartItems = async () => {
    if (!db) return; // Ensure the db is available
    try {
      // Execute query to fetch cart items
      const result = await db.execAsync('SELECT * FROM cart');
      
      // Log the result to see if any data is returned
      console.log('Fetched cart items:', result);
      
      // Check if the result is valid
      if (result && result[0] && result[0].rows) {
        setCartItems(result[0].rows._array); // Assuming result[0].rows._array contains the cart items
      } else {
        console.log('No cart items found.');
      }
    } catch (error) {
      console.error('Error fetching cart items:', error);
    }
  };

  // Initialize DB when the component mounts
  useEffect(() => {
    initDB(); // Initialize the database
  }, []);

  // Fetch cart items once the database is initialized
  useEffect(() => {
    if (db) {
      fetchCartItems(); // Fetch cart items only after DB is initialized
    }
  }, [db]); // Only run when `db` is set

  // Show loading indicator while waiting for DB
  if (loading) {
    return <Text>Loading...</Text>;
  }

  return (
    <View>
      <FlatList
        data={cartItems}
        renderItem={({ item }) => (
          <View style={{ margin: 10, borderWidth: 1, padding: 10 }}>
            <Image source={{ uri: item.image }} style={{ width: 100, height: 100 }} />
            <Text>{item.title}</Text>
            <Text>{item.description}</Text>
            <Text>Цена: ${item.price}</Text>
          </View>
        )}
        keyExtractor={(item) => item.id.toString()}
      />
    </View>
  );
};

export default CartScreen;
