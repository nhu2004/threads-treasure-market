import { useState, useEffect } from "react";
import productApi from "../api/productApi"; // Gọi API từ Backend
import ProductCard from "@/components/ProductCard";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";  

// XÓA DÒNG NÀY (Vì 'products' không còn tồn tại)[cite: 13]
// const featuredProducts = products.slice(0, 4); 

const Index = () => {
  // 1. Khởi tạo state để lưu sản phẩm nổi bật
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // 2. Sử dụng useEffect để gọi API khi trang Index load
  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true);
        // Gọi API
        const res = await productApi.getAll({ featured: true, limit: 4 }); 
        
        // SỬA TẠI ĐÂY: Trích xuất mảng từ thuộc tính `products` thay vì `data`
        const productsArray = res.products || []; 
        
        // Giới hạn 4 sản phẩm để hiển thị
        setFeaturedProducts(productsArray.slice(0, 4));
      } catch (error) {
        console.error("Lỗi khi lấy sản phẩm nổi bật:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeaturedProducts();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative h-[85vh] overflow-hidden">
        <img
          src={"/assets/BR_fasshion.jpg"}
          alt="Fashion collection"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/60 via-foreground/30 to-transparent" />
        <div className="relative container mx-auto px-4 h-full flex items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-lg"
          >
            <p className="font-body text-xs tracking-[0.3em] uppercase text-primary-foreground/80 mb-4">
              Bộ sưu tập nam mới 2026
            </p>
            <h1 className="font-display text-5xl md:text-7xl font-bold text-primary-foreground leading-[1.1] mb-6">
              Phong Cách
              <br />
              <span className="italic">Đương Đại</span>
            </h1>
            <p className="font-body text-sm text-primary-foreground/80 mb-8 max-w-sm leading-relaxed">
              Khám phá bộ sưu tập mới nhất với thiết kế tinh tế, chất liệu cao cấp dành riêng cho phái nam.
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-3 bg-primary-foreground text-primary px-8 py-4 font-body text-sm font-semibold uppercase tracking-widest hover:opacity-90 transition-opacity"
            >
              Khám phá ngay
              <ArrowRight size={16} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">Danh mục nổi bật</h2>
        </motion.div>
        <div className="grid grid-cols-3 md:grid-cols-3 gap-3">
          {[
          
            { name: "Áo Sơ Mi", category: "ao", img: "../../public/assets/ao_bia.jpg" },
            { name: "Quần Tây ", category: "quan", img: "../../public/assets/quan_bia.jpg" },
            { name: "Phụ kiện", category: "phu-kien", img: "../../public/assets/phukien_bia.jpg" },
          ].map((cat, i) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Link to={`/shop?category=${cat.category}`} className="group block relative overflow-hidden aspect-[3/4]">
                <img
                  src={cat.img}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-foreground/20 group-hover:bg-foreground/30 transition-colors" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="font-display text-xl font-bold text-primary-foreground">{cat.name}</h3>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-14">
            <div>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">Sản phẩm nổi bật</h2>
              <p className="font-body text-sm text-muted-foreground mt-2">Được yêu thích nhất tuần này</p>
            </div>
            <Link
              to="/shop"
              className="hidden md:inline-flex items-center gap-2 font-body text-sm font-medium text-foreground hover:text-muted-foreground transition-colors"
            >
              Xem tất cả <ArrowRight size={14} />
            </Link>
          </div>
          
          {loading ? (
              <p className="text-center">Đang tải sản phẩm...</p>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {featuredProducts.map((product, i) => (
                <ProductCard key={product.id || product._id} product={product} index={i} />
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">Chưa có sản phẩm nào.</p>
          )}
        </div>
      </section>

      {/* Banner */}
      <section className="py-24 container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto"
        >
          <p className="font-body text-xs tracking-[0.3em] uppercase text-muted-foreground mb-4">
            Ưu đãi đặc biệt
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6 italic">
            Giảm đến 30%
          </h2>
          <p className="font-body text-muted-foreground mb-8">
            Áp dụng cho toàn bộ sản phẩm mùa mới. Số lượng có hạn.
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-3 bg-primary text-primary-foreground px-8 py-4 font-body text-sm font-semibold uppercase tracking-widest hover:opacity-90 transition-opacity"
          >
            Mua ngay
            <ArrowRight size={16} />
          </Link>
        </motion.div>
      </section>
    </div>
  );
};

export default Index;