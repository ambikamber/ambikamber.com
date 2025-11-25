import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Eye, ShoppingBag } from 'lucide-react';
import { ordersAPI } from '../services/api';
import toast from 'react-hot-toast';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data } = await ordersAPI.getAll();
      setOrders(data);
    } catch (error) {
      toast.error('Failed to fetch orders');
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-purple-100 text-purple-800',
      shipped: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-wood-100 rounded w-48 mb-8"></div>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-xl">
                <div className="h-6 bg-wood-100 rounded w-1/3 mb-4"></div>
                <div className="h-4 bg-wood-100 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-cream-50 py-16">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="w-24 h-24 bg-wood-100 rounded-full mx-auto mb-6 flex items-center justify-center">
            <ShoppingBag className="w-12 h-12 text-wood-400" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-wood-900">No Orders Yet</h2>
          <p className="text-wood-600 mt-2">Start shopping to see your orders here</p>
          <Link to="/products" className="btn-primary mt-6 inline-block">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="section-title mb-8">My Orders</h1>

        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              {/* Order Header */}
              <div className="bg-wood-50 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-wood-600">
                    Order #{order.orderNumber}
                  </p>
                  <p className="text-xs text-wood-500">
                    Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(order.orderStatus)}`}>
                    {order.orderStatus}
                  </span>
                  <Link
                    to={`/orders/${order._id}`}
                    className="btn-outline text-sm py-2 flex items-center"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Link>
                </div>
              </div>

              {/* Order Items */}
              <div className="px-6 py-4">
                <div className="flex items-center gap-4 overflow-x-auto pb-2">
                  {order.items.slice(0, 3).map((item, index) => (
                    <div key={index} className="flex-shrink-0 flex items-center gap-3">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-wood-100">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-6 h-6 text-wood-400" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-wood-900 text-sm">{item.name}</p>
                        <p className="text-xs text-wood-500">Qty: {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <span className="text-wood-500 text-sm">
                      +{order.items.length - 3} more
                    </span>
                  )}
                </div>

                <div className="flex justify-between items-center mt-4 pt-4 border-t border-wood-100">
                  <span className="text-wood-600">Total Amount</span>
                  <span className="text-xl font-bold text-wood-900">
                    ₹{order.totalPrice.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Orders;
