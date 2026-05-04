import { useState } from "react";
import { useParams, Link } from "react-router-dom"; 
import { useCart } from "@/contexts/CartContext";
import { Star, ChevronLeft, Truck, RotateCcw, Shield } from "lucide-react";
import { motion } from "framer-motion";
import ProductCard from "@/components/ProductCard";

const ProductDetail = () => {
  const { id } = useParams();
  const product = products.find((p) => p.id === id);
  const { addItem } = useCart();
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedImage, setSelectedImage] = useState(0);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="font-body text-muted-foreground mb-4">Sản phẩm không tồn tại</p>
          <Link to="/shop" className="font-body text-sm underline text-foreground">
            Quay lại cửa hàng
          </Link>
        </div>
      </div>
    );
  }

  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) return;
    addItem(product, selectedSize, selectedColor);
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-6">
        <Link to="/shop" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-8">
          <ChevronLeft size={16} /> Quay lại cửa hàng  
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Images */}
          <motion.div>
            <div className="aspect-[3/4] bg-secondary overflow-hidden mb-3">
              <img src={product.images?.[selectedImage] || product.image} alt={product.name} className="w-full h-full object-cover" />
            </div>
            {/* Hiển thị danh sách ảnh nhỏ từ DB */}
            <div className="flex gap-2">
              {product.images?.map((img, i) => (
                <button key={i} onClick={() => setSelectedImage(i)} className={`w-16 h-20 border-2 ${i === selectedImage ? "border-black" : "border-transparent"}`}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </motion.div>

          {/* Info */}
          <div className="flex flex-col">
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            <p className="text-2xl font-bold text-primary mb-6">{formatPrice(product.price)}</p>
            <p className="text-muted-foreground mb-8">{product.description}</p>

            {/* Sizes & Colors lấy từ API */}
            <div className="mb-6">
              <p className="text-sm font-medium mb-3">Kích thước:</p>
              <div className="flex gap-2">
                {product.sizes?.map(size => (
                  <button key={size} onClick={() => setSelectedSize(size)} className={`px-4 py-2 border ${selectedSize === size ? "bg-black text-white" : ""}`}>
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={handleAddToCart} className="w-full bg-primary text-white py-4 font-bold uppercase tracking-widest">
              Thêm vào giỏ hàng
            </button>
          </div>
            {/* Colors */}
            <div className="mb-6">
              <p className="font-body text-sm font-medium text-foreground mb-3">
                Màu sắc: <span className="text-muted-foreground font-normal">{selectedColor || "Chọn màu"}</span>
              </p>
              <div className="flex gap-2">
                {product.colors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color.name)}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      selectedColor === color.name ? "border-foreground scale-110" : "border-border"
                    }`}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            {/* Sizes */}
            <div className="mb-8">
              <p className="font-body text-sm font-medium text-foreground mb-3">
                Kích thước: <span className="text-muted-foreground font-normal">{selectedSize || "Chọn size"}</span>
              </p>
              <div className="flex gap-2 flex-wrap">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`min-w-[44px] h-11 px-3 font-body text-sm border transition-colors ${
                      selectedSize === size
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-foreground border-border hover:border-foreground"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Add to cart */}
            <button
              onClick={handleAddToCart}
              disabled={!selectedSize || !selectedColor}
              className="w-full bg-primary text-primary-foreground py-4 font-body text-sm font-semibold uppercase tracking-widest hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed mb-6"
            >
              Thêm vào giỏ
            </button>

            {/* Benefits */}
            <motion.div>
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border">
              {[
                { icon: Truck, text: "Miễn phí ship" },
                { icon: RotateCcw, text: "Đổi trả 30 ngày" },
                { icon: Shield, text: "Bảo hành chính hãng" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="text-center">
                  <Icon size={18} className="mx-auto text-muted-foreground mb-1" />
                  <p className="font-body text-[10px] text-muted-foreground">{text}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Related */}
        {relatedProducts.length > 0 && (
          <div className="mt-24 mb-12">
            <h2 className="font-display text-2xl font-bold text-foreground mb-8">Sản phẩm liên quan</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
