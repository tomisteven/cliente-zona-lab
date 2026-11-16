export function getProductImages(product) {
  const images = Array.isArray(product?.images) ? product.images.filter(Boolean) : [];

  if (images.length > 0) {
    return [...new Set(images)];
  }

  return product?.imageUrl ? [product.imageUrl] : [];
}
