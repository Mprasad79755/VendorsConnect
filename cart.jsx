import React, { useState } from "react";
import "./Cart.css";
import Header from '../components/header';

const CartPage = () => {
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: "Wireless Earbuds",
      price: 2999,
      image: "https://via.placeholder.com/100",
      quantity: 1,
    },
    {
      id: 2,
      name: "Smartphone",
      price: 14999,
      image: "https://via.placeholder.com/100",
      quantity: 1,
    },
    {
      id: 3,
      name: "Sports Shoes",
      price: 2499,
      image: "https://via.placeholder.com/100",
      quantity: 1,
    },
  ]);

  const handleQuantityChange = (id, increment) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + increment) }
          : item
      )
    );
  };

  const handleRemove = (id) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const totalPrice = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  return (
    <div className="cart-page">
      <header className="cart-header">
        <Header></Header>
        <h1>Shopping Cart</h1>
      </header>
      <main className="cart-content">
        {cartItems.length === 0 ? (
          <p className="empty-cart">Your cart is empty!</p>
        ) : (
          <ul className="cart-items">
            {cartItems.map((item) => (
              <li key={item.id} className="cart-item">
                <img src={item.image} alt={item.name} className="item-image" />
                <div className="item-details">
                  <h2 className="item-name">{item.name}</h2>
                  <p className="item-price">₹{item.price}</p>
                  <div className="quantity-controls">
                    <button
                      className="quantity-btn"
                      onClick={() => handleQuantityChange(item.id, -1)}
                    >
                      -
                    </button>
                    <span className="quantity">{item.quantity}</span>
                    <button
                      className="quantity-btn"
                      onClick={() => handleQuantityChange(item.id, 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
                <button
                  className="remove-btn"
                  onClick={() => handleRemove(item.id)}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </main>
      <footer className="cart-footer">
        <div className="total-price">
          <span>Total:</span>
          <span className="price">₹{totalPrice}</span>
        </div>
        <button className="checkout-btn">Proceed to Checkout</button>
      </footer>
    </div>
  );
};

export default CartPage;
