import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Search, Eye } from "lucide-react";
import { formatPrice } from "@/data/products";
import { toast } from "sonner";

const sampleOrders = [
  {
    id: "DH001",
    customer: "Nguyễn Thị Mai",
    email: "mai@email.com",
    phone: "0901234567",
    address: "123 Nguyễn Huệ, Q.1, TP.HCM",
    items: [
      { name: "Áo Blazer Oversized", size: "M", color: "Đen", quantity: 1, price: 1290000 },
      { name: "Quần Palazzo Ống Rộng", size: "S", color: "Trắng kem", quantity: 1, price: 890000 },
    ],
    total: 2180000,
    status: "pending",
    date: "2024-06-15",
  },
  {
    id: "DH002",
    customer: "Trần Văn Nam",
    email: "nam@email.com",
    phone: "0912345678",
    address: "456 Lê Lợi, Q.3, TP.HCM",
    items: [
      { name: "Đầm Midi Lụa", size: "S", color: "Đỏ rượu", quantity: 1, price: 1590000 },
    ],
    total: 1590000,
    status: "confirmed",
    date: "2024-06-14",
  },
  {
    id: "DH003",
    customer: "Lê Thị Hoa",
    email: "hoa@email.com",
    phone: "0923456789",
    address: "789 Trần Hưng Đạo, Q.5, TP.HCM",
    items: [
      { name: "Túi Xách Mini", size: "One Size", color: "Nâu", quantity: 2, price: 1190000 },
    ],
    total: 2380000,
    status: "shipping",
    date: "2024-06-13",
  },
  {
    id: "DH004",
    customer: "Phạm Minh Tuấn",
    email: "tuan@email.com",
    phone: "0934567890",
    address: "321 Hai Bà Trưng, Q.1, TP.HCM",
    items: [
      { name: "Áo Sơ Mi Lụa", size: "L", color: "Trắng", quantity: 1, price: 790000 },
      { name: "Khăn Lụa Vuông", size: "One Size", color: "Xanh navy", quantity: 1, price: 490000 },
    ],
    total: 1280000,
    status: "delivered",
    date: "2024-06-10",
  },
  {
    id: "DH005",
    customer: "Đỗ Thanh Lan",
    email: "lan@email.com",
    phone: "0945678901",
    address: "654 Võ Văn Tần, Q.3, TP.HCM",
    items: [
      { name: "Đầm Maxi Hoa", size: "M", color: "Hoa hồng", quantity: 1, price: 1390000 },
    ],
    total: 1390000,
    status: "cancelled",
    date: "2024-06-09",
  },
];

const statusConfig = {
  pending: { label: "Chờ xác nhận", variant: "outline" },
  confirmed: { label: "Đã xác nhận", variant: "default" },
  shipping: { label: "Đang giao", variant: "secondary" },
  delivered: { label: "Đã giao", variant: "default" },
  cancelled: { label: "Đã hủy", variant: "destructive" },
};

export default function AdminOrders() {
  const [orders, setOrders] = useState(sampleOrders);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);

  const filtered = orders.filter((o) => {
    const matchSearch =
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.customer.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || o.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const updateStatus = (orderId, newStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
    toast.success(`Đã cập nhật trạng thái đơn ${orderId}`);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-display font-bold text-foreground">Quản lý đơn hàng</h2>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm đơn hàng..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="pending">Chờ xác nhận</SelectItem>
                <SelectItem value="confirmed">Đã xác nhận</SelectItem>
                <SelectItem value="shipping">Đang giao</SelectItem>
                <SelectItem value="delivered">Đã giao</SelectItem>
                <SelectItem value="cancelled">Đã hủy</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã đơn</TableHead>
                <TableHead>Khách hàng</TableHead>
                <TableHead>Ngày đặt</TableHead>
                <TableHead>Tổng tiền</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((order) => {
                const status = statusConfig[order.status];
                return (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>{order.customer}</TableCell>
                    <TableCell>{order.date}</TableCell>
                    <TableCell>{formatPrice(order.total)}</TableCell>
                    <TableCell>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => setSelectedOrder(order)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        {order.status === "pending" && (
                          <Button size="sm" onClick={() => updateStatus(order.id, "confirmed")}>
                            Xác nhận
                          </Button>
                        )}
                        {order.status === "confirmed" && (
                          <Button size="sm" variant="secondary" onClick={() => updateStatus(order.id, "shipping")}>
                            Giao hàng
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    Không có đơn hàng
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Order Detail Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">Chi tiết đơn hàng {selectedOrder?.id}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Khách hàng:</span>
                  <p className="font-medium">{selectedOrder.customer}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">SĐT:</span>
                  <p className="font-medium">{selectedOrder.phone}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground">Địa chỉ:</span>
                  <p className="font-medium">{selectedOrder.address}</p>
                </div>
              </div>

              <div className="border-t border-border pt-3">
                <p className="text-sm font-medium mb-2">Sản phẩm:</p>
                {selectedOrder.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm py-1.5 border-b border-border last:border-0">
                    <div>
                      <span>{item.name}</span>
                      <span className="text-muted-foreground ml-2">
                        {item.size} / {item.color} × {item.quantity}
                      </span>
                    </div>
                    <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between font-medium text-base pt-2 border-t border-border">
                <span>Tổng cộng:</span>
                <span>{formatPrice(selectedOrder.total)}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
