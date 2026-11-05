import StoreHeader from "../store-header";
import CartPage from "./cart-page";

export default function CartRoute() {
  return (
    <main className="page-shell">
      <StoreHeader />
      <CartPage />
    </main>
  );
}
