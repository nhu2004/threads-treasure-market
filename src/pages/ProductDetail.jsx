import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom"; 
import { useCart } from "@/contexts/CartContext";
import { ChevronLeft } from "lucide-react";
import { motion } from "framer-motion";
import ProductCard from "@/components/ProductCard";
import productApi from "../api/productApi";

const getCareInstructions = (productName) => {
  if (!productName) return [];
  const name = productName.toLowerCase();

  if (name.includes("ví") || name.includes("cặp tài liệu")) {
    return [
      "**Tránh ánh nắng trực tiếp:** Để sản phẩm ở nơi thoáng mát, tránh tiếp xúc trực tiếp với ánh nắng để không làm khô và mất màu da.",
      "**Làm sạch thường xuyên:** Lau sản phẩm bằng khăn mềm sau mỗi lần sử dụng. Nếu có vết bẩn, dùng dung dịch làm sạch nhẹ nhàng để làm sạch.",
      "**Dưỡng da định kỳ:** Sử dụng kem dưỡng hoặc dầu dưỡng da để duy trì độ mềm mại và bóng mượt, tránh khô nứt.",
      "**Bảo quản đúng cách:** Khi không sử dụng, cất sản phẩm trong túi vải thoáng khí để giữ độ thông thoáng và bảo vệ da."
    ];
  } else if (name.includes("thắt lưng")) {
    return [
      "Tránh để thắt lưng tiếp xúc trực tiếp với nước hoặc ánh nắng mạnh để duy trì độ bền và vẻ đẹp của da.",
      "Vệ sinh thắt lưng bằng khăn mềm và dung dịch làm sạch da chuyên dụng.",
      "Bảo quản thắt lưng ở nơi khô ráo, thoáng mát khi không sử dụng."
    ];
  } else if (name.includes("cà vạt")) {
    return [
      "Giặt tay hoặc giặt máy ở chế độ nhẹ với nước lạnh.",
      "Tránh sử dụng chất tẩy rửa mạnh và phơi nơi khô thoáng, tránh ánh nắng trực tiếp.",
      "Ủi ở nhiệt độ thấp để tránh làm hỏng vải."
    ];
  } else if (name.includes("ghim cài")) {
    return [
      "Lau nhẹ bằng khăn mềm, khô để loại bỏ mồ hôi, bụi bẩn.",
      "Không chồng nhiều mặt khóa kim loại lên nhau để tránh trầy xước.",
      "Nhỏ một vài giọt dung dịch lên khăn mềm, chà đều nhẹ nhàng tới khi không còn thấy được vết xước.",
      "Sử dụng khăn ẩm để lau sạch lại."
    ];
  } else {
    return [
      "Giặt máy ở chế độ nhẹ, nhiệt độ thường.",
      "Không sử dụng hóa chất tẩy có chứa Clo.",
      "Phơi vắt ngang, trong bóng mát.",
      "Sấy thùng, mức nhiệt độ trung bình.",
      "Là ở nhiệt độ trung bình 150 độ C.",
      "Giặt mặt trái sản phẩm.",
      "Giặt với sản phẩm cùng màu."
    ];
  }
};

