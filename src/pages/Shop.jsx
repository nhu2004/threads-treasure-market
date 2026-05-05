import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import productApi from "../api/productApi";
import categoryApi from "../api/categoryApi";
import ProductCard from "@/components/ProductCard";
import { SlidersHorizontal } from "lucide-react";

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [sort, setSort] = useState("newest");
  const [searchQuery, setSearchQuery] = useState("");

  const activeCategory = searchParams.get("category") || "all";

  // 🔥 CALL API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // 👉 Categories
        const catRes = await categoryApi.getAll();
        const catData = catRes?.data || [];

        setCategories([
          { id: "all", name: "Tất cả" },
          ...catData.map((c) => ({
            id: c.id ?? c.CategoryID,
            name: c.name ?? c.Name,
          })),
        ]);

        // 👉 Products
        const params = Object.fromEntries([...searchParams]);
        const prodRes = await productApi.getAll(params);

        const raw =
          prodRes?.products ||
          prodRes?.data?.products ||
          prodRes?.data ||
          [];

        // 🔥 MAP DATA (QUAN TRỌNG - FIX CRASH)
        const mapped = raw.map((p) => ({
          id: p.id ?? p.ProductID,
          name: p.name ?? p.Name,
          price: p.price ?? p.Price,

          image:
            p.image ||
            (p.ImageUrl ? `/${p.ImageUrl}` : "/assets/no-image.png"),

          // ✅ FIX lỗi ProductCard
          images:
            p.images && p.images.length > 0
              ? p.images
              : [
                  p.image ||
                    (p.ImageUrl
                      ? `/${p.ImageUrl}`
                      : "/assets/no-image.png"),
                ],

          colors: p.colors || [],
          sizes: p.sizes || [],

          category: p.category ?? p.CategoryID,
          reviews: p.reviews ?? 0,
        }));

        setProducts(mapped);
      } catch (err) {
        console.error("Lỗi API:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [searchParams]);

  // 🔥 FILTER + SORT
  const filtered = useMemo(() => {
    let result = products;

    // category
    if (activeCategory !== "all") {
      result = result.filter(
        (p) => String(p.category) === String(activeCategory)
      );
    }

    // search
    if (searchQuery) {
      result = result.filter((p) =>
        p.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // sort
    switch (sort) {
      case "price-asc":
        return [...result].sort((a, b) => a.price - b.price);
      case "price-desc":
        return [...result].sort((a, b) => b.price - a.price);
      case "popular":
        return [...result].sort((a, b) => b.reviews - a.reviews);
      default:
        return result;
    }
  }, [products, activeCategory, sort, searchQuery]);

  return (
    <div className="min-h-screen">
      {/* HEADER */}
      <div className="bg-secondary py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold uppercase">
            Thời Trang Nam
          </h1>
          <p className="mt-2">{filtered.length} sản phẩm sẵn sàng</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        {/* FILTER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          {/* SEARCH */}
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:w-64 px-4 py-2.5 border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />

          <div className="flex items-center gap-4 flex-wrap">
            {/* CATEGORY */}
            <div className="flex gap-2 flex-wrap">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() =>
                    setSearchParams(
                      cat.id === "all"
                        ? {}
                        : { category: cat.id }
                    )
                  }
                  className={`px-4 py-2 text-xs uppercase tracking-widest ${
                    String(activeCategory) === String(cat.id)
                      ? "bg-primary text-white"
                      : "bg-secondary hover:bg-accent"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* SORT */}
            <div className="flex items-center gap-2">
              <SlidersHorizontal size={14} />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="text-xs border px-3 py-2"
              >
                <option value="newest">Mới nhất</option>
                <option value="price-asc">Giá thấp → cao</option>
                <option value="price-desc">Giá cao → thấp</option>
                <option value="popular">Phổ biến</option>
              </select>
            </div>
          </div>
        </div>

        {/* PRODUCTS */}
        {loading ? (
          <div className="text-center py-20">
            Đang tải sản phẩm...
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {filtered.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500">
            Không có sản phẩm nào
          </div>
        )}
      </div>
    </div>
  );
};

export default Shop;