import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, CreditCard, Check, AlertCircle, TestTube } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { paymentAPI } from '../services/api';
import toast from 'react-hot-toast';

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, fetchCart } = useCart();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [shippingAddress, setShippingAddress] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    pincode: user?.address?.pincode || '',
    country: 'India'
  });

  // Calculate totals
  const itemsPrice = cart.items?.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0) || 0;
  
  const shippingPrice = itemsPrice > 999 ? 0 : 99;
  const taxPrice = Math.round(itemsPrice * 0.18);
  const totalPrice = itemsPrice + shippingPrice + taxPrice;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({ ...prev, [name]: value }));
  };

  const validateAddress = () => {
    const required = ['name', 'email', 'phone', 'street', 'city', 'state', 'pincode'];
    for (const field of required) {
      if (!shippingAddress[field]?.trim()) {
        toast.error(`Please enter ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return false;
      }
    }
    
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(shippingAddress.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }
    
    // Validate phone
    if (!/^\d{10}$/.test(shippingAddress.phone)) {
      toast.error('Please enter a valid 10-digit phone number');
      return false;
    }
    
    // Validate pincode
    if (!/^\d{6}$/.test(shippingAddress.pincode)) {
      toast.error('Please enter a valid 6-digit pincode');
      return false;
    }
    
    return true;
  };

  const handleProceedToPayment = () => {
    if (validateAddress()) {
      setStep(2);
    }
  };

  const handleDemoPayment = async () => {
    try {
      setLoading(true);
      const { data } = await paymentAPI.demo({ shippingAddress });
      toast.success('Order placed successfully!');
      fetchCart();
      navigate(`/orders/${data.order._id}`);
    } catch (error) {
      console.error('Demo payment error:', error);
      toast.error(error.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (paymentMethod === 'demo') {
      return handleDemoPayment();
    }

    try {
      setLoading(true);

      // Create Razorpay order
      const { data: orderData } = await paymentAPI.createOrder({
        amount: totalPrice,
        shippingAddress
      });

      // Initialize Razorpay
      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Ambikamber',
        description: 'Premium Wooden Nameplates',
        order_id: orderData.razorpayOrderId,
        handler: async function (response) {
          try {
            // Verify payment
            const { data } = await paymentAPI.verify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: orderData.orderId
            });

            toast.success('Payment successful!');
            fetchCart(); // Clear cart
            navigate(`/orders/${data.order._id}`);
          } catch (error) {
            toast.error('Payment verification failed');
            console.error('Verification error:', error);
          }
        },
        prefill: {
          name: shippingAddress.name,
          email: shippingAddress.email,
          contact: shippingAddress.phone
        },
        theme: {
          color: '#8c5839'
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
            toast.error('Payment cancelled');
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
      
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(error.response?.data?.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-cream-50 py-16">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <AlertCircle className="w-16 h-16 text-wood-400 mx-auto mb-4" />
          <h2 className="text-2xl font-serif font-bold text-wood-900">Your cart is empty</h2>
          <p className="text-wood-600 mt-2">Add items to your cart before checkout</p>
          <button
            onClick={() => navigate('/products')}
            className="btn-primary mt-6"
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              step >= 1 ? 'bg-wood-700 text-white' : 'bg-wood-200 text-wood-600'
            }`}>
              {step > 1 ? <Check className="w-5 h-5" /> : '1'}
            </div>
            <span className={`ml-2 font-medium ${step >= 1 ? 'text-wood-900' : 'text-wood-400'}`}>
              Shipping
            </span>
          </div>
          <div className={`w-20 h-1 mx-4 ${step >= 2 ? 'bg-wood-700' : 'bg-wood-200'}`}></div>
          <div className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              step >= 2 ? 'bg-wood-700 text-white' : 'bg-wood-200 text-wood-600'
            }`}>
              2
            </div>
            <span className={`ml-2 font-medium ${step >= 2 ? 'text-wood-900' : 'text-wood-400'}`}>
              Payment
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {step === 1 && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center mb-6">
                  <MapPin className="w-6 h-6 text-wood-700 mr-2" />
                  <h2 className="font-serif text-xl font-bold text-wood-900">
                    Shipping Address
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-wood-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={shippingAddress.name}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-wood-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={shippingAddress.email}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="john@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-wood-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={shippingAddress.phone}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="9876543210"
                      maxLength={10}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-wood-700 mb-1">
                      Pincode *
                    </label>
                    <input
                      type="text"
                      name="pincode"
                      value={shippingAddress.pincode}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="400001"
                      maxLength={6}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-wood-700 mb-1">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      name="street"
                      value={shippingAddress.street}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="House No, Building, Street, Area"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-wood-700 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={shippingAddress.city}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="Mumbai"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-wood-700 mb-1">
                      State *
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={shippingAddress.state}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="Maharashtra"
                    />
                  </div>
                </div>

                <button
                  onClick={handleProceedToPayment}
                  className="w-full btn-primary mt-6"
                >
                  Continue to Payment
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center mb-6">
                  <CreditCard className="w-6 h-6 text-wood-700 mr-2" />
                  <h2 className="font-serif text-xl font-bold text-wood-900">
                    Payment
                  </h2>
                </div>

                {/* Shipping Summary */}
                <div className="bg-wood-50 rounded-lg p-4 mb-6">
                  <h3 className="font-medium text-wood-900 mb-2">Shipping to:</h3>
                  <p className="text-wood-700">{shippingAddress.name}</p>
                  <p className="text-wood-600 text-sm">
                    {shippingAddress.street}, {shippingAddress.city}, {shippingAddress.state} - {shippingAddress.pincode}
                  </p>
                  <p className="text-wood-600 text-sm">{shippingAddress.phone}</p>
                  <button
                    onClick={() => setStep(1)}
                    className="text-wood-700 hover:text-wood-900 text-sm mt-2 underline"
                  >
                    Edit Address
                  </button>
                </div>

                {/* Payment Methods */}
                <div className="space-y-3 mb-6">
                  <h3 className="font-medium text-wood-900 mb-3">Select Payment Method</h3>
                  
                  {/* Razorpay Option */}
                  <label 
                    className={`flex items-center p-4 border rounded-lg cursor-pointer transition ${
                      paymentMethod === 'razorpay' 
                        ? 'border-wood-700 bg-wood-50' 
                        : 'border-wood-200 hover:border-wood-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="razorpay"
                      checked={paymentMethod === 'razorpay'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                      paymentMethod === 'razorpay' ? 'border-wood-700' : 'border-wood-300'
                    }`}>
                      {paymentMethod === 'razorpay' && (
                        <div className="w-3 h-3 rounded-full bg-wood-700" />
                      )}
                    </div>
                    <img 
                      src="https://razorpay.com/assets/razorpay-glyph.svg" 
                      alt="Razorpay" 
                      className="w-8 h-8 mr-3"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-wood-900">Pay with Razorpay</h4>
                      <p className="text-sm text-wood-600">
                        UPI, Cards, Net Banking, Wallets
                      </p>
                    </div>
                  </label>

                  {/* Demo Payment Option */}
                  <label 
                    className={`flex items-center p-4 border rounded-lg cursor-pointer transition ${
                      paymentMethod === 'demo' 
                        ? 'border-green-500 bg-green-50' 
                        : 'border-wood-200 hover:border-wood-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="demo"
                      checked={paymentMethod === 'demo'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                      paymentMethod === 'demo' ? 'border-green-500' : 'border-wood-300'
                    }`}>
                      {paymentMethod === 'demo' && (
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                      )}
                    </div>
                    <div className="w-8 h-8 mr-3 bg-green-100 rounded-lg flex items-center justify-center">
                      <TestTube className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-wood-900">Demo Payment</h4>
                      <p className="text-sm text-wood-600">
                        Test order without real payment
                      </p>
                    </div>
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                      For Testing
                    </span>
                  </label>
                </div>

                <button
                  onClick={handlePayment}
                  disabled={loading}
                  className={`w-full flex items-center justify-center py-3 px-4 rounded-lg font-semibold transition ${
                    paymentMethod === 'demo'
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'btn-primary'
                  }`}
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Processing...
                    </>
                  ) : paymentMethod === 'demo' ? (
                    <>
                      <TestTube className="w-5 h-5 mr-2" />
                      Place Demo Order - ₹{totalPrice.toLocaleString()}
                    </>
                  ) : (
                    <>Pay ₹{totalPrice.toLocaleString()}</>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 shadow-sm sticky top-24">
              <h2 className="font-serif text-xl font-bold text-wood-900 mb-6">
                Order Summary
              </h2>

              {/* Items */}
              <div className="space-y-4 max-h-64 overflow-y-auto mb-4">
                {cart.items.map((item) => (
                  <div key={item._id} className="flex gap-3">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-wood-100 flex-shrink-0">
                      {item.product?.images?.[0] ? (
                        <img
                          src={item.product.images[0].url}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-2xl font-serif text-wood-300">W</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-wood-900 text-sm truncate">
                        {item.product?.name}
                      </h4>
                      {item.customization?.text && (
                        <p className="text-xs text-wood-500">"{item.customization.text}"</p>
                      )}
                      <p className="text-sm text-wood-600">
                        ₹{item.price?.toLocaleString()} × {item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <hr className="border-wood-100 my-4" />

              {/* Totals */}
              <div className="space-y-3">
                <div className="flex justify-between text-wood-600">
                  <span>Subtotal</span>
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
