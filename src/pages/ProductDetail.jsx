import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom"; 
import { useCart } from "@/contexts/CartContext";
import { Star, ChevronLeft, Truck, RotateCcw, Shield } from "lucide-react";
import { motion } from "framer-motion";
import ProductCard from "@/components/ProductCard";
import productApi from "../api/productApi";

const ProductDetail = () => {
  const { id } = useParams();
  const { addItem } = useCart();
  
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedImage, setSelectedImage] = useState(0);

  // GỌI API THẬT
  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);
        // Lấy chi tiết sản phẩm
        const res = await productApi.getById(id);
        const fetchedProduct = res.product;
        setProduct(fetchedProduct);

        // Lấy sản phẩm liên quan (Tìm theo từ khóa danh mục)
        if (fetchedProduct?.category) {
            const relatedRes = await productApi.getAll({ search: fetchedProduct.category });
            const filtered = (relatedRes.products || []).filter(p => p.id !== parseInt(id)).slice(0, 4);
            setRelatedProducts(filtered);
        }
      } catch (error) {
        console.error("Lỗi tải chi tiết:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProductData();
  }, [id]);

  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor || !product) {
        alert("Vui lòng chọn size và màu!");
        return;
    }
    addItem(product, selectedSize, selectedColor);
    // Lưu ý: CartProvider của bạn đã có lệnh setIsCartOpen(true) nên nó sẽ tự bật Drawer lên!
  };

  const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  if (loading) return <div className="text-center py-20">Đang tải sản phẩm...</div>;
  if (!product) return <div className="text-center py-20">Sản phẩm không tồn tại</div>;

  // Xử lý list ảnh (nếu ImageUrl chứa nhiều link cách nhau bằng phẩy)
  const imagesList = product.image ? product.image.split(',') : [];

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-6">
        <Link to="/shop" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-8">
          <ChevronLeft size={16} /> Quay lại cửa hàng  
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Images */}
          <motion.div>
            <div className="aspect-[3/4] bg-gray-100 overflow-hidden mb-3">
              <img src={imagesList[selectedImage] || product.image} alt={product.name} className="w-full h-full object-cover" />
            </div>
            {imagesList.length > 1 && (
              <div className="flex gap-2">
                {imagesList.map((img, i) => (
                  <button key={i} onClick={() => setSelectedImage(i)} className={`w-16 h-20 border-2 ${i === selectedImage ? "border-black" : "border-transparent"}`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Info */}
          <div className="flex flex-col">
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            <p className="text-2xl font-bold text-primary mb-6">{formatPrice(product.price)}</p>
            <p className="text-muted-foreground mb-8">{product.description}</p>

            {/* Colors */}
            <div className="mb-6">
              <p className="font-body text-sm font-medium mb-3">
                Màu sắc: <span className="text-muted-foreground">{selectedColor || "Chọn màu"}</span>
              </p>
              <div className="flex gap-2">
                {(product.colors || []).map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color.name)}
                    className={`w-8 h-8 rounded-full border-2 ${selectedColor === color.name ? "border-black scale-110" : "border-gray-200"}`}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            {/* Sizes */}
            <div className="mb-8">
              <p className="font-body text-sm font-medium mb-3">
                Kích thước: <span className="text-muted-foreground">{selectedSize || "Chọn size"}</span>
              </p>
              <div className="flex gap-2 flex-wrap">
                {(product.sizes || []).map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`min-w-[44px] h-11 px-3 text-sm border ${selectedSize === size ? "bg-black text-white border-black" : "bg-white border-gray-300"}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={!selectedSize || !selectedColor}
              className="w-full bg-zinc-950 text-white py-4 font-bold uppercase tracking-widest disabled:opacity-40 mb-6"
            >
              Thêm vào giỏ
            </button>

            <div className="grid grid-cols-3 gap-4 pt-6 border-t">
              {[
                { icon: Truck, text: "Miễn phí ship" },
                { icon: RotateCcw, text: "Đổi trả 30 ngày" },
                { icon: Shield, text: "Bảo hành chính hãng" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="text-center">
                  <Icon size={18} className="mx-auto text-muted-foreground mb-1" />
                  <p className="text-[10px] text-muted-foreground">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <div className="mt-24 mb-12">
            <h2 className="text-2xl font-bold mb-8">Sản phẩm liên quan</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default ProductDetail;