import React, { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, limit } from "firebase/firestore";
import { db } from "../firebase";
import { FaPlus, FaMinus, FaShoppingCart } from "react-icons/fa";
import { playCustomerSound } from "../utils/customerAudio";
import { toast } from "react-toastify";

const ProductList = ({ type = "all", selectedCategory = "All" }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    // 1. Initial cart load
    const stored = JSON.parse(localStorage.getItem('userCart') || '[]');
    setCartItems(stored);

    // 2. Setup product listener
    let q = query(
      collection(db, "products"),
      where("inStock", "==", true),
      limit(20)
    );

    const unsub = onSnapshot(q, (snap) => {
      let filtered = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      if (selectedCategory !== "All") {
        filtered = filtered.filter(p => p.category?.toLowerCase() === selectedCategory.toLowerCase());
      }
      setProducts(filtered);
      setLoading(false);
    });

    return () => unsub();
  }, [selectedCategory]);

  const updateCart = (product, delta) => {
    let current = JSON.parse(localStorage.getItem('userCart') || '[]');
    const existingIndex = current.findIndex(item => item.id === product.id);

    if (existingIndex > -1) {
      current[existingIndex].quantity += delta;
      if (current[existingIndex].quantity <= 0) {
        current.splice(existingIndex, 1);
        playCustomerSound("pop");
      } else {
        playCustomerSound("chime");
      }
    } else if (delta > 0) {
      current.push({ ...product, quantity: 1, vendorId: product.userId || product.vendorId });
      playCustomerSound("chime");
    }

    localStorage.setItem('userCart', JSON.stringify(current));
    setCartItems(current);
  };

  const getProductCount = (id) => {
    const item = cartItems.find(it => it.id === id);
    return item ? item.quantity : 0;
  };

  if (loading) {
    return <div className="p-4 text-center text-muted">Loading fresh products...</div>;
  }

  if (products.length === 0) {
    return (
      <div className="p-4 text-center text-muted">
        <p>No products found in this category.</p>
      </div>
    );
  }

  return (
    <div className="product-grid">
      {products.map((product) => (
        <div key={product.id} className="product-premium-row">
          <img 
            src={product.imageUrl || product.image || "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=200"} 
            className="prod-img"
            alt={product.productName}
          />
          <div className="prod-info">
            <h4 className="prod-name">{product.productName || product.name}</h4>
            <div style={{ display: 'flex', alignItems: 'baseline' }}>
              <span className="prod-price">₹{product.price}</span>
              <span className="prod-unit">/ {product.unit || "kg"}</span>
            </div>
            <div style={{ fontSize: '0.7rem', color: '#999', marginTop: '4px' }}>
              From {product.vendorName || "Active Vendor"}
            </div>
          </div>
          <div className="prod-action">
            {getProductCount(product.id) > 0 ? (
              <div className="qty-selector-pill">
                <button className="qty-btn" onClick={() => updateCart(product, -1)}><FaMinus size={10} /></button>
                <span className="qty-num">{getProductCount(product.id)}</span>
                <button className="qty-btn" onClick={() => updateCart(product, 1)}><FaPlus size={10} /></button>
              </div>
            ) : (
              <button className="btn-add-cart" onClick={() => updateCart(product, 1)}>
                <FaPlus size={14} />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductList;
