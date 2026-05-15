import { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; 
import { Truck,Menu, X, LogOut, Package, ShoppingCart, Users, Tag, Home, Settings, ListTree } from "lucide-react"; 
import { useAuth } from "@/contexts/AuthContext";

export const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // SỬA: Thêm subItems cho "Sản phẩm"
  const menuItems = [
    { icon: Home, label: "Tổng quan", path: "/admin" },
    { 
      icon: Package, label: "Sản phẩm", path: "/admin/product",
      subItems: [
        { label: "Danh sách sản phẩm", path: "/admin/product" },
        { label: "Quản lý danh mục", path: "/admin/categories" }, // Menu con quản lý danh mục
        { label: "Quản lý nhà cung cấp", path: "/admin/suppliers" } // Menu con quản lý nhà cung cấp

      ]
    },
    // BỔ SUNG MỤC NHẬP HÀNG VÀO ĐÂY
    {
      icon: Truck, label: "Nhập hàng", path: "/admin/purchase-orders",
      subItems: [
        { label: "Danh sách đơn nhập", path: "/admin/purchase-orders" },
        { label: "Đặt hàng với Nhà cung cấp", path: "/admin/purchase-orders/create" }
      ]
    },
    { icon: ShoppingCart, label: "Đơn hàng", path: "/admin/orders"  ,
    subItems: [ 
        { label: "Hóa Đơn bán lẻ", path: "/admin/invoices" } // Menu con quản lý đơn hàng
      ]
    }, 
    { icon: Users, label: "Khách hàng", path: "/admin/users" },
    { icon: Tag, label: "Voucher", path: "/admin/vouchers" },  
  ];

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-foreground text-white transition-all duration-300 overflow-hidden flex flex-col border-r`}
      >
        <div className="p-6 flex items-center justify-between border-b border-white/10">
          <Link to="/admin" className={`font-display text-xl font-bold tracking-tight ${!sidebarOpen && "hidden"}`}>
            MAISON
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-white/10 rounded transition-colors"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <div className={`p-4 border-b border-white/10 ${!sidebarOpen && "hidden"}`}>
          <p className="text-sm opacity-75">Xin chào,</p>
          <p className="font-medium text-base">{user?.fullName || user?.username}</p>
          <p className="text-xs opacity-60">Quản trị viên</p>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 px-3 py-8 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.path} className="group relative">
                <Link
                  to={item.path}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-colors text-white/80 hover:text-white"
                >
                  <Icon size={20} />
                  <span className={`text-sm font-medium ${!sidebarOpen && "hidden"}`}>
                    {item.label}
                  </span>
                </Link>
                
                {/* SỬA: Menu con xổ xuống khi Hover */}
                {item.subItems && sidebarOpen && (
                  <div className="hidden group-hover:flex flex-col pl-12 pr-4 py-2 space-y-3 bg-black/20 rounded-b-lg">
                    {item.subItems.map(sub => (
                      <Link 
                        key={sub.path} 
                        to={sub.path} 
                        className="text-sm text-white/60 hover:text-white transition-colors flex items-center gap-2"
                      >
                         <ListTree size={14} /> {sub.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10 space-y-2">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-500/20 transition-colors text-red-400 hover:text-red-300 text-sm font-medium"
          >
            <LogOut size={20} />
            <span className={`${!sidebarOpen && "hidden"}`}>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-gray-50">
        <div className="sticky top-0 z-10 bg-white border-b border-border px-8 py-4 flex items-center justify-between shadow-sm">
          <h1 className="text-2xl font-display font-bold text-foreground">Bảng điều khiển</h1>
          <button className="p-2 hover:bg-gray-100 rounded transition-colors">
            <Settings size={20} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
};

export default AdminLayout;
