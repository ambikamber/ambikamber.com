import { useState, useEffect } from 'react';
import { Package, ShoppingCart, Users, DollarSign, TrendingUp } from 'lucide-react';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const { data } = await adminAPI.getDashboard();
      setStats(data);
    } catch (error) {
      toast.error('Failed to fetch dashboard data');
      console.error('Dashboard error:', error);
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
      <div className="animate-pulse space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-xl">
              <div className="h-8 bg-wood-100 rounded w-1/2 mb-2"></div>
              <div className="h-10 bg-wood-100 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Revenue',
      value: `₹${stats?.totalRevenue?.toLocaleString() || 0}`,
      icon: DollarSign,
      color: 'bg-green-500'
    },
    {
      title: 'Total Orders',
      value: stats?.totalOrders || 0,
      icon: ShoppingCart,
      color: 'bg-blue-500'
    },
    {
      title: 'Total Products',
      value: stats?.totalProducts || 0,
      icon: Package,
      color: 'bg-purple-500'
    },
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'bg-orange-500'
    }
  ];

  return (
    <div>
      <h1 className="text-2xl font-serif font-bold text-wood-900 mb-6">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-wood-600 text-sm">{stat.title}</p>
                <p className="text-2xl font-bold text-wood-900 mt-1">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-xl`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="font-serif text-lg font-bold text-wood-900 mb-4">
            Recent Orders
          </h2>
          
          {stats?.recentOrders?.length > 0 ? (
            <div className="space-y-4">
              {stats.recentOrders.map((order) => (
                <div key={order._id} className="flex items-center justify-between pb-4 border-b border-wood-100 last:border-0">
                  <div>
                    <p className="font-medium text-wood-900">{order.orderNumber}</p>
                    <p className="text-sm text-wood-600">{order.user?.name || 'N/A'}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-wood-900">
                      ₹{order.totalPrice?.toLocaleString()}
                    </p>
                    <span className={`text-xs px-2 py-1 rounded-full capitalize ${getStatusColor(order.orderStatus)}`}>
                      {order.orderStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-wood-500 text-center py-8">No orders yet</p>
          )}
        </div>

        {/* Orders by Status */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="font-serif text-lg font-bold text-wood-900 mb-4">
            Orders by Status
          </h2>
          
          {stats?.ordersByStatus?.length > 0 ? (
            <div className="space-y-4">
              {stats.ordersByStatus.map((item) => (
                <div key={item._id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className={`w-3 h-3 rounded-full mr-3 ${
                      item._id === 'delivered' ? 'bg-green-500' :
                      item._id === 'pending' ? 'bg-yellow-500' :
                      item._id === 'cancelled' ? 'bg-red-500' :
                      item._id === 'shipped' ? 'bg-indigo-500' :
                      'bg-blue-500'
                    }`}></span>
                    <span className="capitalize text-wood-700">{item._id}</span>
                  </div>
                  <span className="font-semibold text-wood-900">{item.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-wood-500 text-center py-8">No data available</p>
          )}
        </div>

        {/* Monthly Revenue */}
        <div className="bg-white rounded-xl shadow-sm p-6 lg:col-span-2">
          <h2 className="font-serif text-lg font-bold text-wood-900 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-wood-600" />
            Monthly Revenue (Last 6 months)
          </h2>
          
          {stats?.monthlyRevenue?.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {stats.monthlyRevenue.map((item, index) => {
                const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                return (
                  <div key={index} className="text-center p-4 bg-wood-50 rounded-lg">
                    <p className="text-sm text-wood-600">
                      {monthNames[item._id.month - 1]} {item._id.year}
                    </p>
                    <p className="text-lg font-bold text-wood-900 mt-1">
                      ₹{(item.revenue / 1000).toFixed(1)}K
                    </p>
                    <p className="text-xs text-wood-500">{item.orders} orders</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-wood-500 text-center py-8">No revenue data available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
