import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <h3 className="font-display text-2xl font-bold mb-4">MAISON</h3>
            <p className="text-sm opacity-70 font-body leading-relaxed">
              Thời trang cao cấp, thiết kế tinh tế cho phong cách sống hiện đại.
            </p>
          </div>

          <div>
            <h4 className="font-body text-sm font-semibold uppercase tracking-widest mb-4">Cửa hàng</h4>
            <ul className="space-y-2">
              {["Áo", "Quần", "Đầm", "Phụ kiện"].map((item) => (
                <li key={item}>
                  <Link to="/shop" className="text-sm opacity-70 hover:opacity-100 transition-opacity font-body">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-body text-sm font-semibold uppercase tracking-widest mb-4">Hỗ trợ</h4>
            <ul className="space-y-2">
              {["Hướng dẫn mua hàng", "Chính sách đổi trả", "Chính sách vận chuyển", "Liên hệ"].map((item) => (
                <li key={item}>
                  <span className="text-sm opacity-70 hover:opacity-100 transition-opacity font-body cursor-pointer">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-body text-sm font-semibold uppercase tracking-widest mb-4">Liên hệ</h4>
            <ul className="space-y-2 text-sm opacity-70 font-body">
              <li>Email: hello@maison.vn</li>
              <li>Hotline: 1900 1234</li>
              <li>Địa chỉ: 123 Nguyễn Huệ, Q.1, TP.HCM</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-12 pt-8 text-center">
          <p className="text-xs opacity-50 font-body">© 2026 MAISON. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
