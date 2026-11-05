"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AddToCartButton from "../add-to-cart-button";
import { getCart, removeFromCart, updateCartQuantity, type CartItem } from "../cart-store";
import { formatPrice, getProduct, products } from "../products";

const FREE_SHIPPING_THRESHOLD = 100;
const SHIPPING_FEE = 8;

export default function CartPage() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    function loadCart() {
      try {
        setItems(getCart());
        setError("");
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Could not load your cart.");
      } finally {
        setIsReady(true);
      }
    }

    loadCart();
    window.addEventListener("storage", loadCart);
    window.addEventListener("luxecart-cart-updated", loadCart);
    window.addEventListener("focus", loadCart);
    return () => {
      window.removeEventListener("storage", loadCart);
      window.removeEventListener("luxecart-cart-updated", loadCart);
      window.removeEventListener("focus", loadCart);
    };
  }, []);

  const totals = useMemo(() => {
    const subtotal = items.reduce((sum, item) => {
      const product = getProduct(item.productId);
      return sum + (product?.price ?? 0) * item.quantity;
    }, 0);
    const savings = items.reduce((sum, item) => {
      const product = getProduct(item.productId);
      return sum + (product ? (product.originalPrice - product.price) * item.quantity : 0);
    }, 0);
    const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
    return { subtotal, savings, shipping, total: subtotal + shipping };
  }, [items]);

  function changeQuantity(productId: string, quantity: number) {
    try {
      setError("");
      setItems(updateCartQuantity(productId, quantity));
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Could not update the quantity.");
    }
  }

  function handleRemove(productId: string) {
    try {
      setError("");
      setItems(removeFromCart(productId));
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : "Could not remove this item.");
    }
  }

  function handleCheckout() {
    if (items.length === 0) {
      setError("Add an item to your cart before proceeding to checkout.");
      return;
    }

    try {
      for (const item of items) {
        const product = getProduct(item.productId);
        if (!product || item.quantity > product.stock) {
          setError("One or more items are no longer available in the selected quantity.");
          return;
        }
      }

      setError("");
      router.push("/checkout");
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : "Could not complete demo checkout.");
    }
  }

  if (!isReady) {
    return <p className="cart-loading" role="status">Loading your cart…</p>;
  }

  if (error && items.length === 0) {
    return (
      <section className="empty-cart" aria-labelledby="cart-error-title">
        <h1 id="cart-error-title">We couldn’t load your cart</h1>
        <p className="cart-error" role="alert">{error}</p>
        <Link href="/" className="primary-btn">Go back to shop</Link>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className="empty-cart" aria-labelledby="empty-cart-title">
        <span className="empty-cart-icon" aria-hidden="true">🛍️</span>
        <h1 id="empty-cart-title">Your cart is empty</h1>
        <p>Looks like you haven’t added anything yet. Find something you love in the shop.</p>
        <Link href="/#products" className="primary-btn">Go back to shop</Link>
        <RecommendationSection />
      </section>
    );
  }

  return (
    <div className="cart-layout">
      <section className="cart-items-panel" aria-labelledby="cart-items-title">
        <div className="cart-heading">
          <div>
            <p className="eyebrow">Your selection</p>
            <h1 id="cart-items-title">Shopping cart</h1>
          </div>
          <Link href="/#products" className="text-link">Continue shopping</Link>
        </div>

        {error && <p className="cart-error" role="alert">{error}</p>}

        <ul className="cart-item-list">
          {items.map((item) => {
            const product = getProduct(item.productId);
            if (!product) {
              return null;
            }

            return (
              <li key={item.productId} className="cart-item">
                <Link
                  href={`/products/${product.id}`}
                  className="cart-item-image"
                  style={{ background: product.accent }}
                  aria-label={`View ${product.name} details`}
                >
                  <span role="img" aria-label={product.name}>{product.icon}</span>
                </Link>
                <div className="cart-item-details">
                  <h2><Link href={`/products/${product.id}`}>{product.name}</Link></h2>
                  <p>{product.company}</p>
                  <p className="cart-stock">In stock · {product.warranty}</p>
                  <div className="cart-item-actions">
                    <div className="quantity-control" aria-label={`Quantity for ${product.name}`}>
                      <button
                        type="button"
                        aria-label={`Decrease ${product.name} quantity`}
                        disabled={item.quantity <= 1}
                        onClick={() => changeQuantity(product.id, item.quantity - 1)}
                      >
                        −
                      </button>
                      <output aria-label="Quantity">{item.quantity}</output>
                      <button
                        type="button"
                        aria-label={`Increase ${product.name} quantity`}
                        disabled={item.quantity >= product.stock}
                        onClick={() => changeQuantity(product.id, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                    <button type="button" className="remove-item" onClick={() => handleRemove(product.id)}>
                      Remove
                    </button>
                  </div>
                </div>
                <div className="cart-item-price">
                  <strong>{formatPrice(product.price * item.quantity)}</strong>
                  <del>{formatPrice(product.originalPrice * item.quantity)}</del>
                  <span>You save {formatPrice((product.originalPrice - product.price) * item.quantity)}</span>
                </div>
              </li>
            );
          })}
        </ul>

        <Link href="/#products" className="secondary-btn back-to-shop">← Go back to shop</Link>
        <RecommendationSection />
      </section>

      <aside className="checkout-panel" aria-labelledby="order-summary-title">
        <h2 id="order-summary-title">Order summary</h2>
        <div className="price-line"><span>Subtotal</span><strong>{formatPrice(totals.subtotal)}</strong></div>
        <div className="price-line discount-line"><span>Discount</span><strong>−{formatPrice(totals.savings)}</strong></div>
        <div className="price-line">
          <span>Shipping</span>
          <strong>{totals.shipping === 0 ? "FREE" : formatPrice(totals.shipping)}</strong>
        </div>
        {totals.shipping > 0 && (
          <p className="shipping-hint">
            Add {formatPrice(FREE_SHIPPING_THRESHOLD - totals.subtotal)} more for free shipping.
          </p>
        )}
        <div className="price-total"><span>Total</span><strong>{formatPrice(totals.total)}</strong></div>
        <p className="tax-note">Taxes calculated at checkout.</p>
        <button type="button" className="primary-btn checkout-button" onClick={handleCheckout}>
          Proceed to buy ({items.reduce((count, item) => count + item.quantity, 0)})
        </button>
        <p className="demo-checkout-note">Demo checkout only — no payment will be taken.</p>
      </aside>
    </div>
  );
}

function RecommendationSection() {
  return (
    <section className="cart-recommendations" aria-labelledby="recommendations-title">
      <div className="section-header">
        <div>
          <p className="eyebrow">Handpicked for you</p>
          <h2 id="recommendations-title">You may also like</h2>
        </div>
      </div>
      <div className="recommendation-grid">
        {products.slice(0, 3).map((product) => (
          <article className="recommendation-card" key={product.id}>
            <Link href={`/products/${product.id}`} className="recommendation-image" style={{ background: product.accent }}>
              <span role="img" aria-label={product.name}>{product.icon}</span>
            </Link>
            <Link href={`/products/${product.id}`} className="recommendation-name">{product.name}</Link>
            <strong>{formatPrice(product.price)}</strong>
            <AddToCartButton productId={product.id} />
          </article>
        ))}
      </div>
    </section>
  );
}
