"use client";

import Link from "next/link";
import { useState } from "react";
import AddToCartButton from "../../add-to-cart-button";
import { formatPrice, type Product } from "../../products";

export default function ProductDetails({ product }: { product: Product }) {
  const [selectedImage, setSelectedImage] = useState(0);
  const image = product.images[selectedImage];

  return (
    <main className="product-detail-page">
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <Link href="/">Shop</Link><span aria-hidden="true">/</span><span>{product.name}</span>
      </nav>

      <div className="product-detail-layout">
        <section className="product-gallery" aria-label={`${product.name} images`}>
          <div className="product-main-image" style={{ background: image.background }} role="img" aria-label={image.label}>
            <span aria-hidden="true">{image.icon}</span>
            <span className="image-caption">{image.label}</span>
          </div>
          <div className="product-thumbnails" aria-label="Choose product image">
            {product.images.map((item, index) => (
              <button
                type="button"
                key={item.label}
                className={`product-thumbnail${selectedImage === index ? " selected" : ""}`}
                style={{ background: item.background }}
                aria-label={`Show ${item.label}`}
                aria-pressed={selectedImage === index}
                onClick={() => setSelectedImage(index)}
              >
                <span aria-hidden="true">{item.icon}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="product-description" aria-labelledby="product-name">
          <span className="mini-tag">{product.tag}</span>
          <h1 id="product-name">{product.name}</h1>
          <p className="product-company">Sold by {product.company}</p>
          <p className="product-detail-copy">{product.description}</p>
          <div className="detail-price">
            <strong>{formatPrice(product.price)}</strong>
            <del>{formatPrice(product.originalPrice)}</del>
            <span>Save {formatPrice(product.originalPrice - product.price)}</span>
          </div>
          <p className="detail-stock">{product.stock} in stock · Free shipping on orders over $100</p>
          <div className="product-detail-actions">
            <AddToCartButton productId={product.id} />
            <Link href="/cart" className="secondary-btn">Go to cart</Link>
          </div>

          <section className="about-product" aria-labelledby="about-product-title">
            <h2 id="about-product-title">About this item</h2>
            <ul>{product.about.map((feature) => <li key={feature}>{feature}</li>)}</ul>
          </section>

          <dl className="product-specifications">
            <div><dt>Validity / returns</dt><dd>{product.validity}</dd></div>
            <div><dt>Warranty</dt><dd>{product.warranty}</dd></div>
            <div><dt>Manufacture date</dt><dd>{product.manufactureDate}</dd></div>
            <div><dt>Company</dt><dd>{product.company}</dd></div>
          </dl>
        </section>
      </div>
      <Link href="/#products" className="secondary-btn back-to-shop">← Go back to shop</Link>
    </main>
  );
}
