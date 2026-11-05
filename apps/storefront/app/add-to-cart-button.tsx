"use client";

import { useEffect, useState } from "react";
import { addToCart, getCart, updateCartQuantity } from "./cart-store";
import { getProduct } from "./products";

export default function AddToCartButton({ productId }: { productId: string }) {
  const [quantity, setQuantity] = useState(0);
  const [message, setMessage] = useState("");

  useEffect(() => {
    function syncQuantity() {
      try {
        setQuantity(getCart().find((item) => item.productId === productId)?.quantity ?? 0);
        setMessage("");
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Could not read your cart.");
      }
    }

    syncQuantity();
    window.addEventListener("luxecart-cart-updated", syncQuantity);
    window.addEventListener("storage", syncQuantity);
    return () => {
      window.removeEventListener("luxecart-cart-updated", syncQuantity);
      window.removeEventListener("storage", syncQuantity);
    };
  }, [productId]);

  function handleAdd() {
    try {
      setMessage(addToCart(productId).message);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not update your cart.");
    }
  }

  function changeQuantity(nextQuantity: number) {
    try {
      updateCartQuantity(productId, nextQuantity);
      setMessage("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not update your cart.");
    }
  }

  const product = getProduct(productId);
  const isAtStockLimit = product !== undefined && quantity >= product.stock;

  return (
    <div className="add-to-cart-control">
      {quantity === 0 ? (
        <button type="button" className="add-cart-button" onClick={handleAdd}>
          Add to cart
        </button>
      ) : (
        <div className="quantity-control shop-quantity-control" aria-label={`Quantity for ${product?.name ?? "item"}`}>
          <button
            type="button"
            aria-label={`Decrease ${product?.name ?? "item"} quantity`}
            disabled={quantity <= 1}
            onClick={() => changeQuantity(quantity - 1)}
          >
            −
          </button>
          <output aria-label={`${product?.name ?? "Item"} quantity`} aria-live="polite">{quantity}</output>
          <button
            type="button"
            aria-label={`Increase ${product?.name ?? "item"} quantity`}
            disabled={isAtStockLimit}
            onClick={handleAdd}
          >
            +
          </button>
        </div>
      )}
      {message && (
        <span role="status" className={`cart-action-message${quantity === 0 ? " cart-action-feedback" : ""}`}>
          {message}
        </span>
      )}
    </div>
  );
}
