import { useState, useEffect } from 'react';
import { Search, Eye, ChevronDown, Package, Calendar, User, X, AlertTriangle } from 'lucide-react';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusChangeModal, setStatusChangeModal] = useState({ open: false, orderId: null, orderNumber: '', currentStatus: '', newStatus: '', confirmStep: 1 });
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  useEffect(() => {
    fetchOrders();
  }, [page, searchTerm, statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data } = await adminAPI.getOrders({ 
        page, 
        search: searchTerm,
        status: statusFilter 
      });
      setOrders(data.orders);
      setTotalPages(data.pages);
    } catch (error) {
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (orderId, orderNumber, currentStatus, newStatus) => {
    if (currentStatus === newStatus) return;
    setStatusChangeModal({ open: true, orderId, orderNumber, currentStatus, newStatus, confirmStep: 1 });
  };

  // Check if this is a critical status change (to/from cancelled)
  const isCriticalChange = (currentStatus, newStatus) => {
    return currentStatus === 'cancelled' || newStatus === 'cancelled';
  };

  const handleConfirmClick = () => {
    const { currentStatus, newStatus, confirmStep } = statusChangeModal;
    // If critical change and still on step 1, go to step 2
    if (isCriticalChange(currentStatus, newStatus) && confirmStep === 1) {
      setStatusChangeModal(prev => ({ ...prev, confirmStep: 2 }));
    } else {
      // Otherwise proceed with the update
      confirmStatusUpdate();
    }
  };

  const confirmStatusUpdate = async () => {
    const { orderId, newStatus } = statusChangeModal;
    try {
      setUpdatingStatus(true);
      await adminAPI.updateOrderStatus(orderId, { status: newStatus });
      toast.success('Order status updated');
      fetchOrders();
      if (selectedOrder?._id === orderId) {
        const { data } = await adminAPI.getOrder(orderId);
        setSelectedOrder(data);
      }
    } catch (error) {
      toast.error('Failed to update order status');
    } finally {
      setUpdatingStatus(false);
      setStatusChangeModal({ open: false, orderId: null, orderNumber: '', currentStatus: '', newStatus: '', confirmStep: 1 });
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

  const viewOrderDetails = async (orderId) => {
    try {
      const { data } = await adminAPI.getOrder(orderId);
      setSelectedOrder(data);
    } catch (error) {
      toast.error('Failed to load order details');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-serif font-bold text-wood-900 mb-6">Orders</h1>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-wood-400" />
            <input
              type="text"
              placeholder="Search by order number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <div className="relative w-full sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field appearance-none pr-10"
            >
              {statusOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-wood-400 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Orders Table - Desktop */}
        <div className={`${selectedOrder ? 'lg:w-1/2' : 'w-full'} transition-all hidden md:block`}>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-wood-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-wood-700">Order</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-wood-700">Customer</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-wood-700">Total</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-wood-700">Status</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-wood-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-wood-100">
                  {loading ? (
                    [...Array(5)].map((_, i) => (
                      <tr key={i}>
                        <td colSpan={5} className="px-6 py-4">
                          <div className="animate-pulse h-12 bg-wood-100 rounded"></div>
                        </td>
                      </tr>
                    ))
                  ) : orders.length > 0 ? (
                    orders.map((order) => (
                      <tr 
                        key={order._id} 
                        className={`hover:bg-wood-50 cursor-pointer ${
                          selectedOrder?._id === order._id ? 'bg-wood-50' : ''
                        }`}
                        onClick={() => viewOrderDetails(order._id)}
                      >
                        <td className="px-6 py-4">
                          <p className="font-medium text-wood-900">{order.orderNumber}</p>
                          <p className="text-xs text-wood-500">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-wood-900">{order.user?.name || 'N/A'}</p>
                          <p className="text-sm text-wood-500">{order.user?.email}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-medium text-wood-900">
                            ₹{order.totalPrice?.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={order.orderStatus}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleStatusChange(order._id, order.orderNumber, order.orderStatus, e.target.value);
                            }}
                            className={`px-2 py-1 rounded-full text-xs font-medium capitalize border-0 cursor-pointer ${getStatusColor(order.orderStatus)}`}
                          >
                            {statusOptions.slice(1).map(opt => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              viewOrderDetails(order._id);
                            }}
                            className="p-2 text-wood-600 hover:text-wood-900 hover:bg-wood-100 rounded-lg"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-wood-500">
                        No orders found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination - Desktop */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-wood-100 flex justify-center">
                <div className="flex space-x-2">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i + 1)}
                      className={`px-4 py-2 rounded-lg ${
                        page === i + 1
                          ? 'bg-wood-700 text-white'
                          : 'bg-wood-100 text-wood-700 hover:bg-wood-200'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Orders Cards - Mobile */}
        <div className={`${selectedOrder ? 'hidden' : 'block'} md:hidden space-y-4`}>
          {loading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-4 shadow-sm">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-wood-100 rounded w-1/3"></div>
                  <div className="h-4 bg-wood-100 rounded w-1/2"></div>
                  <div className="h-8 bg-wood-100 rounded w-full"></div>
                </div>
              </div>
            ))
          ) : orders.length > 0 ? (
            orders.map((order) => (
              <div 
                key={order._id} 
                className="bg-white rounded-xl shadow-sm overflow-hidden"
                onClick={() => viewOrderDetails(order._id)}
              >
                <div className="p-4">
                  {/* Order Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-wood-500" />
                        <span className="font-medium text-wood-900">{order.orderNumber}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-sm text-wood-500">
                        <Calendar className="w-3 h-3" />
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(order.orderStatus)}`}>
                      {order.orderStatus}
                    </span>
                  </div>

                  {/* Customer */}
                  <div className="flex items-center gap-2 mb-3 text-sm">
                    <User className="w-4 h-4 text-wood-400" />
                    <span className="text-wood-700">{order.user?.name || 'N/A'}</span>
                  </div>

                  {/* Total & Actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-wood-100">
                    <span className="text-lg font-bold text-wood-900">
                      ₹{order.totalPrice?.toLocaleString()}
                    </span>
                    <div className="flex items-center gap-2">
                      <select
                        value={order.orderStatus}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleStatusChange(order._id, order.orderNumber, order.orderStatus, e.target.value);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className={`px-2 py-1 rounded-lg text-xs font-medium border-0 cursor-pointer ${getStatusColor(order.orderStatus)}`}
                      >
                        {statusOptions.slice(1).map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          viewOrderDetails(order._id);
                        }}
                        className="p-2 text-wood-600 hover:text-wood-900 hover:bg-wood-100 rounded-lg"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-xl p-8 text-center text-wood-500">
              No orders found
            </div>
          )}

          {/* Pagination - Mobile */}
          {totalPages > 1 && (
            <div className="flex justify-center py-4">
              <div className="flex space-x-2">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`px-3 py-2 rounded-lg text-sm ${
                      page === i + 1
                        ? 'bg-wood-700 text-white'
                        : 'bg-wood-100 text-wood-700 hover:bg-wood-200'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Order Details Panel */}
        {selectedOrder && (
          <>
            {/* Mobile: Full-screen modal */}
            <div className="md:hidden fixed inset-0 bg-black/50 z-50 flex items-end">
              <div className="bg-white rounded-t-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white p-4 border-b border-wood-100 flex items-center justify-between">
                  <h2 className="font-serif text-lg font-bold text-wood-900">
                    Order Details
                  </h2>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="p-2 text-wood-400 hover:text-wood-600 hover:bg-wood-100 rounded-full"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-4 space-y-4">
                  {/* Order Info */}
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-wood-600">Order Number</span>
                      <span className="font-medium text-wood-900">{selectedOrder.orderNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-wood-600">Date</span>
                      <span className="text-wood-900 text-sm">
                        {new Date(selectedOrder.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-wood-600">Status</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(selectedOrder.orderStatus)}`}>
                        {selectedOrder.orderStatus}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-wood-600">Payment</span>
                      <span className={`font-medium ${
                        selectedOrder.paymentInfo?.status === 'completed' ? 'text-green-600' : 'text-yellow-600'
                      }`}>
                        {selectedOrder.paymentInfo?.status}
                      </span>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="border-t border-wood-100 pt-4">
                    <h3 className="font-medium text-wood-900 mb-2">Customer</h3>
                    <p className="text-wood-700">{selectedOrder.user?.name}</p>
                    <p className="text-sm text-wood-500">{selectedOrder.user?.email}</p>
                  </div>

                  {/* Shipping Address */}
                  <div className="border-t border-wood-100 pt-4">
                    <h3 className="font-medium text-wood-900 mb-2">Shipping Address</h3>
                    <p className="text-wood-700">{selectedOrder.shippingAddress?.name}</p>
                    <p className="text-sm text-wood-600">
                      {selectedOrder.shippingAddress?.street}<br />
                      {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} - {selectedOrder.shippingAddress?.pincode}
                    </p>
                    <p className="text-sm text-wood-500 mt-1">
                      Phone: {selectedOrder.shippingAddress?.phone}
                    </p>
                  </div>

                  {/* Items */}
                  <div className="border-t border-wood-100 pt-4">
                    <h3 className="font-medium text-wood-900 mb-3">Items</h3>
                    <div className="space-y-3">
                      {selectedOrder.items?.map((item, index) => (
                        <div key={index} className="flex gap-3">
                          <div className="w-12 h-12 rounded bg-wood-100 flex-shrink-0">
                            {item.image && (
                              <img src={item.image} alt="" className="w-full h-full object-cover rounded" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-wood-900 truncate">{item.name}</p>
                            {item.customization?.text && (
                              <p className="text-xs text-wood-500">"{item.customization.text}"</p>
                            )}
                            {item.customization?.additionalNotes && (
                              <p className="text-xs text-wood-500">Notes: {item.customization.additionalNotes}</p>
                            )}
                            <p className="text-xs text-wood-600">
                              ₹{item.price} × {item.quantity}
                            </p>
                          </div>
                          <span className="text-sm font-medium text-wood-900">
                            ₹{(item.price * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Totals */}
                  <div className="border-t border-wood-100 pt-4 space-y-2">
                    <div className="flex justify-between text-wood-600">
                      <span>Items</span>
                      <span>₹{selectedOrder.itemsPrice?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-wood-600">
                      <span>Shipping</span>
                      <span>{selectedOrder.shippingPrice === 0 ? 'FREE' : `₹${selectedOrder.shippingPrice}`}</span>
                    </div>
                    <div className="flex justify-between text-wood-600">
                      <span>Tax</span>
                      <span>₹{selectedOrder.taxPrice?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold text-wood-900 pt-2 border-t border-wood-100">
                      <span>Total</span>
                      <span>₹{selectedOrder.totalPrice?.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Update Status */}
                  <div className="border-t border-wood-100 pt-4">
                    <label className="block text-sm font-medium text-wood-700 mb-2">
                      Update Status
                    </label>
                    <select
                      value={selectedOrder.orderStatus}
                      onChange={(e) => handleStatusChange(selectedOrder._id, selectedOrder.orderNumber, selectedOrder.orderStatus, e.target.value)}
                      className="input-field"
                    >
                      {statusOptions.slice(1).map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop: Side panel */}
            <div className="hidden md:block lg:w-1/2">
              <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-serif text-xl font-bold text-wood-900">
                    Order Details
                  </h2>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="text-wood-400 hover:text-wood-600"
                  >
                    ✕
                  </button>
                </div>

                {/* Order Info */}
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-wood-600">Order Number</span>
                    <span className="font-medium text-wood-900">{selectedOrder.orderNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-wood-600">Date</span>
                    <span className="text-wood-900">
                      {new Date(selectedOrder.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-wood-600">Status</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(selectedOrder.orderStatus)}`}>
                      {selectedOrder.orderStatus}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-wood-600">Payment</span>
                    <span className={`font-medium ${
                      selectedOrder.paymentInfo?.status === 'completed' ? 'text-green-600' : 'text-yellow-600'
                    }`}>
                      {selectedOrder.paymentInfo?.status}
                    </span>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="border-t border-wood-100 pt-4 mb-6">
                  <h3 className="font-medium text-wood-900 mb-2">Customer</h3>
                  <p className="text-wood-700">{selectedOrder.user?.name}</p>
                  <p className="text-sm text-wood-500">{selectedOrder.user?.email}</p>
                  <p className="text-sm text-wood-500">{selectedOrder.user?.phone}</p>
                </div>

                {/* Shipping Address */}
                <div className="border-t border-wood-100 pt-4 mb-6">
                  <h3 className="font-medium text-wood-900 mb-2">Shipping Address</h3>
                  <p className="text-wood-700">{selectedOrder.shippingAddress?.name}</p>
                  <p className="text-sm text-wood-600">
                    {selectedOrder.shippingAddress?.street}<br />
                    {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} - {selectedOrder.shippingAddress?.pincode}
                  </p>
                  <p className="text-sm text-wood-500 mt-1">
                    Phone: {selectedOrder.shippingAddress?.phone}
                  </p>
                </div>

                {/* Items */}
                <div className="border-t border-wood-100 pt-4 mb-6">
                  <h3 className="font-medium text-wood-900 mb-3">Items</h3>
                  <div className="space-y-3 max-h-48 overflow-y-auto">
                    {selectedOrder.items?.map((item, index) => (
                      <div key={index} className="flex gap-3">
                        <div className="w-12 h-12 rounded bg-wood-100 flex-shrink-0">
                          {item.image && (
                            <img src={item.image} alt="" className="w-full h-full object-cover rounded" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-wood-900">{item.name}</p>
                          {item.customization?.text && (
                            <p className="text-xs text-wood-500">"{item.customization.text}"</p>
                          )}
                          {item.customization?.additionalNotes && (
                            <p className="text-xs text-wood-500">Notes: {item.customization.additionalNotes}</p>
                          )}
                          <p className="text-xs text-wood-600">
                            ₹{item.price} × {item.quantity} = ₹{(item.price * item.quantity).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Totals */}
                <div className="border-t border-wood-100 pt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-wood-600">
                      <span>Items</span>
                      <span>₹{selectedOrder.itemsPrice?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-wood-600">
                      <span>Shipping</span>
                      <span>{selectedOrder.shippingPrice === 0 ? 'FREE' : `₹${selectedOrder.shippingPrice}`}</span>
                    </div>
                    <div className="flex justify-between text-wood-600">
                      <span>Tax</span>
                      <span>₹{selectedOrder.taxPrice?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold text-wood-900 pt-2 border-t border-wood-100">
                      <span>Total</span>
                      <span>₹{selectedOrder.totalPrice?.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Update Status */}
                <div className="mt-6">
                  <label className="block text-sm font-medium text-wood-700 mb-2">
                    Update Status
                  </label>
                  <select
                    value={selectedOrder.orderStatus}
                    onChange={(e) => handleStatusChange(selectedOrder._id, selectedOrder.orderNumber, selectedOrder.orderStatus, e.target.value)}
                    className="input-field"
                  >
                    {statusOptions.slice(1).map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Status Change Confirmation Modal */}
        {statusChangeModal.open && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              {/* Step indicator for critical changes */}
              {isCriticalChange(statusChangeModal.currentStatus, statusChangeModal.newStatus) && (
                <div className="flex items-center justify-center gap-2 mb-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    statusChangeModal.confirmStep >= 1 ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>1</div>
                  <div className={`w-8 h-1 ${statusChangeModal.confirmStep >= 2 ? 'bg-red-600' : 'bg-gray-200'}`}></div>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    statusChangeModal.confirmStep >= 2 ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>2</div>
                </div>
              )}

              <div className={`flex items-center justify-center w-12 h-12 rounded-full mx-auto mb-4 ${
                isCriticalChange(statusChangeModal.currentStatus, statusChangeModal.newStatus)
                  ? 'bg-red-100'
                  : 'bg-yellow-100'
              }`}>
                <AlertTriangle className={`w-6 h-6 ${
                  isCriticalChange(statusChangeModal.currentStatus, statusChangeModal.newStatus)
                    ? 'text-red-600'
                    : 'text-yellow-600'
                }`} />
              </div>

              {/* Step 1 content */}
              {statusChangeModal.confirmStep === 1 && (
                <>
                  <h3 className="text-lg font-semibold text-wood-900 text-center mb-2">
                    {isCriticalChange(statusChangeModal.currentStatus, statusChangeModal.newStatus)
                      ? '⚠️ Critical Status Change'
                      : 'Update Order Status?'}
                  </h3>
                  <p className="text-wood-600 text-center mb-4">
                    Change order <span className="font-medium">#{statusChangeModal.orderNumber}</span> status from{' '}
                    <span className={`font-medium capitalize ${getStatusColor(statusChangeModal.currentStatus)}`}>
                      {statusChangeModal.currentStatus}
                    </span>{' '}
                    to{' '}
                    <span className={`font-medium capitalize ${getStatusColor(statusChangeModal.newStatus)}`}>
                      {statusChangeModal.newStatus}
                    </span>?
                  </p>
                  {statusChangeModal.newStatus === 'cancelled' && (
                    <p className="text-sm text-red-600 text-center mb-4 bg-red-50 p-2 rounded-lg">
                      ⚠️ Cancelling will notify the customer and initiate a refund if payment was made.
                    </p>
                  )}
                  {statusChangeModal.currentStatus === 'cancelled' && (
                    <p className="text-sm text-orange-600 text-center mb-4 bg-orange-50 p-2 rounded-lg">
                      ⚠️ Reactivating a cancelled order is unusual. Make sure this is intentional.
                    </p>
                  )}
                  {statusChangeModal.newStatus === 'delivered' && (
                    <p className="text-sm text-green-600 text-center mb-4 bg-green-50 p-2 rounded-lg">
                      ✓ Customer will be notified that their order has been delivered.
                    </p>
                  )}
                </>
              )}

              {/* Step 2 content (double confirmation for critical changes) */}
              {statusChangeModal.confirmStep === 2 && (
                <>
                  <h3 className="text-lg font-semibold text-red-700 text-center mb-2">
                    🛑 Final Confirmation Required
                  </h3>
                  <p className="text-wood-600 text-center mb-4">
                    This is a <span className="font-bold text-red-600">critical action</span> that may affect payment processing and customer notifications.
                  </p>
                  {statusChangeModal.newStatus === 'cancelled' && (
                    <div className="text-sm text-red-700 bg-red-50 p-3 rounded-lg mb-4 space-y-1">
                      <p className="font-medium">Cancelling this order will:</p>
                      <ul className="list-disc list-inside text-red-600 space-y-1">
                        <li>Send cancellation email to customer</li>
                        <li>Initiate refund if payment was received</li>
                        <li>Update inventory counts</li>
                      </ul>
                    </div>
                  )}
                  {statusChangeModal.currentStatus === 'cancelled' && (
                    <div className="text-sm text-orange-700 bg-orange-50 p-3 rounded-lg mb-4 space-y-1">
                      <p className="font-medium">Reactivating this order will:</p>
                      <ul className="list-disc list-inside text-orange-600 space-y-1">
                        <li>Mark order as active again</li>
                        <li>May require manual payment verification</li>
                        <li>Customer may need to be contacted</li>
                      </ul>
                    </div>
                  )}
                  <p className="text-sm text-wood-500 text-center mb-4">
                    Are you absolutely sure you want to proceed?
                  </p>
                </>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setStatusChangeModal({ open: false, orderId: null, orderNumber: '', currentStatus: '', newStatus: '', confirmStep: 1 })}
                  disabled={updatingStatus}
                  className="flex-1 px-4 py-2 border border-wood-300 text-wood-700 rounded-lg hover:bg-wood-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmClick}
                  disabled={updatingStatus}
                  className={`flex-1 px-4 py-2 rounded-lg text-white flex items-center justify-center ${
                    isCriticalChange(statusChangeModal.currentStatus, statusChangeModal.newStatus)
                      ? 'bg-red-600 hover:bg-red-700' 
                      : 'bg-wood-700 hover:bg-wood-800'
                  }`}
                >
                  {updatingStatus ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    isCriticalChange(statusChangeModal.currentStatus, statusChangeModal.newStatus) && statusChangeModal.confirmStep === 1
                      ? 'Continue →'
                      : 'Confirm'
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

export default Orders;
