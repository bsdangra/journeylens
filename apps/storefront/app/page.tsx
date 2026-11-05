import Link from "next/link";
import ProductCatalog from "./product-catalog";
import StoreHeader from "./store-header";

const offers = [
  { label: "Free shipping", detail: "On all orders over $100" },
  { label: "Cashback", detail: "Up to 12% on essentials" },
  { label: "Easy returns", detail: "30-day refund policy" },
];

export default function HomePage() {
  return (
    <main className="page-shell">
      <StoreHeader />

      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Fresh arrivals</p>
          <h1>Upgrade your everyday essentials.</h1>
          <p className="subtitle">
            Discover premium essentials built for comfort, style, and smarter living.
          </p>

          <div className="hero-actions">
            <Link href="#products" className="primary-btn large">Shop now</Link>
            <Link href="#offers" className="secondary-btn">View offers</Link>
          </div>

          <div className="stats-row">
            <div>
              <strong>40k+</strong>
              <span>happy shoppers</span>
            </div>
            <div>
              <strong>4.9/5</strong>
              <span>average rating</span>
            </div>
            <div>
              <strong>48h</strong>
              <span>fast delivery</span>
            </div>
          </div>
        </div>

        <div className="hero-visual">
          <div className="product-card highlight">
            <span className="product-tag">Limited edition</span>
            <div className="shoe-visual">👟</div>
            <div className="product-info">
              <span>Nova Runner Pro</span>
              <strong>$149</strong>
            </div>
          </div>
        </div>
      </section>

      <ProductCatalog />

      <section className="offers-panel" id="offers">
        {offers.map((offer) => (
          <div key={offer.label} className="offer-box">
            <strong>{offer.label}</strong>
            <span>{offer.detail}</span>
          </div>
        ))}
      </section>
    </main>
  );
}
