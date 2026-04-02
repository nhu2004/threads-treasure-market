const format = {
  /**
   * Định dạng giá tiền theo đơn vị VND
   * @param {number} price - Giá tiền cần định dạng
   * @returns {string} Giá tiền đã được định dạng
   */
  formatPrice: (price) => {
    if (typeof price !== "number" || isNaN(price)) {
      throw new Error("Giá tiền phải là một số hợp lệ.");
    }
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  },

  /**
   * Chuyển đổi mảng các đối tượng thành chuỗi, cách nhau bởi dấu phẩy
   * @param {Array} list - Mảng các đối tượng
   * @returns {string} Chuỗi các tên được nối với nhau
   */
  arrayToString: (list) => {
    if (!Array.isArray(list)) {
      throw new Error("Dữ liệu đầu vào phải là một mảng.");
    }
    return list.map((item) => item?.name || "").join(", ");
  },

  /**
   * Tính giá cuối cùng sau khi áp dụng mã giảm giá
   * @param {number} totalPrice - Tổng giá tiền ban đầu
   * @param {Object} voucher - Đối tượng mã giảm giá
   * @param {string} voucher.by - Loại giảm giá ("percent" hoặc "amount")
   * @param {number} voucher.value - Giá trị giảm giá
   * @returns {number} Giá tiền sau khi giảm giá
   */
  calculateFinalPrice: (totalPrice, voucher) => {
    if (typeof totalPrice !== "number" || isNaN(totalPrice)) {
      throw new Error("Tổng giá tiền phải là một số hợp lệ.");
    }
    if (!voucher || typeof voucher.value !== "number" || isNaN(voucher.value)) {
      return totalPrice;
    }

    const discount =
      voucher.by === "percent"
        ? totalPrice * (voucher.value / 100)
        : voucher.value;
    return Math.max(0, totalPrice - discount); // Đảm bảo giá không âm
  },
};

export default format;
