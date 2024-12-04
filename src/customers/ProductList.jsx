import React from "react";

const ProductList = ({ type }) => {
  const products = [
    { id: 1, name: "Fresh Apples", price: "$3/kg" },
    { id: 2, name: "Ripe Bananas", price: "$2/kg" },
    { id: 3, name: "Carrots", price: "$1.5/kg" },
  ];

  return (
    <div className="container">
      {products.map((product) => (
        <div
          key={product.id}
          className="card mb-3 p-3 shadow-lg animate__animated animate__zoomIn"
          style={{
            background: "linear-gradient(120deg, #89f7fe, #66a6ff)",
            borderRadius: "12px",
          }}
        >
          <div className="card-body text-white">
            <h5 className="card-title">{product.name}</h5>
            <p className="card-text">💵 {product.price}</p>
            <button className="btn btn-sm btn-light mt-2">Add to Cart</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductList;
