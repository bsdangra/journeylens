import { notFound } from "next/navigation";
import StoreHeader from "../../store-header";
import ProductDetails from "./product-details";
import { getProduct, products } from "../../products";

export function generateStaticParams() {
  return products.map((product) => ({ id: product.id }));
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = getProduct(id);
  if (!product) {
    notFound();
  }

  return (
    <div className="page-shell">
      <StoreHeader />
      <ProductDetails product={product} />
    </div>
  );
}
