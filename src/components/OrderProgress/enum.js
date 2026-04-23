// Client/src/components/OrderProgress/enum.js
const steps = [
  { code: 0, text: "Chờ xác nhận", color: "#F5A623" }, // Vàng
  { code: 1, text: "Đang giao", color: "#ac5af4" },    // Tím
  { code: 2, text: "Đã giao", color: "#42ffb0" },      // Xanh lá
  { code: 3, text: "Đã hủy", color: "#f9bdbd" }        // Xám (hoặc Đỏ tùy thiết kế)
];

export default steps;