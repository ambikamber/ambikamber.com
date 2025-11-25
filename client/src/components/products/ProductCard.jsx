import { Link } from 'react-router-dom';
import { ShoppingCart, Star } from 'lucide-react';
import { useCart } from '../../context/CartContext';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  const handleAddToCart = (e) => {
    e.preventDefault();
    addToCart(product._id, 1);
  };

  const displayPrice = product.discountPrice || product.price;
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;

  return (
    <Link to={`/products/${product._id}`} className="card group">
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-wood-100">
        {product.images && product.images[0] ? (
          <img
            src={product.images[0].url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-wood-400">
            <span className="text-6xl font-serif">W</span>
          </div>
        )}
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {hasDiscount && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
              -{product.discountPercentage}%
            </span>
          )}
          {product.featured && (
            <span className="bg-wood-700 text-white text-xs font-bold px-2 py-1 rounded">
              Featured
            </span>
          )}
        </div>

        {/* Quick Add Button */}
        <button
          onClick={handleAddToCart}
          className="absolute bottom-3 right-3 bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-wood-700 hover:text-white"
        >
          <ShoppingCart className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Category */}
        {product.categories?.length > 0 && (
          <span className="text-xs text-wood-500 uppercase tracking-wider">
            {product.categories[0]?.name || product.categories[0]}
          </span>
        )}

        {/* Name */}
        <h3 className="font-serif font-semibold text-lg text-wood-900 mt-1 group-hover:text-wood-700 transition">
          {product.name}
        </h3>

        {/* Rating */}
        {product.numReviews > 0 && (
          <div className="flex items-center mt-2">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            <span className="text-sm text-wood-600 ml-1">
              {(product.averageRating || 0).toFixed(1)} ({product.numReviews})
            </span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center mt-3">
          <span className="text-xl font-bold text-wood-900">
            ₹{displayPrice.toLocaleString()}
          </span>
          {hasDiscount && (
            <span className="text-sm text-wood-400 line-through ml-2">
              ₹{product.price.toLocaleString()}
            </span>
          )}
        </div>

        {/* Stock Status */}
        {product.stock <= 5 && product.stock > 0 && (
          <p className="text-xs text-orange-600 mt-2">
            Only {product.stock} left in stock!
          </p>
        )}
        {product.stock === 0 && (
          <p className="text-xs text-red-600 mt-2">Out of stock</p>
        )}
      </div>
    </Link>
  );
};

export default ProductCard;
