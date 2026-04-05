import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../firebase";
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, query, where } from "firebase/firestore";
import axios from "axios";
import "./styles/AddProduct.css";
import { useNavigate } from "react-router-dom";
import VendorHeader from "./Header";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import {
  FaPlus, FaEdit, FaArrowLeft, FaTrash, FaRupeeSign, FaImage,
  FaSearch, FaBoxOpen, FaToggleOn, FaToggleOff, FaLayerGroup
} from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";

const CATEGORIES = [
  { label: "🍎 Fruits", value: "Fruits" },
  { label: "🥦 Vegetables", value: "Vegetables" },
  { label: "🌸 Flowers", value: "Flowers" },
  { label: "🛒 Grocery", value: "Grocery" },
  { label: "🥛 Dairy", value: "Dairy" },
  { label: "🍞 Bakery", value: "Bakery" },
  { label: "📦 Other", value: "Other" },
];

const CATEGORY_ICONS = {
  Fruits: "🍎", Vegetables: "🥦", Flowers: "🌸",
  Grocery: "🛒", Dairy: "🥛", Bakery: "🍞", Other: "📦",
};

const EMPTY_FORM = { name: "", price: "", category: "", quantity: "", unit: "kg" };
const UNITS = ["kg", "g", "litre", "ml", "dozen", "piece", "bundle", "box"];

