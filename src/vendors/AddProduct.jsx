import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../firebase"; // Firebase configuration
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, query, where } from "firebase/firestore";
import axios from "axios";
import "./AddProduct.css";
import { useNavigate } from "react-router-dom";

const VendorProductManager = () => {
  const { currentUser, userLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "",
  });
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteProductId, setDeleteProductId] = useState(null);

  useEffect(() => {
    if (!userLoggedIn) return; // Do not fetch products if user is not logged in
    fetchProducts();
  }, [userLoggedIn, currentUser]);

  const fetchProducts = async () => {
    if (!currentUser) return;

    const productsCollection = collection(db, "products");
    const q = query(productsCollection, where("userId", "==", currentUser.uid));
    const snapshot = await getDocs(q);
    const productList = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setProducts(productList);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const fetchImage = async (name) => {
    if (!name) return;
    setLoading(true);
    try {
      const response = await axios.get(
        `https://api.unsplash.com/photos/random?query=${name}&client_id=ykJeBo_uA8d84B5Ty3e4gx15h6kwt4WiAwm5AqLHi_A`
      );
      setImageUrl(response.data.urls?.regular || "");
    } catch (error) {
      setImageUrl("https://via.placeholder.com/150/CCCCCC/000000?text=No+Image");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const productsCollection = collection(db, "products");

      if (editingProduct) {
        await updateDoc(doc(db, "products", editingProduct.id), {
          ...formData,
          image: imageUrl,
          userId: currentUser.uid,
          createdAt: new Date(),
        });
      } else {
        await addDoc(productsCollection, {
          ...formData,
          image: imageUrl,
          userId: currentUser.uid,
          createdAt: new Date(),
        });
      }
      fetchProducts();
      setShowForm(false);
      setFormData({ name: "", price: "", category: "" });
      setImageUrl("");
      setEditingProduct(null);
    } catch (error) {
      console.error("Error adding or editing product: ", error.message);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteDoc(doc(db, "products", deleteProductId));
      setDeleteProductId(null);
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product: ", error.message);
    }
  };

  const openEditForm = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price,
      category: product.category,
    });
    setImageUrl(product.image);
    setShowForm(true);
  };

  if (!userLoggedIn) {
    return (
      <div className="not-allowed-container">
        <h2>You are not allowed to view this page.</h2>
        <button className="btn btn-primary" onClick={() => navigate("/")}>
          Go Home
        </button>
      </div>
    );
  }

  return (
    <div className="product-manager-container">
      <h1 className="text-center mb-4" style={{ color: "#32cd32" }}>
        Manage Your Products
      </h1>

      {showForm && (
        <div className="form-popup">
          <div className="form-card">
            <button onClick={() => setShowForm(false)} className="close-btn">
              <i className="fas fa-times"></i>
            </button>
            <form className="product-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  onBlur={() => fetchImage(formData.name)}
                  className="form-control"
                  placeholder="Product Name"
                  required
                />
              </div>
              <div className="form-group">
                <input
                  type="text"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder="Price (₹)"
                  required
                />
              </div>
              <div className="form-group">
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder="Category"
                  required
                />
              </div>
              <button
                type="submit"
                className="btn btn-success w-100 mt-3"
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Product"}
              </button>
            </form>
          </div>
        </div>
      )}

      {deleteProductId && (
        <div className="delete-dialog">
          <div className="dialog-card">
            <p>Are you sure you want to delete this product?</p>
            <button className="btn btn-danger" onClick={handleDelete}>
              Yes, Delete
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => setDeleteProductId(null)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="product-list">
        {products.length === 0 ? (
          <p className="text-center text-muted">No products available.</p>
        ) : (
          products.map((product) => (
            <div className="product-card" key={product.id}>
              <div className="product-image">
                <img
                  src={product.image}
                  alt={product.name}
                  className="img-fluid rounded"
                />
              </div>
              <div className="product-details">
                <h5>{product.name}</h5>
                <p>₹{product.price}</p>
                <p className="text-muted">{product.category}</p>
                <div className="product-actions">
                  <button
                    className="btn btn-warning"
                    onClick={() => openEditForm(product)}
                  >
                    <i className="fas fa-edit"></i> Edit
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => setDeleteProductId(product.id)}
                  >
                    <i className="fas fa-trash-alt"></i> Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <button
        className="btn btn-floating"
        onClick={() => setShowForm(true)}
      >
        <i className="fas fa-plus"></i>
      </button>
    </div>
  );
};

export default VendorProductManager;
