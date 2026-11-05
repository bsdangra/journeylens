import { getProduct } from "./products";

const CART_STORAGE_KEY = "luxecart-demo-cart";

export type CartItem = {
  productId: string;
  quantity: number;
};

function isCartItem(value: unknown): value is CartItem {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const item = value as Record<string, unknown>;
  const product = typeof item.productId === "string" ? getProduct(item.productId) : undefined;
  return (
    product !== undefined &&
    typeof item.quantity === "number" &&
    Number.isInteger(item.quantity) &&
    item.quantity > 0 &&
    item.quantity <= product.stock
  );
}

export function getCart(): CartItem[] {
  const storedCart = window.localStorage.getItem(CART_STORAGE_KEY);
  if (storedCart === null) {
    return [];
  }

  const cart: unknown = JSON.parse(storedCart);
  if (
    !Array.isArray(cart) ||
    !cart.every(isCartItem) ||
    new Set(cart.map((item) => item.productId)).size !== cart.length
  ) {
    throw new Error("Saved cart data is invalid. Clear this browser's saved cart and try again.");
  }

  return cart;
}

function saveCart(cart: CartItem[]) {
  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  window.dispatchEvent(new Event("luxecart-cart-updated"));
}

export function addToCart(productId: string) {
  const product = getProduct(productId);
  if (!product) {
    throw new Error("This product is no longer available.");
  }

  const cart = getCart();
  const item = cart.find((entry) => entry.productId === productId);
  if (item) {
    if (item.quantity >= product.stock) {
      return { cart, message: `Only ${product.stock} ${product.name} are available.` };
    }

    item.quantity += 1;
  } else {
    cart.push({ productId, quantity: 1 });
  }

  saveCart(cart);
  return { cart, message: `${product.name} added to your cart.` };
}

export function updateCartQuantity(productId: string, quantity: number) {
  const product = getProduct(productId);
  if (!product || !Number.isInteger(quantity) || quantity < 1 || quantity > product.stock) {
    throw new Error("Choose a quantity that is currently available.");
  }

  const cart = getCart();
  const item = cart.find((entry) => entry.productId === productId);
  if (!item) {
    throw new Error("This item is no longer in your cart.");
  }

  item.quantity = quantity;
  saveCart(cart);
  return cart;
}

export function removeFromCart(productId: string) {
  const cart = getCart().filter((item) => item.productId !== productId);
  saveCart(cart);
  return cart;
}

export function clearCart() {
  saveCart([]);
}
