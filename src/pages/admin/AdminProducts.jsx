import { useState } from "react";
import { products as initialProducts, categories, formatPrice } from "@/data/products";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { toast } from "sonner";

const emptyProduct = {
  name: "", price: "", originalPrice: "", category: "ao",
  description: "", image: "", badge: "", sizes: "S, M, L, XL",
};

export default function AdminProducts() {
  const [productList, setProductList] = useState(initialProducts);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm] = useState(emptyProduct);

  const filtered = productList.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setEditProduct(null);
    setForm(emptyProduct);
    setDialogOpen(true);
  };

  const openEdit = (product) => {
    setEditProduct(product);
    setForm({
      name: product.name,
      price: String(product.price),
      originalPrice: product.originalPrice ? String(product.originalPrice) : "",
      category: product.category,
      description: product.description,
      image: product.image,
      badge: product.badge || "",
      sizes: product.sizes.join(", "),
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name || !form.price) {
      toast.error("Vui lòng nhập tên và giá sản phẩm");
      return;
    }

    const productData = {
      name: form.name,
      price: Number(form.price),
      originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
      category: form.category,
      description: form.description,
      image: form.image || "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&h=800&fit=crop",
      images: [form.image || "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&h=800&fit=crop"],
      badge: form.badge || undefined,
      sizes: form.sizes.split(",").map((s) => s.trim()).filter(Boolean),
      colors: [{ name: "Đen", hex: "#1a1a1a" }],
      rating: 4.5,
      reviews: 0,
    };

    if (editProduct) {
      setProductList((prev) =>
        prev.map((p) => (p.id === editProduct.id ? { ...p, ...productData } : p))
      );
      toast.success("Đã cập nhật sản phẩm");
    } else {
      const newProduct = { ...productData, id: String(Date.now()) };
      setProductList((prev) => [...prev, newProduct]);
      toast.success("Đã thêm sản phẩm mới");
    }
    setDialogOpen(false);
  };

  const handleDelete = (id) => {
    setProductList((prev) => prev.filter((p) => p.id !== id));
    toast.success("Đã xóa sản phẩm");
  };

  const getCategoryName = (catId) =>
    categories.find((c) => c.id === catId)?.name || catId;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-display font-bold text-foreground">Quản lý sản phẩm</h2>
        <Button onClick={openAdd}>
          <Plus className="h-4 w-4 mr-2" /> Thêm sản phẩm
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm sản phẩm..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ảnh</TableHead>
                <TableHead>Tên</TableHead>
                <TableHead>Danh mục</TableHead>
                <TableHead>Giá</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{getCategoryName(product.category)}</TableCell>
                  <TableCell>
                    <div>{formatPrice(product.price)}</div>
                    {product.originalPrice && (
                      <div className="text-xs text-muted-foreground line-through">
                        {formatPrice(product.originalPrice)}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {product.badge ? (
                      <Badge variant={product.badge === "Sale" ? "destructive" : "default"}>
                        {product.badge}
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Đang bán</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(product)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(product.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    Không tìm thấy sản phẩm
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">
              {editProduct ? "Sửa sản phẩm" : "Thêm sản phẩm mới"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Tên sản phẩm *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Giá bán *</Label>
                <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
              </div>
              <div>
                <Label>Giá gốc</Label>
                <Input type="number" value={form.originalPrice} onChange={(e) => setForm({ ...form, originalPrice: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Danh mục</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.filter((c) => c.id !== "all").map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Nhãn</Label>
                <Select value={form.badge || "none"} onValueChange={(v) => setForm({ ...form, badge: v === "none" ? "" : v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Không</SelectItem>
                    <SelectItem value="Sale">Sale</SelectItem>
                    <SelectItem value="Mới">Mới</SelectItem>
                    <SelectItem value="Hot">Hot</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Sizes (cách nhau bằng dấu phẩy)</Label>
              <Input value={form.sizes} onChange={(e) => setForm({ ...form, sizes: e.target.value })} />
            </div>
            <div>
              <Label>URL hình ảnh</Label>
              <Input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="https://..." />
            </div>
            <div>
              <Label>Mô tả</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Hủy</Button>
            <Button onClick={handleSave}>{editProduct ? "Cập nhật" : "Thêm"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
