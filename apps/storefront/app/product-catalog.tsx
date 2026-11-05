"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import AddToCartButton from "./add-to-cart-button";
import { formatPrice, products } from "./products";

const categoryStyles: Record<string, { icon: string; color: string }> = {
  Footwear: { icon: "👟", color: "#fdf2e9" },
  Audio: { icon: "🎧", color: "#eef5ff" },
  Watches: { icon: "⌚", color: "#f5f0ff" },
  Home: { icon: "🏠", color: "#eefbf4" },
  Clothing: { icon: "🧥", color: "#e0f2fe" },
  Bags: { icon: "🎒", color: "#fce7f3" },
  Kitchen: { icon: "🍳", color: "#ffedd5" },
  Wellness: { icon: "🧘", color: "#ede9fe" },
  Accessories: { icon: "🕶️", color: "#fef9c3" },
};

export default function ProductCatalog() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    for (const product of products) {
      counts.set(product.category, (counts.get(product.category) ?? 0) + 1);
    }

    return Array.from(counts, ([name, count]) => ({
      name,
      count,
      ...categoryStyles[name],
    }));
  }, []);

  const filteredProducts = selectedCategory
    ? products.filter((product) => product.category === selectedCategory)
    : products;

  return (
    <>
      <section className="section" aria-labelledby="categories-title">
        <div className="section-header">
          <div>
            <p className="eyebrow">Shop by category</p>
            <h2 id="categories-title">Popular picks</h2>
          </div>
        </div>

        <div className="category-grid" aria-label="Filter products by category">
          <button
            type="button"
            className={`category-card all-category-card${selectedCategory === null ? " selected" : ""}`}
            aria-pressed={selectedCategory === null}
            onClick={() => setSelectedCategory(null)}
          >
            <span className="category-icon" aria-hidden="true">✨</span>
            <span>All products</span>
            <span className="category-count">{products.length} items</span>
          </button>
          {categories.map((category) => (
            <button
              type="button"
              key={category.name}
              className={`category-card${selectedCategory === category.name ? " selected" : ""}`}
              style={{ background: category.color }}
              aria-pressed={selectedCategory === category.name}
              onClick={() => setSelectedCategory(category.name)}
            >
              <span className="category-icon" aria-hidden="true">{category.icon}</span>
              <span>{category.name}</span>
              <span className="category-count">{category.count} {category.count === 1 ? "item" : "items"}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="section" aria-labelledby="products-title">
        <div className="section-header">
          <div>
            <p className="eyebrow">{selectedCategory ? "Category results" : "Featured"}</p>
            <h2 id="products-title">{selectedCategory ?? "Trending products"}</h2>
          </div>
          <p className="catalog-result-count" aria-live="polite">
            {filteredProducts.length} {filteredProducts.length === 1 ? "product" : "products"}
          </p>
        </div>

        {filteredProducts.length > 0 ? (
          <div className="product-grid" id="products">
            {filteredProducts.map((product) => (
              <article key={product.id} className="product-item">
                <Link
                  href={`/products/${product.id}`}
                  className="product-details-link"
                  aria-label={`View ${product.name} details`}
                >
                  <div className="product-image" style={{ background: product.accent }} role="img" aria-label={product.name}>
                    {product.icon}
                  </div>
                </Link>
                <div className="product-meta">
                  <span className="mini-tag">{product.tag}</span>
                  <h3><Link href={`/products/${product.id}`}>{product.name}</Link></h3>
                  <div className="product-row">
                    <div className="product-price">
                      <strong>{formatPrice(product.price)}</strong>
                      <del>{formatPrice(product.originalPrice)}</del>
                    </div>
                    <AddToCartButton productId={product.id} />
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="catalog-empty" role="status">No products found in this category.</p>
        )}
      </section>
    </>
  );
}
