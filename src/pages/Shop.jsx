import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import productApi from "../api/productApi";
import categoryApi from "../api/categoryApi";
import ProductCard from "@/components/ProductCard";
import { SlidersHorizontal, ChevronLeft, ChevronRight } from "lucide-react";

// HÀM CHUẨN HÓA TIẾNG VIỆT SIÊU MẠNH: Bỏ dấu, bỏ gạch ngang, viết thường
const normalizeStr = (str) => {
  return String(str || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .replace(/[-\s]+/g, "") 
    .toLowerCase()
    .trim();
};

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // State cho Tìm kiếm & Sắp xếp
  const [sort, setSort] = useState("newest");
  const [searchQuery, setSearchQuery] = useState("");

  // State cho Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 15;

  const activeCategory = searchParams.get("category") || "all";

  // Reset về trang 1 khi người dùng thay đổi bất kỳ bộ lọc hoặc sắp xếp nào
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, sort, searchQuery]);

  // 🔥 CALL API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // 👉 Lấy danh sách Categories
        const catRes = await categoryApi.getAll();
        const catData = catRes?.data || [];

        setCategories([
          { id: "all", name: "Tất cả" },
          ...catData.map((c) => ({
            id: c.id ?? c.CategoryID ?? c._id,
            name: c.name ?? c.Name,
          })),
        ]);

        // 👉 Lấy danh sách Products
        const params = Object.fromEntries([...searchParams]);
        const prodRes = await productApi.getAll(params);

        const raw =
          prodRes?.products ||
          prodRes?.data?.products ||
          prodRes?.data ||
          [];

        // 🔥 MAP DATA
        const mapped = raw.map((p) => ({
          id: p.id ?? p.ProductID ?? p._id,
          name: p.name ?? p.Name,
          price: p.price ?? p.Price,
          image: p.image || (p.ImageUrl ? `/${p.ImageUrl}` : "/assets/no-image.png"),
          images: p.images && p.images.length > 0 ? p.images : [ p.image || (p.ImageUrl ? `/${p.ImageUrl}` : "/assets/no-image.png") ],
          colors: p.colors || [],
          sizes: p.sizes || [],
          category: p.category ?? p.CategoryName ?? p.CategoryID,
          reviews: p.reviews ?? 0,
          badge: p.badge ?? p.Badge, // Lấy Badge từ CSDL để phục vụ sắp xếp
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

    // 1. Lọc theo Category
    if (activeCategory !== "all") {
      let filterValue = normalizeStr(activeCategory);

      // Nếu URL đang là ID số, quét mảng tìm tên chữ của nó
      const matchedCat = categories.find(c => String(c.id) === String(activeCategory));
      if (matchedCat) {
        filterValue = normalizeStr(matchedCat.name);
      }

      result = result.filter(
        (p) => normalizeStr(p.category) === filterValue || normalizeStr(p.category).includes(filterValue)
      );
    }

    // 2. Lọc theo Search Query (Tên sản phẩm)
    if (searchQuery) {
      result = result.filter((p) =>
        p.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // 3. Sắp xếp (Sort) theo Badge và Giá
    switch (sort) {
      case "price-asc":
        return [...result].sort((a, b) => a.price - b.price);
      case "price-desc":
        return [...result].sort((a, b) => b.price - a.price);
      case "newest":
        // Ưu tiên sản phẩm có Badge là 'MỚI' lên đầu tiên
        return [...result].sort((a, b) => {
          if (a.badge === 'MỚI' && b.badge !== 'MỚI') return -1;
          if (a.badge !== 'MỚI' && b.badge === 'MỚI') return 1;
          return 0; // Các sản phẩm khác giữ nguyên thứ tự
        });
      case "best-seller":
        // Ưu tiên sản phẩm có Badge là 'BEST SELLER' lên đầu tiên
        return [...result].sort((a, b) => {
          if (a.badge === 'BEST SELLER' && b.badge !== 'BEST SELLER') return -1;
          if (a.badge !== 'BEST SELLER' && b.badge === 'BEST SELLER') return 1;
          return 0;
        });
      default:
        return result; 
    }
  }, [products, activeCategory, sort, searchQuery, categories]);

  // 🔥 TÍNH TOÁN PHÂN TRANG (PAGINATION)
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filtered.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filtered.length / productsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    // Cuộn mượt mà lên đầu trang lưới sản phẩm sau khi chuyển trang
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen">
      {/* HEADER TÌM KIẾM */}
      <div className="bg-gray-100 py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold uppercase text-gray-900">
            Thời Trang Nam
          </h1>
          <p className="mt-2 text-gray-600">{filtered.length} sản phẩm sẵn sàng</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        {/* THANH CÔNG CỤ: FILTER & SORT */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:w-64 px-4 py-2.5 border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />

          <div className="flex items-center gap-4 flex-wrap">
            {/* NÚT CHỌN DANH MỤC */}
            <div className="flex gap-2 flex-wrap">
              {categories.map((cat) => {
                let isSelected = false;
                if (activeCategory === "all" && cat.id === "all") {
                  isSelected = true;
                } else if (cat.id !== "all") {
                  isSelected = String(cat.id) === String(activeCategory) || normalizeStr(cat.name) === normalizeStr(activeCategory);
                }

                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      if (cat.id === "all") {
                        searchParams.delete("category");
                      } else {
                        const urlFriendlyName = String(cat.name).normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase().trim().replace(/\s+/g, '-');
                        searchParams.set("category", urlFriendlyName);
                      }
                      setSearchParams(searchParams);
                    }}
                    className={`px-6 py-2.5 text-xs font-semibold uppercase tracking-widest transition-all duration-300 ${
                      isSelected
                        ? "bg-zinc-950 text-white shadow-md" 
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </div>

            {/* DROPDOWN SẮP XẾP */}
            <div className="flex items-center gap-2">
              <SlidersHorizontal size={14} className="text-muted-foreground" />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="text-sm border border-border bg-background text-foreground px-3 py-2 outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="newest">Mới nhất</option>
                <option value="best-seller">Bán chạy</option>
                <option value="price-asc">Giá thấp → cao</option>
                <option value="price-desc">Giá cao → thấp</option>
              </select>
            </div>
          </div>
        </div>

        {/* LƯỚI SẢN PHẨM & PHÂN TRANG */}
        {loading ? (
          <div className="text-center py-20 text-muted-foreground">
            Đang tải sản phẩm...
          </div>
        ) : filtered.length > 0 ? (
          <>
            {/* THAY ĐỔI: grid-cols-5 và gap-4 để nhỏ lại và hiển thị 5 cái 1 hàng */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {currentProducts.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>

            {/* COMPONENT PHÂN TRANG */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-12 pt-4">
                <button 
                  onClick={() => handlePageChange(currentPage - 1)} 
                  disabled={currentPage === 1} 
                  className="p-2 border border-border rounded bg-background text-foreground disabled:opacity-50 hover:bg-gray-100 transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button 
                    key={page} 
                    onClick={() => handlePageChange(page)} 
                    className={`w-10 h-10 rounded border border-border transition-colors font-medium ${
                      currentPage === page 
                        ? "bg-zinc-950 text-white shadow-md" 
                        : "bg-background text-foreground hover:bg-gray-100"
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button 
                  onClick={() => handlePageChange(currentPage + 1)} 
                  disabled={currentPage === totalPages} 
                  className="p-2 border border-border rounded bg-background text-foreground disabled:opacity-50 hover:bg-gray-100 transition-colors"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center text-gray-500 py-10">
            Không tìm thấy sản phẩm nào phù hợp với bộ lọc.
          </div>
        )}
      </div>
    </div>
  );
};

export default Shop;