const ProductDetail = () => {
  const { id } = useParams();
  const { addItem } = useCart();
  
  const [baseProduct, setBaseProduct] = useState(null);
  const [variants, setVariants] = useState([]);         
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [currentVariant, setCurrentVariant] = useState(null); 
  const [selectedImage, setSelectedImage] = useState(0);
  const [mainImage, setMainImage] = useState("");

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);
        const res = await productApi.getById(id);
        const fetchedProduct = res?.product !== undefined ? res.product : res;

        if (fetchedProduct && (fetchedProduct.id || fetchedProduct.ProductID)) {
            setBaseProduct(fetchedProduct);
            setMainImage(fetchedProduct.image || fetchedProduct.ImageUrl || 'https://via.placeholder.com/400x500');

            if (fetchedProduct.productGroupId) {
                const groupRes = await fetch(`http://localhost:5000/api/products/group/${fetchedProduct.productGroupId}`);
                const groupData = await groupRes.json();
                if (groupData.success) {
                    setVariants(groupData.variants);
                }
            } else {
                setVariants([fetchedProduct]);
            }

            if (fetchedProduct.color) setSelectedColor(fetchedProduct.color);
            if (fetchedProduct.size) setSelectedSize(fetchedProduct.size);

            if (fetchedProduct.category) {
                const relatedRes = await productApi.getAll({ search: fetchedProduct.category });
                const productsList = relatedRes?.products || relatedRes?.data || relatedRes || [];
                const filtered = productsList
                    .filter(p => p.productGroupId !== fetchedProduct.productGroupId) 
                    .slice(0, 4);
                setRelatedProducts(filtered);
            }
        } else {
            setBaseProduct(null);
        }
      } catch (error) {
        console.error("Lỗi tải chi tiết:", error);
        setBaseProduct(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProductData();
  }, [id]);

  useEffect(() => {
    if (variants.length > 0 && selectedColor && selectedSize) {
        const variant = variants.find(v => 
            (v.Color === selectedColor || v.color === selectedColor) &&
            (v.Size === selectedSize || v.size === selectedSize)
        );
        setCurrentVariant(variant || null);
    } else {
        setCurrentVariant(null);
    }
  }, [selectedColor, selectedSize, variants]);

  const allColors = [...new Set(variants.map(v => v.Color || v.color).filter(Boolean))];
  const allSizes = [...new Set(variants.map(v => v.Size || v.size).filter(Boolean))];

  const validColors = selectedSize
      ? [...new Set(variants.filter(v => (v.Size || v.size) === selectedSize && (v.StockQuantity || v.stockQuantity) > 0).map(v => v.Color || v.color))]
      : allColors;

  const validSizes = selectedColor
      ? [...new Set(variants.filter(v => (v.Color || v.color) === selectedColor && (v.StockQuantity || v.stockQuantity) > 0).map(v => v.Size || v.size))]
      : allSizes;

  const handleColorSelect = (color) => {
      setSelectedColor(color);
      
      // BỔ SUNG LOGIC ĐỔI HÌNH
      const variantWithColor = variants.find(v => (v.Color || v.color) === color);
      if (variantWithColor) {
          const newImg = variantWithColor.ImageUrl || variantWithColor.image || variantWithColor.imageUrl;
          if (newImg) setMainImage(newImg);
      }

      const sizesForThisColor = variants.filter(v => (v.Color || v.color) === color && (v.StockQuantity || v.stockQuantity) > 0).map(v => v.Size || v.size);
      if (selectedSize && !sizesForThisColor.includes(selectedSize)) {
          setSelectedSize("");
      }
  };

  const handleSizeSelect = (size) => {
      setSelectedSize(size);
      const colorsForThisSize = variants.filter(v => (v.Size || v.size) === size && (v.StockQuantity || v.stockQuantity) > 0).map(v => v.Color || v.color);
      if (selectedColor && !colorsForThisSize.includes(selectedColor)) {
          setSelectedColor("");
      }
  };

  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor || !currentVariant) {
        alert("Vui lòng chọn size và màu!");
        return;
    }
    const cartItem = { 
        ...baseProduct, 
        id: currentVariant.ProductID || currentVariant.id, 
        price: currentVariant.Price || currentVariant.price 
    };
    addItem(cartItem, selectedSize, selectedColor);
  };

  const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  if (loading) return <div className="text-center py-20 flex justify-center items-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900 mr-3"></div> Đang tải sản phẩm...</div>;
  if (!baseProduct) return <div className="text-center py-20 text-xl font-semibold text-gray-500">Sản phẩm không tồn tại hoặc đã bị xóa</div>;

  const imagesList = baseProduct.image ? baseProduct.image.split(',') : [];
  const displayPrice = currentVariant ? (currentVariant.Price || currentVariant.price) : baseProduct.price;
  const currentStock = currentVariant ? (currentVariant.StockQuantity || currentVariant.stockQuantity) : (baseProduct.stockQuantity || 0);

  const careInstructions = getCareInstructions(baseProduct.name);

  return (
    <div className="min-h-screen pb-16">
      {/* Giới hạn max-width để màn hình không bị quá rộng */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Link to="/shop" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ChevronLeft size={16} /> Quay lại cửa hàng  
        </Link>

        {/* Đổi tỉ lệ Grid: Hình 5 phần, Text 7 phần */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
          
          {/* CỘT TRÁI: HÌNH ẢNH */}
          <motion.div className="lg:col-span-5">
            <div className="aspect-[3/4] bg-gray-50 overflow-hidden mb-4 rounded-md relative shadow-sm border border-gray-100">
              <img src={mainImage} alt={baseProduct.name} className="w-full h-full object-cover" />
              {baseProduct.badge && (
                <span className={`absolute top-4 left-4 text-white text-xs font-bold px-3 py-1 uppercase tracking-widest rounded-sm ${baseProduct.badge === 'SALE' ? 'bg-red-600' : 'bg-black'}`}>
                  {baseProduct.badge}
                </span>
              )}
            </div>
            {/* Ảnh Thumbnail */}
            {imagesList.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {imagesList.map((img, i) => (
                  <button key={i} onClick={() => setSelectedImage(i)} className={`w-16 h-20 flex-shrink-0 border-2 rounded-md overflow-hidden transition-all ${i === selectedImage ? "border-zinc-900 opacity-100" : "border-transparent opacity-60 hover:opacity-100"}`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* CỘT PHẢI: THÔNG TIN CHI TIẾT (Có Sticky) */}
          <div className="lg:col-span-7 flex flex-col lg:sticky lg:top-24 self-start">
            <h1 className="text-2xl md:text-3xl font-bold mb-3 text-foreground leading-tight">{baseProduct.name}</h1>
            
            <div className="flex items-end mb-6 gap-3">
                <p className="text-2xl font-bold text-zinc-900">{formatPrice(displayPrice)}</p>
                {baseProduct.originalPrice && baseProduct.originalPrice > displayPrice && (
                    <span className="text-base text-muted-foreground line-through mb-0.5">
                        {formatPrice(baseProduct.originalPrice)}
                    </span>
                )}
            </div>
            
            <div className="text-muted-foreground mb-8 text-sm md:text-base prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: baseProduct.description }}></div>

            {/* CHỌN MÀU SẮC */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <p className="font-body text-sm font-medium">Màu sắc: <span className="font-normal text-muted-foreground">{selectedColor || "Chưa chọn"}</span></p>
              </div>
              <div className="flex gap-2 flex-wrap">
                {allColors.map((color, index) => {
                  const isAvailable = validColors.includes(color);
                  if (!isAvailable) return null; 
                  return (
                    <button key={`color-${index}`} onClick={() => handleColorSelect(color)} className={`px-4 py-2 border rounded-md text-sm transition-all ${selectedColor === color ? "bg-zinc-900 text-white border-zinc-900 shadow-sm" : "bg-white text-zinc-700 border-gray-300 hover:border-zinc-500"}`}> {color} </button>
                  );
                })}
              </div>
            </div>

            {/* CHỌN KÍCH CỠ */}
            <div className="mb-8">
               <div className="flex justify-between items-center mb-3">
                <p className="font-body text-sm font-medium">Kích thước: <span className="font-normal text-muted-foreground">{selectedSize || "Chưa chọn"}</span></p>
              </div>
              <div className="flex gap-2 flex-wrap">
                {allSizes.map((size, index) => {
                  const isAvailable = validSizes.includes(size);
                  if (!isAvailable) return null;
                  return (
                    <button key={`size-${index}`} onClick={() => handleSizeSelect(size)} className={`min-w-[48px] h-10 px-3 text-sm border rounded-md transition-all ${selectedSize === size ? "bg-zinc-900 text-white border-zinc-900 shadow-sm" : "bg-white text-zinc-700 border-gray-300 hover:border-zinc-500"}`}> {size} </button>
                  );
                })}
              </div>
            </div>

            {/* NÚT THÊM VÀO GIỎ */}
            <button onClick={handleAddToCart} disabled={!selectedSize || !selectedColor || currentStock <= 0} className="w-full bg-zinc-950 hover:bg-zinc-800 text-white py-3.5 font-bold text-sm uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed mb-8 rounded-md transition-all shadow-md">
              {(!selectedColor || !selectedSize) ? "VUI LÒNG CHỌN PHÂN LOẠI" : (currentStock <= 0 ? "HẾT HÀNG" : "THÊM VÀO GIỎ")}
            </button>

            {/* PHẦN HƯỚNG DẪN BẢO QUẢN */}
            <div className="pt-6 border-t border-gray-200">
              <h3 className="font-bold text-sm mb-4 uppercase text-foreground tracking-wide">Hướng dẫn bảo quản & Giặt ủi</h3>
              <ul className="list-disc pl-5 text-[13.5px] text-muted-foreground space-y-2.5 font-body leading-relaxed mb-5">
                {careInstructions.map((item, index) => {
                  if (item.includes("**")) {
                    const parts = item.split("**");
                    return ( <li key={index}> <span className="font-semibold text-zinc-800">{parts[1]}</span> {parts[2]} </li> );
                  }
                  return <li key={index}>{item}</li>;
                })}
              </ul>

              {/* LƯU Ý MÀU SẮC */}
              <div className="bg-gray-50 p-4 rounded-md border border-gray-100">
                <p className="text-[12px] text-zinc-500 leading-relaxed">
                  <span className="font-semibold text-zinc-700">Lưu ý:</span> Hình ảnh chỉ mang tính chất minh họa. Sản phẩm thực tế có thể khác về màu sắc so với hình ảnh minh họa do ánh sáng khi chụp ảnh hoặc do màn hình hiển thị trên thiết bị của khách hàng.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* SẢN PHẨM LIÊN QUAN */}
        {relatedProducts.length > 0 && (
          <div className="mt-28 border-t border-gray-200 pt-12">
            <h2 className="text-2xl font-bold mb-8 text-center text-zinc-900">Có thể bạn sẽ thích</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map((p, i) => <ProductCard key={p.id || i} product={p} index={i} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default ProductDetail;