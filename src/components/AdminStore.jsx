import React, { useState, useEffect } from "react";
import { Trash2, Plus, Package } from "lucide-react";

export default function AdminStore() {
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    stock: "",
    image: "",
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = () => {
    fetch("/api/products")
      .then((res) => res.json())
      .then(setProducts)
      .catch((err) => console.error(err));
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProduct),
      });
      if (res.ok) {
        setNewProduct({ name: "", price: "", stock: "", image: "" });
        fetchProducts();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar producto?")) return;
    try {
      await fetch(`/api/products/${id}`, { method: "DELETE" });
      fetchProducts();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div className="card mb-4">
        <h3>Agregar Producto</h3>
        <form
          onSubmit={handleAddProduct}
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr 1fr auto",
            gap: "12px",
            alignItems: "end",
          }}
        >
          <div>
            <label>Nombre</label>
            <input
              type="text"
              required
              value={newProduct.name}
              onChange={(e) =>
                setNewProduct({ ...newProduct, name: e.target.value })
              }
              style={{
                width: "100%",
                padding: "8px",
                background: "#222",
                border: "1px solid #444",
                color: "#fff",
                borderRadius: "4px",
              }}
            />
          </div>
          <div>
            <label>Precio ($)</label>
            <input
              type="number"
              required
              value={newProduct.price}
              onChange={(e) =>
                setNewProduct({ ...newProduct, price: e.target.value })
              }
              style={{
                width: "100%",
                padding: "8px",
                background: "#222",
                border: "1px solid #444",
                color: "#fff",
                borderRadius: "4px",
              }}
            />
          </div>
          <div>
            <label>Stock</label>
            <input
              type="number"
              required
              value={newProduct.stock}
              onChange={(e) =>
                setNewProduct({ ...newProduct, stock: e.target.value })
              }
              style={{
                width: "100%",
                padding: "8px",
                background: "#222",
                border: "1px solid #444",
                color: "#fff",
                borderRadius: "4px",
              }}
            />
          </div>
          <div>
            <label>Imagen URL</label>
            <input
              type="text"
              placeholder="http://..."
              value={newProduct.image}
              onChange={(e) =>
                setNewProduct({ ...newProduct, image: e.target.value })
              }
              style={{
                width: "100%",
                padding: "8px",
                background: "#222",
                border: "1px solid #444",
                color: "#fff",
                borderRadius: "4px",
              }}
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            style={{ height: "40px" }}
          >
            <Plus size={20} />
          </button>
        </form>
      </div>

      <div className="card">
        <h3>Inventario Actual</h3>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "16px",
          }}
        >
          <thead>
            <tr style={{ borderBottom: "1px solid #444", textAlign: "left" }}>
              <th style={{ padding: "8px" }}>Producto</th>
              <th style={{ padding: "8px" }}>Precio</th>
              <th style={{ padding: "8px" }}>Stock</th>
              <th style={{ padding: "8px" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr
                key={p.id}
                style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
              >
                <td
                  style={{
                    padding: "12px 8px",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      background: "#333",
                      borderRadius: "4px",
                      overflow: "hidden",
                    }}
                  >
                    {p.image ? (
                      <img
                        src={p.image}
                        alt=""
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <Package size={24} style={{ margin: "8px" }} />
                    )}
                  </div>
                  {p.name}
                </td>
                <td style={{ padding: "8px" }}>${p.price}</td>
                <td style={{ padding: "8px" }}>{p.stock}</td>
                <td style={{ padding: "8px" }}>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="btn"
                    style={{ color: "#f44336", padding: "4px" }}
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && (
          <p className="text-center text-muted mt-4">
            No hay productos cargados.
          </p>
        )}
      </div>
    </div>
  );
}
