const userApi = {
  getAll: async (params) => {
    try {
      const res = await fetch('http://localhost:5000/api/users');
      const data = await res.json();
      return { data: data.users || [], pagination: { page: 1, total: data.users?.length || 0 } };
    } catch (err) { return { data: [], pagination: { page: 1, total: 0 } }; }
  },
  // SỬA: Gọi API thật để thêm mới thay vì dùng Date.now()
  create: async (data) => { 
    try {
      const res = await fetch('http://localhost:5000/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return await res.json();
    } catch (err) { throw err; }
  },

  // Cập nhật thông tin
  updateProfile: async (id, data) => {
    try {
      const res = await fetch(`http://localhost:5000/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return await res.json();
    } catch (err) { throw err; }
  },

  // Cập nhật trạng thái (Khóa/Mở khóa)
  updateStatus: async (id, status) => {
    try {
      const res = await fetch(`http://localhost:5000/api/users/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      return await res.json();
    } catch (err) { throw err; }
  },

  // BỔ SUNG: Hàm Xóa người dùng (Bắt buộc phải có cho chức năng Xóa)
  delete: async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/users/${id}`, {
        method: 'DELETE',
      });
      return await res.json();
    } catch (err) { throw err; }
  },

  // BỔ SUNG: Hàm Reset Mật khẩu
  resetPassword: async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/users/${id}/reset-password`, {
        method: 'POST', // Hoặc PUT tùy thuộc vào cấu hình Backend của bạn
      });
      return await res.json();
    } catch (err) { throw err; }
  }
};

export default userApi;