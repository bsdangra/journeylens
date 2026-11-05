"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import AccountActions from "./account-actions";
import { getCart } from "./cart-store";

export default function StoreHeader() {
  const [cartCount, setCartCount] = useState<number | null>(0);
  const [cartError, setCartError] = useState("");

  useEffect(() => {
    function updateCount() {
      try {
        setCartCount(getCart().reduce((total, item) => total + item.quantity, 0));
        setCartError("");
      } catch (error) {
        setCartCount(null);
        setCartError(error instanceof Error ? error.message : "Cart count is unavailable.");
      }
    }

    updateCount();
    window.addEventListener("storage", updateCount);
    window.addEventListener("luxecart-cart-updated", updateCount);
    return () => {
      window.removeEventListener("storage", updateCount);
      window.removeEventListener("luxecart-cart-updated", updateCount);
    };
  }, []);

  return (
    <header className="topbar">
      <Link href="/" className="brand" aria-label="LuxeCart home">
        <span className="brand-mark" aria-hidden="true">L</span>
        <span>LuxeCart</span>
      </Link>

      <nav className="nav" aria-label="Main navigation">
        <Link href="/#products">Shop</Link>
        <Link href="/#offers">Deals</Link>
      </nav>

      <div className="nav-actions">
        <AccountActions />
        <Link href="/cart" className="primary-btn cart-nav-link" id="go-to-cart" aria-label={`Go to cart, ${cartCount ?? "unknown"} items`}>
          Cart <span className="cart-count" aria-live="polite">{cartCount ?? "—"}</span>
        </Link>
      </div>
      {cartError && <p className="header-cart-error" role="alert">{cartError}</p>}
    </header>
  );
}
