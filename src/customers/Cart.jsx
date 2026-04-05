import { db } from "../firebase";
import { collection, addDoc, serverTimestamp, doc, getDoc } from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { FaTrashAlt, FaShoppingBasket, FaArrowLeft, FaCheckCircle } from "react-icons/fa";
import { playCustomerSound } from "../utils/customerAudio";
import { toast, ToastContainer } from "react-toastify";
import { useState, useEffect } from "react";
import LocationPicker from "./LocationPicker";
import "./cart.css";

const CartPage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [orderLoading, setOrderLoading] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [userLatLng, setUserLatLng] = useState([12.9716, 77.5946]);

  useEffect(() => {
    const items = JSON.parse(localStorage.getItem('userCart') || '[]');
    setCartItems(items);
    calculateTotal(items);
  }, []);

  const calculateTotal = (items) => {
    const t = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    setTotal(t);
  };

  const handleRemoveItem = (id) => {
    playCustomerSound("pop");
    const updated = cartItems.filter(item => item.id !== id);
    setCartItems(updated);
    localStorage.setItem('userCart', JSON.stringify(updated));
    calculateTotal(updated);
    toast.info("Item removed from basket.");
  };

  const handlePlaceOrderClick = () => {
    if (!currentUser) return toast.info("Please login to place an order.");
    if (cartItems.length === 0) return toast.warning("Your basket is empty.");
    
    // Get current position first for the picker
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setUserLatLng([pos.coords.latitude, pos.coords.longitude]);
        setShowLocationPicker(true);
      }, () => setShowLocationPicker(true));
    } else {
      setShowLocationPicker(true);
    }
  };

  const handleConfirmLocation = async ({ position, address }) => {
    setShowLocationPicker(false);
    setOrderLoading(true);
    playCustomerSound("pop");

    try {
      const vendorId = cartItems[0].vendorId;

      // 1. Check if Vendor is Online
      const vendorRef = doc(db, "vendors", vendorId);
      const vendorSnap = await getDoc(vendorRef);

      if (vendorSnap.exists()) {
        const vendorData = vendorSnap.data();
        if (!vendorData.isOnline) {
          toast.error("Oops! The vendor just went offline. Please try another vendor.");
          setOrderLoading(false);
          return;
        }
      }

      // 2. Place order with type 'delivery' and confirmed location
      await addDoc(collection(db, "visitRequests"), {
        vendorId: vendorId,
        customerId: currentUser.uid,
        customerName: currentUser.displayName || "Customer",
        customerPhone: currentUser.phoneNumber || "No Phone",
        items: cartItems,
        total: total,
        timeRequested: serverTimestamp(),
        accepted: false,
        declined: false,
        visited: false,
        type: "delivery", // Standardized to delivery
        address: address, // High-fidelity resolved address
        location: { latitude: position[0], longitude: position[1] } // GPS Coordinates
      });

      playCustomerSound("success");
      localStorage.removeItem('userCart');
      setCartItems([]);
      setTotal(0);

      toast.success("Order placed successfully! 🎊");
      setTimeout(() => navigate('/user/track'), 2000);
    } catch (e) {
      toast.error("Failed to place order. Try again.");
    } finally {
      setOrderLoading(false);
    }
  };

  return (
    <div className="cart-page-wrapper">
      <ToastContainer position="top-center" autoClose={2000} />

      <div className="cart-header-premium">
        <button className="back-btn-simple" onClick={() => navigate(-1)}>
          <FaArrowLeft />
        </button>
        <h1>My Basket</h1>
        <div className="item-count-badge">{cartItems.length} Items</div>
      </div>

      <div className="container p-3">
        {cartItems.length > 0 ? (
          <div className="cart-list mt-3">
            {cartItems.map((item, index) => (
              <div className="cart-item-card" key={index}>
                <img src={item.imageUrl || item.image || "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=200"} alt={item.productName} className="cart-item-img" />
                <div className="cart-item-info">
                  <h4>{item.productName}</h4>
                  <p className="cart-item-price">₹{item.price} <small>/ {item.unit}</small></p>
                  <p className="cart-item-qty">Quantity: {item.quantity}</p>
                </div>
                <button className="btn-remove" onClick={() => handleRemoveItem(item.id)}>
                  <FaTrashAlt />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-cart text-center mt-5">
            <FaShoppingBasket size={80} color="#eee" />
            <h3 className="mt-4">Your basket is empty</h3>
            <p className="text-muted">Treat yourself to some fresh products!</p>
            <button className="btn btn-success rounded-pill px-4 mt-3" onClick={() => navigate('/user/dashboard')}>
              Browse Markets
            </button>
          </div>
        )}
      </div>

      {cartItems.length > 0 && (
        <div className="cart-checkout-footer shadow-lg">
          <div className="checkout-summary">
            <div className="total-row">
              <span>Subtotal</span>
              <span>₹{total}</span>
            </div>
            <div className="total-row main">
              <span>Grand Total</span>
              <span>₹{total}</span>
            </div>
          </div>
          <button
            className="btn-place-order"
            onClick={handlePlaceOrderClick}
            disabled={orderLoading}
          >
            {orderLoading ? "Processing..." : "Place Order Now"}
          </button>
        </div>
      )}

      {showLocationPicker && (
        <LocationPicker 
          initialPosition={userLatLng}
          onConfirm={handleConfirmLocation}
          onCancel={() => setShowLocationPicker(false)}
        />
      )}
    </div>
  );
};

export default CartPage;
