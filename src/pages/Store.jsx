import React, { useEffect, useState } from "react";
import { ShoppingBag, ShoppingCart } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Store() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = () => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => console.error(err));
  };

  const handleBuy = async (productId) => {
    if (!user) return alert("Debes iniciar sesión");
    if (!window.confirm("¿Confirmar compra? (Se cargará a tu cuenta)")) return;

    try {
      const res = await fetch("/api/store/buy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, productId }),
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        fetchProducts(); // Refresh stock
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading)
    return <div className="container section">Cargando tienda...</div>;

  return (
    <div className="container section animate-fade-in">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          marginBottom: "32px",
        }}
      >
        <ShoppingBag size={32} className="text-primary" />
        <h1>Tienda TrainX</h1>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "24px",
          maxWidth: "800px",
          margin: "0 auto",
        }}
      >
        {products.map((p) => (
          <div
            key={p.id}
            className="card"
            style={{
              padding: "0",
              overflow: "hidden",
              display: "flex",
              flexDirection: "row",
              height: "180px",
            }}
          >
            <div
              style={{
                width: "180px",
                height: "100%",
                background: "var(--color-surface-hover)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {p.image.startsWith("http") ? (
                <img
                  src={p.image}
                  alt={p.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <ShoppingBag size={48} className="text-muted" />
              )}
            </div>
            <div
              style={{
                padding: "16px",
                flex: 1,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "start",
                  marginBottom: "8px",
                }}
              >
                <h3 style={{ fontSize: "1.2rem", margin: 0 }}>{p.name}</h3>
                <span
                  style={{
                    fontWeight: "bold",
                    color: "var(--color-primary)",
                    fontSize: "1.1rem",
                  }}
                >
                  ${p.price}
                </span>
              </div>
              <p className="text-muted" style={{ fontSize: "0.9rem" }}>
                Stock: {p.stock} u.
              </p>

              <div style={{ marginTop: "auto" }}>
                {p.stock > 0 ? (
                  <button
                    onClick={() => handleBuy(p.id)}
                    className="btn btn-primary"
                    style={{ width: "100%", justifyContent: "center" }}
                  >
                    <ShoppingCart size={18} style={{ marginRight: "8px" }} />{" "}
                    Comprar
                  </button>
                ) : (
                  <button
                    disabled
                    className="btn"
                    style={{
                      width: "100%",
                      background: "var(--color-surface-hover)",
                      color: "var(--color-text-muted)",
                      cursor: "not-allowed",
                    }}
                  >
                    Sin Stock
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
