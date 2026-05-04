import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import productApi from "../api/productApi";
import categoryApi from "../api/categoryApi";
import ProductCard from "@/components/ProductCard";

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShopData = async () => {
      try {
        setLoading(true);
        // Lấy danh mục quần áo nam từ CSDL
        const catRes = await categoryApi.getAll();
        setCategories([{ id: "all", name: "Tất cả" }, ...catRes.data]);

        // Lấy sản phẩm dựa trên search params
        const params = Object.fromEntries([...searchParams]);
        const prodRes = await productApi.getAll(params);
        setProducts(prodRes.products || []);
      } catch (error) {
        console.error("Lỗi kết nối CSDL:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchShopData();
  }, [searchParams]);

  return (
    <div className="min-h-screen">
      <div className="bg-secondary py-12 text-center">
        <h1 className="text-4xl font-bold uppercase">Thời Trang Nam</h1>
        <p className="mt-2">{products.length} sản phẩm sẵn sàng</p>
      </div>

      <div className="container mx-auto px-4 py-10">
        <div className="flex gap-4 mb-10 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSearchParams({ category: cat.id })}
              className={`px-6 py-2 whitespace-nowrap transition-colors ${
                activeCategory === cat.id ? "bg-primary text-white" : "bg-gray-100"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {loading ? (
          <div>Đang tải sản phẩm...</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {products.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        )}
      </div>
    </div>
  );
};export default Shop;