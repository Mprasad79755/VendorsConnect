import React, { useEffect, useState } from "react";
import { db } from "../firebase"; // Update with your Firebase setup
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import "./cart.css";
import { useAuth } from "../contexts/AuthContext";
import { FaTrashAlt } from "react-icons/fa";

const CartPage = () => {
  const { currentUser } = useAuth(); // Get currentUser from context
  const userId = currentUser?.uid; // Extract UID from the authenticated user
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (userId) {
      fetchCartItems();
    }
  }, [userId]);

  const fetchCartItems = async () => {
    try {
      const cartQuery = query(collection(db, "cart"), where("userid", "==", userId));
      const cartSnapshot = await getDocs(cartQuery);
      const items = [];

      let totalPrice = 0;

      for (const docSnap of cartSnapshot.docs) {
        const cartItem = docSnap.data();

        // Fetch product details using productId
        const productRef = doc(db, "products", cartItem.productid);
        const productSnap = await getDoc(productRef);

        if (productSnap.exists()) {
          const product = productSnap.data();
          items.push({
            ...cartItem,
            productName: product.name,
            productPrice: product.price,
            productImage: product.image, // Image URL
          });

          totalPrice += product.price * cartItem.quantity;
        }
      }

      setCartItems(items);
      setTotal(totalPrice);
    } catch (error) {
      console.error("Error fetching cart items:", error);
    }
  };

  const handleRemoveItem = (productId) => {
    // Function to remove an item from the cart (to be implemented with Firestore)
    console.log("Remove item with ID:", productId);
  };

  return (
    <>
    <br /><br /><br /><br /><br /><br /><br />
    <div
      className="cart-page min-vh-100"
      style={{
        background: "linear-gradient(to bottom, #f8f9fa, #e8f5e9)",
        paddingBottom: "100px", // To account for the bottom navbar
      }}
    >
      {/* Header */}
      <div className="cart-header text-center py-3" style={{ background: "#43a047", color: "white" }}>
        <h2 className="fw-bold">Your Cart</h2>
      </div>

      {/* Cart Items */}
      <div className="container p-3">
        {cartItems.length > 0 ? (
          cartItems.map((item, index) => (
            <div className="cart-item d-flex align-items-center mb-3" key={index}>
              {/* Product Image */}
              <div className="product-image">
                <img src={item.productImage} alt={item.productName} className="img-fluid rounded" />
              </div>

              {/* Product Details */}
              <div className="ms-3 flex-grow-1">
                <h5 className="product-name mb-1">{item.productName}</h5>
                <p className="product-price mb-1 text-success">₹{item.productPrice}</p>
                <p className="product-quantity mb-0">Qty: {item.quantity}</p>
              </div>

              {/* Remove Icon */}
              <div className="remove-item" onClick={() => handleRemoveItem(item.productid)}>
                <FaTrashAlt className="text-danger" style={{ cursor: "pointer", fontSize: "1.5rem" }} />
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-muted mt-5">Your cart is empty. Start shopping!</p>
        )}
      </div>

      {/* Total and Checkout */}
      {cartItems.length > 0 && (
        <div
          className="cart-footer fixed-bottom bg-white py-3 px-3 border-top"
          style={{
            boxShadow: "0 -2px 6px rgba(0, 0, 0, 0.1)",
          }}
        >
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0 fw-bold">Total:</h5>
            <h5 className="mb-0 text-success">₹{total}</h5>
          </div>
          <button
            className="btn btn-success btn-lg w-100 fw-bold"
            style={{
              background: "linear-gradient(90deg, #43a047, #66bb6a)",
              border: "none",
            }}
          >
            Checkout
          </button>
        </div>
      )}
    </div>
    </>
  );
};

export default CartPage;
