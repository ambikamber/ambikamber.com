import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Truck, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { ordersAPI } from '../services/api';
import toast from 'react-hot-toast';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const { data } = await ordersAPI.getById(id);
      setOrder(data);
    } catch (error) {
      toast.error('Order not found');
      navigate('/orders');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    try {
      setCancelling(true);
      await ordersAPI.cancel(id);
      toast.success('Order cancelled successfully');
      setShowCancelModal(false);
      fetchOrder();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: Clock,
      confirmed: CheckCircle,
      processing: Package,
      shipped: Truck,
      delivered: CheckCircle,
      cancelled: XCircle
    };
    return icons[status] || Clock;
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'text-yellow-600',
      confirmed: 'text-blue-600',
      processing: 'text-purple-600',
      shipped: 'text-indigo-600',
      delivered: 'text-green-600',
      cancelled: 'text-red-600'
    };
    return colors[status] || 'text-gray-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-wood-100 rounded w-32"></div>
            <div className="bg-white p-6 rounded-xl space-y-4">
              <div className="h-6 bg-wood-100 rounded w-1/3"></div>
              <div className="h-4 bg-wood-100 rounded w-1/2"></div>
              <div className="h-4 bg-wood-100 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) return null;

  const StatusIcon = getStatusIcon(order.orderStatus);

  return (
    <div className="min-h-screen bg-cream-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/orders')}
          className="flex items-center text-wood-600 hover:text-wood-800 mb-6"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Orders
        </button>

        {/* Order Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="font-serif text-2xl font-bold text-wood-900">
                Order #{order.orderNumber}
              </h1>
              <p className="text-wood-600 mt-1">
                Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            <div className={`flex items-center ${getStatusColor(order.orderStatus)}`}>
              <StatusIcon className="w-6 h-6 mr-2" />
              <span className="text-lg font-semibold capitalize">{order.orderStatus}</span>
            </div>
          </div>

          {/* Status History */}
          {order.statusHistory?.length > 0 && (
            <div className="mt-6 pt-6 border-t border-wood-100">
              <h3 className="font-medium text-wood-900 mb-4">Order Timeline</h3>
              <div className="space-y-3">
                {order.statusHistory.map((history, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className={`w-3 h-3 rounded-full mt-1.5 ${
                      index === 0 ? 'bg-wood-700' : 'bg-wood-300'
                    }`}></div>
                    <div>
                      <p className="font-medium text-wood-900 capitalize">{history.status}</p>
                      <p className="text-sm text-wood-600">{history.note}</p>
                      <p className="text-xs text-wood-500">
                        {new Date(history.date).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="font-serif text-xl font-bold text-wood-900 mb-6">
                Order Items
              </h2>

              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex gap-4 pb-4 border-b border-wood-100 last:border-0">
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-wood-100 flex-shrink-0">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-8 h-8 text-wood-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-wood-900">{item.name}</h3>
                      {item.customization?.text && (
                        <p className="text-sm text-wood-600">Text: "{item.customization.text}"</p>
                      )}
                      {item.customization?.additionalNotes && (
                        <p className="text-sm text-wood-600">Notes: {item.customization.additionalNotes}</p>
                      )}
                      {item.selectedSize && (
                        <p className="text-sm text-wood-600">Size: {item.selectedSize.name}</p>
                      )}
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-wood-600">Qty: {item.quantity}</span>
                        <span className="font-semibold text-wood-900">
                          ₹{(item.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary & Shipping */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="font-serif text-lg font-bold text-wood-900 mb-4">
                Order Summary
              </h2>

              <div className="space-y-3">
                <div className="flex justify-between text-wood-600">
                  <span>Items Total</span>
                  <span>₹{order.itemsPrice?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-wood-600">
                  <span>Shipping</span>
                  <span>{order.shippingPrice === 0 ? 'FREE' : `₹${order.shippingPrice}`}</span>
                </div>
                <div className="flex justify-between text-wood-600">
                  <span>Tax (GST)</span>
                  <span>₹{order.taxPrice?.toLocaleString()}</span>
                </div>
                <hr className="border-wood-100" />
                <div className="flex justify-between text-lg font-bold text-wood-900">
                  <span>Total</span>
                  <span>₹{order.totalPrice?.toLocaleString()}</span>
                </div>
              </div>

              {/* Payment Status */}
              <div className="mt-4 pt-4 border-t border-wood-100">
                <div className="flex items-center justify-between">
                  <span className="text-wood-600">Payment</span>
                  <span className={`font-medium capitalize ${
                    order.paymentInfo?.status === 'completed' ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    {order.paymentInfo?.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="font-serif text-lg font-bold text-wood-900 mb-4">
                Shipping Address
              </h2>
              <div className="text-wood-600">
                <p className="font-medium text-wood-900">{order.shippingAddress?.name}</p>
                <p>{order.shippingAddress?.street}</p>
                <p>
                  {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
                </p>
                <p className="mt-2">Phone: {order.shippingAddress?.phone}</p>
                <p>Email: {order.shippingAddress?.email}</p>
              </div>
            </div>

            {/* Cancel Button */}
            {['pending', 'confirmed'].includes(order.orderStatus) && (
              <button
                onClick={() => setShowCancelModal(true)}
                className="w-full py-3 border-2 border-red-500 text-red-500 rounded-lg font-medium hover:bg-red-50 transition"
              >
                Cancel Order
              </button>
            )}
          </div>
        </div>

        {/* Cancel Order Confirmation Modal */}
        {showCancelModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-wood-900 text-center mb-2">
                Cancel Order?
              </h3>
              <p className="text-wood-600 text-center mb-2">
                Are you sure you want to cancel order <span className="font-medium">#{order.orderNumber}</span>?
              </p>
              <p className="text-sm text-red-600 text-center mb-6 bg-red-50 p-2 rounded-lg">
                ⚠️ This action cannot be undone. Any payment made will be refunded within 5-7 business days.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCancelModal(false)}
                  disabled={cancelling}
                  className="flex-1 px-4 py-2 border border-wood-300 text-wood-700 rounded-lg hover:bg-wood-50"
                >
                  Keep Order
                </button>
                <button
                  onClick={handleCancelOrder}
                  disabled={cancelling}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center"
                >
                  {cancelling ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'Yes, Cancel'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetail;
