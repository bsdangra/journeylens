"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { clearCart, getCart, type CartItem } from "../cart-store";
import { formatPrice, getProduct } from "../products";

type CheckoutStep = "address" | "payment" | "review" | "complete";
type PaymentMethod = "wallet" | "google-pay" | "upi" | "card" | "cash-on-delivery";
type ShippingAddress = {
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  pinCode: string;
};

const ADDRESS_STORAGE_KEY = "luxecart-demo-shipping-address";
const FREE_SHIPPING_THRESHOLD = 100;
const SHIPPING_FEE = 8;

const emptyAddress: ShippingAddress = {
  fullName: "",
  phone: "",
  street: "",
  city: "",
  state: "",
  pinCode: "",
};

const paymentOptions: { value: PaymentMethod; label: string; detail: string }[] = [
  { value: "wallet", label: "Wallet", detail: "Use a demo wallet payment option" },
  { value: "google-pay", label: "Google Pay", detail: "Pay using Google Pay" },
  { value: "upi", label: "UPI", detail: "Pay with any UPI app" },
  { value: "card", label: "Credit or debit card", detail: "Visa, Mastercard, RuPay and more" },
  { value: "cash-on-delivery", label: "Cash on delivery", detail: "Pay when your order arrives" },
];

function isShippingAddress(value: unknown): value is ShippingAddress {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const address = value as Record<string, unknown>;
  return ["fullName", "phone", "street", "city", "state", "pinCode"].every(
    (field) => typeof address[field] === "string",
  );
}

function readSavedAddress(): ShippingAddress {
  const savedAddress = window.localStorage.getItem(ADDRESS_STORAGE_KEY);
  if (!savedAddress) {
    return emptyAddress;
  }

  const parsed: unknown = JSON.parse(savedAddress);
  if (!isShippingAddress(parsed)) {
    throw new Error("Saved address information is incomplete.");
  }

  return parsed;
}

