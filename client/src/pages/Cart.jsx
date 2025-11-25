import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const Cart = () => {
  const { cart, loading, updateQuantity, removeFromCart, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleQuantityChange = (itemId, currentQty, change) => {
    const newQty = currentQty + change;
    if (newQty >= 1) {
      updateQuantity(itemId, newQty);
    }
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/checkout' } } });
      return;
    }
    navigate('/checkout');
  };

  // Calculate totals
  const itemsPrice = cart.items?.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0) || 0;
  
  const shippingPrice = 500;
  const taxPrice = 0; //Math.round(itemsPrice * 0.18);
  const totalPrice = itemsPrice + shippingPrice + taxPrice;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-cream-50 py-16">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="w-24 h-24 bg-wood-100 rounded-full mx-auto mb-6 flex items-center justify-center">
            <ShoppingBag className="w-12 h-12 text-wood-400" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-wood-900">Please Login</h2>
          <p className="text-wood-600 mt-2">Login to view your cart and start shopping</p>
          <Link to="/login" className="btn-primary mt-6 inline-flex items-center">
            Login to Continue
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </div>
    );
  }

  if (loading && cart.items?.length === 0) {
    return (
      <div className="min-h-screen bg-cream-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-wood-100 rounded w-48"></div>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white p-4 rounded-xl flex gap-4">
                <div className="w-24 h-24 bg-wood-100 rounded"></div>
                <div className="flex-1 space-y-3">
                  <div className="h-5 bg-wood-100 rounded w-3/4"></div>
                  <div className="h-4 bg-wood-100 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-cream-50 py-16">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="w-24 h-24 bg-wood-100 rounded-full mx-auto mb-6 flex items-center justify-center">
            <ShoppingBag className="w-12 h-12 text-wood-400" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-wood-900">Your Cart is Empty</h2>
          <p className="text-wood-600 mt-2">Looks like you haven't added anything to your cart yet</p>
          <Link to="/products" className="btn-primary mt-6 inline-flex items-center">
            Start Shopping
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="section-title">Shopping Cart</h1>
          <button
            onClick={clearCart}
            className="text-red-600 hover:text-red-700 text-sm flex items-center"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Clear Cart
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item) => (
              <div key={item._id} className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex gap-4">
                  {/* Product Image */}
                  <Link to={`/products/${item.product?._id}`} className="flex-shrink-0">
                    <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-lg overflow-hidden bg-wood-100">
                      {item.product?.images?.[0] ? (
                        <img
                          src={item.product.images[0].url}
                          alt={item.product?.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-4xl font-serif text-wood-300">W</span>
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <Link to={`/products/${item.product?._id}`}>
                      <h3 className="font-serif font-semibold text-wood-900 hover:text-wood-700">
                        {item.product?.name || 'Product'}
                      </h3>
                    </Link>

                    {/* Customization Details */}
                    {item.customization?.text && (
                      <p className="text-sm text-wood-600 mt-1">
                        Text: "{item.customization.text}"
                      </p>
                    )}
                    {item.customization?.additionalNotes && (
                      <p className="text-sm text-wood-600 mt-1">
                        Notes: {item.customization.additionalNotes}
                      </p>
                    )}
                    {item.selectedSize && (
                      <p className="text-sm text-wood-600">
                        Size: {item.selectedSize.name}
                      </p>
                    )}

                    {/* Price */}
                    <p className="font-semibold text-wood-900 mt-2">
                      ₹{item.price?.toLocaleString()} each
                    </p>

                    {/* Quantity Controls */}
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleQuantityChange(item._id, item.quantity, -1)}
                          className="w-8 h-8 rounded-lg border border-wood-200 flex items-center justify-center hover:bg-wood-50"
                          disabled={loading}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="font-semibold w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(item._id, item.quantity, 1)}
                          className="w-8 h-8 rounded-lg border border-wood-200 flex items-center justify-center hover:bg-wood-50"
                          disabled={loading}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="font-bold text-wood-900">
                          ₹{(item.price * item.quantity).toLocaleString()}
                        </span>
                        <button
                          onClick={() => removeFromCart(item._id)}
                          className="text-red-500 hover:text-red-700 p-2"
                          disabled={loading}
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 shadow-sm sticky top-24">
              <h2 className="font-serif text-xl font-bold text-wood-900 mb-6">
                Order Summary
              </h2>

              <div className="space-y-4">
                <div className="flex justify-between text-wood-600">
                  <span>Subtotal ({cart.items.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                  <span>₹{itemsPrice.toLocaleString()}</span>
                </div>

                <div className="flex justify-between text-wood-600">
                  <span>Shipping</span>
                  <span className={shippingPrice === 0 ? 'text-green-600' : ''}>
                    {shippingPrice === 0 ? 'FREE' : `₹${shippingPrice}`}
                  </span>
                </div>

                <div className="flex justify-between text-wood-600">
                  <span>GST (18%)</span>
                  <span>₹{taxPrice.toLocaleString()}</span>
                </div>

                <hr className="border-wood-100" />

                <div className="flex justify-between text-xl font-bold text-wood-900">
                  <span>Total</span>
                  <span>₹{totalPrice.toLocaleString()}</span>
                </div>

                {itemsPrice < 999 && (
                  <p className="text-sm text-wood-500 bg-wood-50 p-3 rounded-lg">
                    Add ₹{(999 - itemsPrice).toLocaleString()} more for free shipping!
                  </p>
                )}
              </div>

              <button
                onClick={handleCheckout}
                className="w-full btn-primary mt-6 flex items-center justify-center"
              >
                Proceed to Checkout
                <ArrowRight className="ml-2 w-5 h-5" />
              </button>

              <Link
                to="/products"
                className="block text-center text-wood-600 hover:text-wood-800 mt-4"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
