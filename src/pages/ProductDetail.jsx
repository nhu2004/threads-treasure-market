import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import productApi from "../api/productApi";
import { useCart } from "@/contexts/CartContext";
import { Star, ChevronLeft, Truck, RotateCcw, Shield } from "lucide-react";
import { motion } from "framer-motion";
import ProductCard from "@/components/ProductCard";

// format giá
const formatPrice = (price) =>
  price?.toLocaleString("vi-VN") + " đ";

const ProductDetail = () => {
  const { id } = useParams();
  const { addItem } = useCart();

  const [product, setProduct] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const res = await productApi.getAll();

        const raw =
          res?.products ||
          res?.data?.products ||
          res?.data ||
          [];

        // map dữ liệu SQL → UI
        const mapped = raw.map((p) => ({
          id: p.id ?? p.ProductID,
          name: p.name ?? p.Name,
          price: p.price ?? p.Price,
          originalPrice: p.originalPrice ?? null,
          description: p.description ?? p.Description ?? "",

          image:
            p.image ||
            (p.ImageUrl ? `/${p.ImageUrl}` : "/assets/no-image.png"),

          images:
            p.images && p.images.length > 0
              ? p.images
              : [
                  p.image ||
                    (p.ImageUrl
                      ? `/${p.ImageUrl}`
                      : "/assets/no-image.png"),
                ],

          category: p.category ?? p.CategoryID,

          colors:
            p.colors && p.colors.length > 0
              ? p.colors
              : [
                  { name: "Đen", hex: "#000000" },
                  { name: "Trắng", hex: "#ffffff" },
                ],

          sizes:
            p.sizes && p.sizes.length > 0
              ? p.sizes
              : ["S", "M", "L"],

          rating: p.rating ?? 4,
          reviews: p.reviews ?? 10,
          badge: p.badge ?? null,
        }));

        setAllProducts(mapped);

        const found = mapped.find(
          (p) => String(p.id) === String(id)
        );

        setProduct(found);
      } catch (err) {
        console.error("Lỗi API:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // sản phẩm liên quan
  const relatedProducts = product
    ? allProducts
        .filter(
          (p) =>
            p.category === product.category &&
            p.id !== product.id
        )
        .slice(0, 4)
    : [];

  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) return;
    addItem(product, selectedSize, selectedColor);
  };

  // loading
  if (loading) {
    return <div className="text-center py-20">Đang tải...</div>;
  }

  // không có sản phẩm
  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="font-body text-muted-foreground mb-4">
            Sản phẩm không tồn tại
          </p>
          <Link
            to="/shop"
            className="font-body text-sm underline text-foreground"
          >
            Quay lại cửa hàng
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-6">
        <Link
          to="/shop"
          className="inline-flex items-center gap-1 font-body text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ChevronLeft size={16} /> Quay lại
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
          {/* Images */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="aspect-[3/4] bg-secondary overflow-hidden mb-3">
              <img
                src={product.images?.[selectedImage] || product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            {product.images?.length > 1 && (
              <div className="flex gap-2">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`w-16 h-20 overflow-hidden border-2 ${
                      i === selectedImage
                        ? "border-foreground"
                        : "border-transparent"
                    }`}
                  >
                    <img
                      src={img}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col"
          >
            {product.badge && (
              <span className="inline-block w-fit bg-primary text-primary-foreground text-[10px] px-3 py-1 mb-4">
                {product.badge}
              </span>
            )}

            <h1 className="font-display text-3xl font-bold mb-2">
              {product.name}
            </h1>

            <div className="flex items-center gap-2 mb-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  className={
                    i < Math.floor(product.rating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }
                />
              ))}
              <span className="text-sm text-muted-foreground">
                ({product.reviews} đánh giá)
              </span>
            </div>

            <div className="text-2xl font-bold mb-6">
              {formatPrice(product.price)}
            </div>

            <p className="text-muted-foreground mb-8">
              {product.description}
            </p>

            {/* Colors */}
            <div className="mb-6">
              <p>
                Màu:{" "}
                {selectedColor || "Chọn màu"}
              </p>
              <div className="flex gap-2">
                {product.colors?.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => setSelectedColor(c.name)}
                    style={{ backgroundColor: c.hex }}
                    className="w-8 h-8 rounded-full border"
                  />
                ))}
              </div>
            </div>

            {/* Sizes */}
            <div className="mb-6">
              <p>
                Size:{" "}
                {selectedSize || "Chọn size"}
              </p>
              <div className="flex gap-2">
                {product.sizes?.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    className="px-3 py-1 border"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              className="w-full bg-black text-white py-3"
            >
              Thêm vào giỏ
            </button>

            <div className="grid grid-cols-3 mt-6 text-center">
              <div>
                <Truck size={18} /> Free ship
              </div>
              <div>
                <RotateCcw size={18} /> Đổi trả
              </div>
              <div>
                <Shield size={18} /> Bảo hành
              </div>
            </div>
          </motion.div>
        </div>

        {/* Related */}
        {relatedProducts.length > 0 && (
          <div className="mt-20">
            <h2 className="text-2xl font-bold mb-6">
              Sản phẩm liên quan
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((p, i) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  index={i}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;