export default function CheckoutPage() {
  const router = useRouter();
  const [step, setStep] = useState<CheckoutStep>("address");
  const [address, setAddress] = useState<ShippingAddress>(emptyAddress);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | "">("");
  const [items, setItems] = useState<CartItem[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      setItems(getCart());
      const savedAddress = readSavedAddress();
      setAddress(savedAddress);
      if (savedAddress.fullName && /^\d{6}$/.test(savedAddress.pinCode)) {
        setStep("payment");
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load checkout details.");
    } finally {
      setIsReady(true);
    }
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

  function submitAddress(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const submittedAddress: ShippingAddress = {
      fullName: String(formData.get("full-name") ?? "").trim(),
      phone: String(formData.get("phone") ?? "").trim(),
      street: String(formData.get("street") ?? "").trim(),
      city: String(formData.get("city") ?? "").trim(),
      state: String(formData.get("state") ?? "").trim(),
      pinCode: String(formData.get("pin-code") ?? "").trim(),
    };

    if (Object.values(submittedAddress).some((value) => value.length === 0)) {
      setError("Complete all delivery address fields to continue.");
      return;
    }
    if (!/^\d{6}$/.test(submittedAddress.pinCode)) {
      setError("Enter a valid 6-digit PIN code.");
      return;
    }
    if (!/^\d{10}$/.test(submittedAddress.phone)) {
      setError("Enter a valid 10-digit mobile number.");
      return;
    }

    try {
      window.localStorage.setItem(ADDRESS_STORAGE_KEY, JSON.stringify(submittedAddress));
      setAddress(submittedAddress);
      setError("");
      setStep("payment");
    } catch {
      setError("Could not save your delivery address. Check your browser storage and try again.");
    }
  }

  function continueToReview() {
    if (!paymentMethod) {
      setError("Select a payment method before continuing.");
      return;
    }

    setError("");
    setStep("review");
  }

  function placeOrder() {
    try {
      const currentItems = getCart();
      if (currentItems.length === 0) {
        setError("Your cart is empty. Add an item before placing an order.");
        setStep("address");
        return;
      }
      if (!address.fullName || !/^\d{6}$/.test(address.pinCode)) {
        setError("Add a valid delivery address and PIN code before placing your order.");
        setStep("address");
        return;
      }
      if (!paymentMethod) {
        setError("Select a payment method before placing your order.");
        setStep("payment");
        return;
      }
      for (const item of currentItems) {
        const product = getProduct(item.productId);
        if (!product || item.quantity > product.stock) {
          setError("An item in your cart is no longer available in the selected quantity.");
          return;
        }
      }

      clearCart();
      setItems([]);
      setError("");
      setStep("complete");
    } catch (placeOrderError) {
      setError(placeOrderError instanceof Error ? placeOrderError.message : "Could not place your demo order.");
    }
  }

  if (!isReady) {
    return <p className="cart-loading" role="status">Loading checkout…</p>;
  }

  if (step === "complete") {
    return (
      <section className="empty-cart order-confirmation" aria-labelledby="order-confirmation-title">
        <span className="empty-cart-icon" aria-hidden="true">✓</span>
        <p className="eyebrow">Order confirmed</p>
        <h1 id="order-confirmation-title">Your demo order is placed!</h1>
        <p>Thanks, {address.fullName}. Your order is set for delivery to {address.city}, {address.pinCode}.</p>
        <p>This demo checkout did not process a real payment.</p>
        <Link href="/" className="primary-btn">Continue shopping</Link>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className="empty-cart" aria-labelledby="empty-checkout-title">
        <h1 id="empty-checkout-title">Your cart is empty</h1>
        <p>Add items to your cart before continuing to checkout.</p>
        {error && <p className="cart-error" role="alert">{error}</p>}
        <Link href="/#products" className="primary-btn">Go back to shop</Link>
      </section>
    );
  }

  return (
    <div className="checkout-layout">
      <section className="checkout-main-panel" aria-labelledby="checkout-title">
        <p className="eyebrow">Secure checkout demo</p>
        <h1 id="checkout-title">Complete your order</h1>
        <ol className="checkout-steps" aria-label="Checkout progress">
          <li className={step === "address" ? "current" : "complete"}>1. Delivery</li>
          <li className={step === "payment" ? "current" : step === "review" ? "complete" : ""}>2. Payment</li>
          <li className={step === "review" ? "current" : ""}>3. Review</li>
        </ol>

        {error && <p className="cart-error" role="alert">{error}</p>}

        {step === "address" && (
          <form className="checkout-form" onSubmit={submitAddress}>
            <h2>Delivery address</h2>
            <p className="checkout-help">Enter your address and 6-digit PIN code to continue to payment.</p>
            <label htmlFor="full-name">Full name</label>
            <input id="full-name" name="full-name" autoComplete="name" required defaultValue={address.fullName} />
            <label htmlFor="phone">Mobile number</label>
            <input
              id="phone"
              name="phone"
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              pattern="[0-9]{10}"
              maxLength={10}
              title="Enter a 10-digit mobile number"
              required
              defaultValue={address.phone}
            />
            <label htmlFor="street">House number and street</label>
            <input id="street" name="street" autoComplete="street-address" required defaultValue={address.street} />
            <div className="checkout-form-row">
              <div>
                <label htmlFor="city">City</label>
                <input id="city" name="city" autoComplete="address-level2" required defaultValue={address.city} />
              </div>
              <div>
                <label htmlFor="state">State</label>
                <input id="state" name="state" autoComplete="address-level1" required defaultValue={address.state} />
              </div>
            </div>
            <label htmlFor="pin-code">PIN code</label>
            <input
              id="pin-code"
              name="pin-code"
              inputMode="numeric"
              autoComplete="postal-code"
              pattern="[0-9]{6}"
              maxLength={6}
              title="Enter a 6-digit PIN code"
              required
              defaultValue={address.pinCode}
            />
            <div className="checkout-actions">
              <Link href="/cart" className="secondary-btn">Back to cart</Link>
              <button type="submit" className="primary-btn">Continue to payment</button>
            </div>
          </form>
        )}

        {step === "payment" && (
          <section className="payment-section" aria-labelledby="payment-title">
            <div className="checkout-section-heading">
              <div>
                <h2 id="payment-title">Choose a payment method</h2>
                <p className="checkout-help">Select how you would like to pay. This demo will not charge you.</p>
              </div>
              <button type="button" className="text-button" onClick={() => setStep("address")}>Edit address</button>
            </div>
            <div className="address-summary">
              <strong>Delivering to {address.fullName}</strong>
              <span>{address.street}, {address.city}, {address.state} {address.pinCode}</span>
              <span>Mobile: {address.phone}</span>
            </div>
            <fieldset className="payment-options">
              <legend className="visually-hidden">Payment method</legend>
              {paymentOptions.map((option) => (
                <label className={`payment-option${paymentMethod === option.value ? " selected" : ""}`} key={option.value}>
                  <input
                    type="radio"
                    name="payment-method"
                    value={option.value}
                    checked={paymentMethod === option.value}
                    onChange={() => {
                      setPaymentMethod(option.value);
                      setError("");
                    }}
                  />
                  <span><strong>{option.label}</strong><small>{option.detail}</small></span>
                </label>
              ))}
            </fieldset>
            <div className="checkout-actions">
              <button type="button" className="secondary-btn" onClick={() => setStep("address")}>Back to address</button>
              <button type="button" className="primary-btn" onClick={continueToReview}>Continue</button>
            </div>
          </section>
        )}

        {step === "review" && (
          <section className="review-section" aria-labelledby="review-title">
            <div className="checkout-section-heading">
              <div>
                <h2 id="review-title">Review and confirm</h2>
                <p className="checkout-help">Check your delivery details and selected payment method.</p>
              </div>
              <button type="button" className="text-button" onClick={() => setStep("payment")}>Change payment</button>
            </div>
            <div className="address-summary">
              <strong>Delivery address</strong>
              <span>{address.fullName} · {address.phone}</span>
              <span>{address.street}, {address.city}, {address.state} {address.pinCode}</span>
              <button type="button" className="text-button" onClick={() => setStep("address")}>Edit address</button>
            </div>
            <div className="address-summary">
              <strong>Payment method</strong>
              <span>{paymentOptions.find((option) => option.value === paymentMethod)?.label}</span>
            </div>
            <ul className="checkout-review-items">
              {items.map((item) => {
                const product = getProduct(item.productId);
                if (!product) {
                  return null;
                }
                return (
                  <li key={item.productId}>
                    <span>{product.icon} {product.name} × {item.quantity}</span>
                    <strong>{formatPrice(product.price * item.quantity)}</strong>
                  </li>
                );
              })}
            </ul>
            <div className="checkout-actions">
              <button type="button" className="secondary-btn" onClick={() => setStep("payment")}>Back to payment</button>
              <button type="button" className="primary-btn" onClick={placeOrder}>Confirm and place order</button>
            </div>
          </section>
        )}
      </section>

      <aside className="checkout-panel" aria-labelledby="checkout-summary-title">
        <h2 id="checkout-summary-title">Order summary</h2>
        <div className="price-line"><span>Subtotal</span><strong>{formatPrice(totals.subtotal)}</strong></div>
        <div className="price-line discount-line"><span>Discount</span><strong>−{formatPrice(totals.savings)}</strong></div>
        <div className="price-line"><span>Shipping</span><strong>{totals.shipping === 0 ? "FREE" : formatPrice(totals.shipping)}</strong></div>
        <div className="price-total"><span>Total</span><strong>{formatPrice(totals.total)}</strong></div>
        <p className="demo-checkout-note">Demo checkout only — no real payment will be taken.</p>
      </aside>
    </div>
  );
}
