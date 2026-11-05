import StoreHeader from "../store-header";
import CheckoutPage from "./checkout-page";

export default function CheckoutRoute() {
  return (
    <main className="page-shell">
      <StoreHeader />
      <CheckoutPage />
    </main>
  );
}
