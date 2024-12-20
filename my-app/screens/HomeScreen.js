import React, { useEffect, useState } from 'react';
import { FlatList, Text, Image, View, Button, RefreshControl, StyleSheet } from 'react-native';
import axios from 'axios';
import * as SQLite from 'expo-sqlite';

const HomeScreen = () => {
  const [products, setProducts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [db, setDb] = useState(null); // State to hold the database instance

  // Загрузка товаров
  const fetchProducts = async () => {
    try {
      const response = await axios.get('https://fakestoreapi.com/products');
      setProducts(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  // Инициализация базы данных
  const initDB = async () => {
    try {
      const database = await SQLite.openDatabaseAsync('mydb.db'); // Open the SQLite database asynchronously
      setDb(database);
      await database.execAsync('PRAGMA journal_mode = WAL');
      await database.execAsync('PRAGMA foreign_keys = ON');
      await database.execAsync('CREATE TABLE IF NOT EXISTS cart (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, price REAL, description TEXT, image TEXT)');
    } catch (error) {
      console.error('Failed to initialize DB:', error);
    }
  };

  // Добавление товара в корзину
  const addToCart = async (product) => {
    if (!db) {
      console.error('Database is not initialized.');
      return; // Ensure the db is available
    }
  
    // Ensure the cart table exists
    try {
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS cart (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT,
          price REAL,
          description TEXT,
          image TEXT
        )
      `);
  
      // Insert product into the cart table
      await db.execAsync(
        'INSERT INTO cart (title, price, description, image) VALUES (?, ?, ?, ?)', 
        [product.title, product.price, product.description, product.image]
      );
  
      alert('Товар добавлен в корзину');
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };
  

  // Обработчик Pull-To-Refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchProducts().finally(() => setRefreshing(false));
  };

  useEffect(() => {
    initDB();
    fetchProducts();
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        data={products}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={{ uri: item.image }} style={styles.image} />
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.description}>{item.description}</Text>
            <Text style={styles.price}>Цена: ${item.price}</Text>
            <Button title="Добавить в корзину" onPress={() => addToCart(item)} />
          </View>
        )}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    paddingHorizontal: 10,
  },
  card: {
    marginBottom: 20,
    borderWidth: 1,
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#fff',
    elevation: 3, // Добавляет тень
  },
  image: {
    width: 100,
    height: 100,
    marginBottom: 10,
    alignSelf: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 10,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
});

export default HomeScreen;
