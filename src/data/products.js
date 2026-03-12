export const categories = [
  { id: "all", name: "Tất cả" },
  { id: "ao", name: "Áo" },
  { id: "quan", name: "Quần" },
  { id: "dam", name: "Đầm" },
  { id: "phu-kien", name: "Phụ kiện" },
];

export const products = [
  {
    id: "1",
    name: "Áo Blazer Oversized",
    price: 1290000,
    originalPrice: 1690000,
    image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&h=800&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&h=800&fit=crop",
    ],
    category: "ao",
    description: "Áo blazer oversized phong cách hiện đại, chất liệu cao cấp. Phù hợp cho cả công sở và dạo phố.",
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Đen", hex: "#1a1a1a" },
      { name: "Be", hex: "#d4c5a9" },
    ],
    badge: "Sale",
    rating: 4.8,
    reviews: 124,
  },
  {
    id: "2",
    name: "Đầm Midi Lụa",
    price: 1590000,
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&h=800&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&h=800&fit=crop",
    ],
    category: "dam",
    description: "Đầm midi chất liệu lụa mềm mại, kiểu dáng thanh lịch. Hoàn hảo cho buổi tiệc và sự kiện.",
    sizes: ["XS", "S", "M", "L"],
    colors: [
      { name: "Đen", hex: "#1a1a1a" },
      { name: "Đỏ rượu", hex: "#722F37" },
    ],
    badge: "Mới",
    rating: 4.9,
    reviews: 89,
  },
  {
    id: "3",
    name: "Quần Palazzo Ống Rộng",
    price: 890000,
    image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600&h=800&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600&h=800&fit=crop",
    ],
    category: "quan",
    description: "Quần palazzo ống rộng, lưng cao tôn dáng. Chất liệu thoáng mát, phù hợp mọi dịp.",
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Trắng kem", hex: "#F5F0E8" },
      { name: "Đen", hex: "#1a1a1a" },
      { name: "Nâu", hex: "#8B7355" },
    ],
    rating: 4.7,
    reviews: 203,
  },
  {
    id: "4",
    name: "Áo Sơ Mi Lụa",
    price: 790000,
    image: "https://images.unsplash.com/photo-1598554747436-c9293d6a588f?w=600&h=800&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1598554747436-c9293d6a588f?w=600&h=800&fit=crop",
    ],
    category: "ao",
    description: "Áo sơ mi lụa cao cấp, form dáng thoải mái. Có thể kết hợp với nhiều phong cách khác nhau.",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [
      { name: "Trắng", hex: "#FFFFFF" },
      { name: "Hồng pastel", hex: "#F4C2C2" },
    ],
    rating: 4.6,
    reviews: 156,
  },
  {
    id: "5",
    name: "Túi Xách Mini",
    price: 1190000,
    originalPrice: 1490000,
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=800&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=800&fit=crop",
    ],
    category: "phu-kien",
    description: "Túi xách mini thiết kế tinh tế, chất liệu da tổng hợp cao cấp.",
    sizes: ["One Size"],
    colors: [
      { name: "Đen", hex: "#1a1a1a" },
      { name: "Nâu", hex: "#8B4513" },
    ],
    badge: "Sale",
    rating: 4.5,
    reviews: 78,
  },
  {
    id: "6",
    name: "Đầm Maxi Hoa",
    price: 1390000,
    image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&h=800&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&h=800&fit=crop",
    ],
    category: "dam",
    description: "Đầm maxi họa tiết hoa thanh nhã, phong cách nữ tính và lãng mạn.",
    sizes: ["S", "M", "L"],
    colors: [
      { name: "Hoa xanh", hex: "#5B7F95" },
      { name: "Hoa hồng", hex: "#C48B9F" },
    ],
    badge: "Mới",
    rating: 4.8,
    reviews: 67,
  },
  {
    id: "7",
    name: "Quần Jeans Skinny",
    price: 690000,
    image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&h=800&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&h=800&fit=crop",
    ],
    category: "quan",
    description: "Quần jeans skinny co giãn tốt, thoải mái suốt cả ngày.",
    sizes: ["26", "27", "28", "29", "30", "31", "32"],
    colors: [
      { name: "Xanh đậm", hex: "#1C3144" },
      { name: "Xanh nhạt", hex: "#6B8BA4" },
    ],
    rating: 4.4,
    reviews: 312,
  },
  {
    id: "8",
    name: "Khăn Lụa Vuông",
    price: 490000,
    image: "https://images.unsplash.com/photo-1601924921557-45e6dea0c151?w=600&h=800&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1601924921557-45e6dea0c151?w=600&h=800&fit=crop",
    ],
    category: "phu-kien",
    description: "Khăn lụa vuông họa tiết sang trọng, đa dạng cách sử dụng.",
    sizes: ["One Size"],
    colors: [
      { name: "Đỏ", hex: "#B22222" },
      { name: "Xanh navy", hex: "#000080" },
    ],
    rating: 4.7,
    reviews: 45,
  },
];

export function formatPrice(price) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
}
