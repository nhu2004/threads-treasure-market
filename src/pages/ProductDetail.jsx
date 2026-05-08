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
        const res = await productApi.getById(id);
        
        // 1. CÁCH BÓC TÁCH DỮ LIỆU THÔNG MINH (CHỐNG LỖI)
        // Nếu API trả về { product: {...} } thì lấy res.product, nếu trả trực tiếp {...} thì lấy res
        const fetchedProduct = res?.product !== undefined ? res.product : res;

        // 2. KIỂM TRA CHẮC CHẮN CÓ DỮ LIỆU SẢN PHẨM KHÔNG
        if (fetchedProduct && (fetchedProduct.id || fetchedProduct.ProductID)) {
            setProduct(fetchedProduct);

            // Lấy sản phẩm liên quan an toàn
            if (fetchedProduct.category) {
                const relatedRes = await productApi.getAll({ search: fetchedProduct.category });
                // Phòng hờ API getAll trả về cấu trúc khác
                const productsList = relatedRes?.products || relatedRes?.data || relatedRes || [];
                const filtered = productsList
                    .filter(p => p.id !== parseInt(id))
                    .slice(0, 4);
                setRelatedProducts(filtered);
            }
        } else {
            setProduct(null); // Thực sự không có sản phẩm
        }
      } catch (error) {
        console.error("Lỗi tải chi tiết:", error);
        setProduct(null);
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
  };

  const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  if (loading) return <div className="text-center py-20 flex justify-center items-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900 mr-3"></div> Đang tải sản phẩm...</div>;
  if (!product) return <div className="text-center py-20 text-xl font-semibold text-gray-500">Sản phẩm không tồn tại hoặc đã bị xóa</div>;

  // Xử lý list ảnh
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
            <div className="aspect-[3/4] bg-gray-100 overflow-hidden mb-3 rounded-lg">
              <img src={imagesList[selectedImage] || product.image || 'https://via.placeholder.com/400x500'} alt={product.name} className="w-full h-full object-cover" />
            </div>
            {imagesList.length > 1 && (
              <div className="flex gap-2">
                {imagesList.map((img, i) => (
                  <button key={i} onClick={() => setSelectedImage(i)} className={`w-16 h-20 border-2 rounded ${i === selectedImage ? "border-black" : "border-transparent"}`}>
                    <img src={img} alt="" className="w-full h-full object-cover rounded-sm" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Info */}
          <div className="flex flex-col">
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            <p className="text-2xl font-bold text-primary mb-6">{formatPrice(product.price)}</p>
            <div className="text-muted-foreground mb-8 prose" dangerouslySetInnerHTML={{ __html: product.description }}></div>

            {/* Colors */}
            <div className="mb-6">
              <p className="font-body text-sm font-medium mb-3">
                Màu sắc: <span className="text-muted-foreground">{selectedColor || "Chọn màu"}</span>
              </p>
              <div className="flex gap-2 flex-wrap">
                {(Array.isArray(product.colors) ? product.colors : []).map((color, index) => {
                  // XỬ LÝ LỖI Ở ĐÂY: Nếu color là object {name, hex} thì lấy .name, nếu là chữ thì giữ nguyên
                  const colorName = typeof color === 'object' ? color.name : color;
                  
                  return (
                    <button
                      key={index} // Dùng index làm key cho an toàn
                      onClick={() => setSelectedColor(colorName)}
                      className={`px-4 py-2 border rounded-md text-sm transition-all ${
                        selectedColor === colorName 
                          ? "bg-black text-white border-black shadow-md" 
                          : "bg-white text-black border-gray-300 hover:border-black"
                      }`}
                    >
                      {colorName}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sizes */}
            <div className="mb-8">
              <p className="font-body text-sm font-medium mb-3">
                Kích thước: <span className="text-muted-foreground">{selectedSize || "Chọn size"}</span>
              </p>
              <div className="flex gap-2 flex-wrap">
                {(Array.isArray(product.sizes) ? product.sizes : []).map((size, index) => {
                  // Đề phòng trường hợp sizes cũng bị lưu dạng Object
                  const sizeName = typeof size === 'object' ? size.name : size;

                  return (
                    <button
                      key={index}
                      onClick={() => setSelectedSize(sizeName)}
                      className={`min-w-[44px] h-11 px-3 text-sm border rounded-md transition-all ${
                        selectedSize === sizeName 
                          ? "bg-black text-white border-black shadow-md" 
                          : "bg-white border-gray-300 hover:border-black"
                      }`}
                    >
                      {sizeName}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={!selectedSize || !selectedColor || product.stockQuantity <= 0}
              className="w-full bg-zinc-950 hover:bg-zinc-800 text-white py-4 font-bold uppercase tracking-widest disabled:opacity-40 disabled:cursor-not-allowed mb-6 rounded-md transition-colors"
            >
              {product.stockQuantity <= 0 ? "HẾT HÀNG" : "THÊM VÀO GIỎ"}
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
              {relatedProducts.map((p, i) => <ProductCard key={p.id || i} product={p} index={i} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default ProductDetail;