const VendorProductManager = () => {
  const { currentUser, userLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [imageUrl, setImageUrl] = useState("");
  const [imageLoading, setImageLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteProductId, setDeleteProductId] = useState(null);
  const [filterCat, setFilterCat] = useState("all");

  useEffect(() => {
    if (!userLoggedIn) return;
    fetchProducts();
  }, [userLoggedIn, currentUser]);

  const fetchProducts = async () => {
    if (!currentUser) return;
    try {
      const q = query(collection(db, "products"), where("userId", "==", currentUser.uid));
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      // sort newest first
      list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setProducts(list);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products.");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Auto-fetch image when user stops typing the product name
  const handleNameBlur = () => {
    if (formData.name.trim()) fetchImage(formData.name.trim());
  };

  const fetchImage = async (name) => {
    if (!name) return;
    setImageLoading(true);
    try {
      const response = await axios.get("https://pixabay.com/api/", {
        params: {
          key: "47437496-fa510d8d68aa225396025fa55",
          q: name,
          image_type: "photo",
          per_page: 3,
        },
      });
      setImageUrl(
        response.data.hits[0]?.webformatURL ||
        "https://via.placeholder.com/300/f0faf0/56ab2f?text=Product+Image"
      );
    } catch {
      setImageUrl("https://via.placeholder.com/300/f0faf0/56ab2f?text=Product+Image");
    } finally {
      setImageLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const productData = {
        ...formData,
        price: Number(formData.price),
        quantity: Number(formData.quantity) || 0,
        image: imageUrl || "https://via.placeholder.com/300/f0faf0/56ab2f?text=Product+Image",
        userId: currentUser.uid,
        inStock: true,
        updatedAt: new Date(),
      };

      if (editingProduct) {
        await updateDoc(doc(db, "products", editingProduct.id), productData);
        toast.success("Product updated!");
      } else {
        await addDoc(collection(db, "products"), { ...productData, createdAt: new Date() });
        toast.success("Product listed!");
      }
      fetchProducts();
      closeForm();
    } catch (error) {
      console.error("Error saving product:", error.message);
      toast.error("Failed to save product.");
    } finally {
      setFormLoading(false);
    }
  };

  const toggleStock = async (product) => {
    try {
      const newStatus = !product.inStock;
      await updateDoc(doc(db, "products", product.id), { inStock: newStatus });
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, inStock: newStatus } : p))
      );
      toast.success(newStatus ? "Marked as In Stock ✅" : "Marked as Out of Stock 🚫");
    } catch {
      toast.error("Failed to update stock status.");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteDoc(doc(db, "products", deleteProductId));
      setDeleteProductId(null);
      fetchProducts();
      toast.success("Product deleted.");
    } catch (error) {
      toast.error("Failed to delete.");
    }
  };

  const openAddForm = () => {
    setEditingProduct(null);
    setFormData(EMPTY_FORM);
    setImageUrl("");
    setShowForm(true);
  };

  const openEditForm = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price,
      category: product.category,
      quantity: product.quantity || "",
      unit: product.unit || "kg",
    });
    setImageUrl(product.image);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingProduct(null);
    setFormData(EMPTY_FORM);
    setImageUrl("");
  };

  const filtered = filterCat === "all" ? products : products.filter((p) => p.category === filterCat);

  if (!userLoggedIn) {
    return (
      <div className="no-access-container">
        <FaBoxOpen size={60} color="#ccc" />
        <h2>You are not allowed to view this page.</h2>
        <button className="btn btn-success mt-3" onClick={() => navigate("/")}>Go Home</button>
      </div>
    );
  }

  return (
    <div style={{ background: "#f8f9fa", minHeight: "100vh", fontFamily: "'Poppins', sans-serif" }}>
      <VendorHeader />
      <ToastContainer position="top-center" autoClose={2000} />

      <div className="product-manager-container">
        {/* Page Header */}
        <div className="header-flex">
          <div>
            <button className="back-btn" onClick={() => navigate(-1)}>
              <FaArrowLeft />
            </button>
            <h1>Catalog Manager</h1>
            <p className="text-muted">{products.length} products · {products.filter(p => p.inStock !== false).length} in stock</p>
          </div>
        </div>

        {/* Category Filter Chips */}
        <div className="cat-filter-row">
          <button
            className={`cat-chip ${filterCat === "all" ? "cat-chip-active" : ""}`}
            onClick={() => setFilterCat("all")}
          >
            🛍 All
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c.value}
              className={`cat-chip ${filterCat === c.value ? "cat-chip-active" : ""}`}
              onClick={() => setFilterCat(c.value)}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="product-grid">
          {filtered.length === 0 ? (
            <div className="empty-state">
              <FaBoxOpen size={50} />
              <p>{filterCat === "all" ? "No products yet. Add your first item!" : `No ${filterCat} products.`}</p>
              <Button variant="success" onClick={openAddForm}>+ Add Product</Button>
            </div>
          ) : (
            filtered.map((product) => (
              <div
                className={`product-card-enhanced ${product.inStock === false ? "out-of-stock" : ""}`}
                key={product.id}
              >
                <div className="image-wrapper">
                  <img src={product.image} alt={product.name} />
                  <div className="category-badge">
                    {CATEGORY_ICONS[product.category] || "📦"} {product.category}
                  </div>
                  {/* Stock Status overlay */}
                  {product.inStock === false && (
                    <div className="oos-overlay">OUT OF STOCK</div>
                  )}
                </div>
                <div className="card-info">
                  <h3>{product.name}</h3>
                  <div className="price-tag">
                    <FaRupeeSign size={13} /> {product.price}
                    {product.quantity ? (
                      <span className="qty-chip">{product.quantity} {product.unit}</span>
                    ) : null}
                  </div>

                  {/* Stock Toggle */}
                  <button
                    className={`stock-toggle ${product.inStock === false ? "stock-out" : "stock-in"}`}
                    onClick={() => toggleStock(product)}
                    title="Toggle stock status"
                  >
                    {product.inStock === false ? (
                      <><FaToggleOff /> Out of Stock</>
                    ) : (
                      <><FaToggleOn /> In Stock</>
                    )}
                  </button>

                  <div className="card-controls">
                    <button className="edit-btn" onClick={() => openEditForm(product)}>
                      <FaEdit /> Edit
                    </button>
                    <button className="delete-btn" onClick={() => setDeleteProductId(product.id)}>
                      <FaTrash /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* FAB */}
        <button className="fab-button" onClick={openAddForm}>
          <FaPlus />
        </button>

        {/* ── Add/Edit Modal ── */}
        <Modal show={showForm} onHide={closeForm} centered scrollable>
          <Modal.Header closeButton style={{ borderBottom: "none", paddingBottom: 0 }}>
            <Modal.Title style={{ fontWeight: 700 }}>
              {editingProduct ? "✏️ Update Product" : "➕ List New Product"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <form onSubmit={handleSubmit}>

              {/* Product Name + image search trigger */}
              <div style={{ position: "relative", marginBottom: "16px" }}>
                <label className="form-label fw-semibold">Product Name</label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input
                    type="text"
                    className="form-control card-input"
                    name="name"
                    placeholder="e.g. Fresh Mangoes"
                    value={formData.name}
                    onChange={handleInputChange}
                    onBlur={handleNameBlur}
                    required
                  />
                  <button
                    type="button"
                    className="img-search-btn"
                    onClick={() => fetchImage(formData.name)}
                    title="Search image"
                    disabled={imageLoading || !formData.name}
                  >
                    <FaSearch />
                  </button>
                </div>
                <small className="text-muted">Image auto-loads when you leave the field.</small>
              </div>

              {/* Image Preview */}
              <div className="image-preview" style={{ marginBottom: "16px" }}>
                {imageLoading ? (
                  <div className="image-loader">
                    <div className="spinner-border spinner-border-sm text-success" role="status" />
                    <span>Fetching image...</span>
                  </div>
                ) : imageUrl ? (
                  <img src={imageUrl} alt="Preview" />
                ) : (
                  <div className="placeholder-image">
                    <FaImage size={28} />
                    <span>Type a name &amp; leave the field to auto-load image</span>
                  </div>
                )}
              </div>

              {/* Category Select */}
              <div style={{ marginBottom: "16px" }}>
                <label className="form-label fw-semibold">Category</label>
                <select
                  className="form-select card-input"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">— Select a category —</option>
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>

              {/* Price + Quantity row */}
              <div className="row g-2" style={{ marginBottom: "16px" }}>
                <div className="col-6">
                  <label className="form-label fw-semibold">Price (₹)</label>
                  <input
                    type="number"
                    className="form-control card-input"
                    name="price"
                    placeholder="e.g. 50"
                    value={formData.price}
                    onChange={handleInputChange}
                    min="0"
                    required
                  />
                </div>
                <div className="col-6">
                  <label className="form-label fw-semibold">Quantity</label>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <input
                      type="number"
                      className="form-control card-input"
                      name="quantity"
                      placeholder="e.g. 1"
                      value={formData.quantity}
                      onChange={handleInputChange}
                      min="0"
                    />
                    <select
                      className="form-select card-input"
                      name="unit"
                      value={formData.unit}
                      onChange={handleInputChange}
                      style={{ maxWidth: "80px" }}
                    >
                      {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-100 py-3"
                style={{ background: "linear-gradient(135deg, #a8e063, #56ab2f)", border: "none", fontWeight: 700, borderRadius: "12px" }}
                disabled={formLoading}
              >
                {formLoading ? "Saving..." : editingProduct ? "Save Changes" : "List Product"}
              </Button>
            </form>
          </Modal.Body>
        </Modal>

        {/* Delete Confirm Modal */}
        <Modal show={!!deleteProductId} onHide={() => setDeleteProductId(null)} centered>
          <Modal.Body className="text-center p-4">
            <div style={{ color: "#ff4b2b", fontSize: "3rem", marginBottom: "15px" }}><FaTrash /></div>
            <h4>Delete Product?</h4>
            <p className="text-muted">This will remove the product from your catalog permanently.</p>
            <div className="d-flex gap-2 mt-4">
              <Button variant="light" className="flex-grow-1" onClick={() => setDeleteProductId(null)}>Cancel</Button>
              <Button variant="danger" className="flex-grow-1" onClick={handleDelete}>Yes, Delete</Button>
            </div>
          </Modal.Body>
        </Modal>
      </div>
    </div>
  );
};

export default VendorProductManager;
