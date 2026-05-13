import { Link } from "react-router-dom";
import { motion } from "framer-motion";  

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

const ProductCard = ({ product, index = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Link to={`/product/${product.id}`} className="group block">
        <div className="relative overflow-hidden bg-gray-100 text-gray-900 aspect-[3/4] mb-4">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            loading="lazy"
          />
          {product.badge && (
            <span className="absolute top-3 left-3 bg-zinc-950 text-primary-foreground text-[10px] font-body font-semibold uppercase tracking-widest px-3 py-1">
              {product.badge}
            </span>
          )}
        </div>
        <div>
          <h3 className="font-body text-sm font-medium text-foreground mb-1 group-hover:text-muted-foreground transition-colors">
            {product.name}
          </h3>
          <div className="flex items-center gap-2">
            <span className="font-body text-sm font-semibold text-foreground">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="font-body text-xs text-muted-foreground line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
          {/* Hiển thị Màu và Size theo cấu trúc mới */}
          <div className="flex gap-2 mt-2 text-[11px] text-gray-500 font-medium">
            {product.color && (
              <span className="px-2 py-1 bg-gray-100 rounded-md border border-gray-200">
                {product.color}
              </span>
            )}
            {product.size && (
              <span className="px-2 py-1 bg-gray-100 rounded-md border border-gray-200">
                {product.size}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;