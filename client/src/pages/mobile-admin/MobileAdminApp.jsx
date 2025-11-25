import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  FolderTree,
  Menu,
  X,
  LogOut,
  RefreshCw
} from 'lucide-react';

// Import admin pages
import Dashboard from '../admin/Dashboard';
import Categories from '../admin/Categories';
import Products from '../admin/Products';
import Orders from '../admin/Orders';
import UsersPage from '../admin/Users';
import AdminLogin from './AdminLogin';

const MobileAdminApp = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Check for existing admin session
    const savedUser = localStorage.getItem('adminUser');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed.role === 'admin') {
          setUser(parsed);
        }
      } catch (e) {
        localStorage.removeItem('adminUser');
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('adminUser');
    setUser(null);
  };

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'categories', icon: FolderTree, label: 'Categories' },
    { id: 'products', icon: Package, label: 'Products' },
    { id: 'orders', icon: ShoppingCart, label: 'Orders' },
    { id: 'users', icon: Users, label: 'Users' },
  ];

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'categories':
        return <Categories />;
      case 'products':
        return <Products />;
      case 'orders':
        return <Orders />;
      case 'users':
        return <UsersPage />;
      default:
        return <Dashboard />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-wood-50 flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-wood-600 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-wood-50 flex">
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-wood-900 transform transition-transform duration-300
        lg:translate-x-0 lg:static lg:inset-auto
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b border-wood-700">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-wood-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-serif font-bold text-xl">A</span>
              </div>
              <span className="font-serif text-xl font-bold text-cream-100">Admin</span>
            </div>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-cream-100"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentPage(item.id);
                  setSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center px-4 py-3 rounded-lg transition-colors text-left
                  ${currentPage === item.id 
                    ? 'bg-wood-700 text-white' 
                    : 'text-cream-300 hover:bg-wood-800 hover:text-white'}
                `}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.label}
              </button>
            ))}
          </nav>

          {/* User Info */}
          <div className="p-4 border-t border-wood-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-wood-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="ml-3">
                  <p className="text-white font-medium text-sm">{user?.name}</p>
                  <p className="text-cream-400 text-xs">Admin</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="text-cream-400 hover:text-white p-2"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen w-full">
        {/* Top Bar */}
        <header className="bg-white shadow-sm sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 py-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-wood-700"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-serif font-bold text-wood-900 capitalize">
              {currentPage}
            </h1>
            <button
              onClick={() => window.location.reload()}
              className="text-wood-600 hover:text-wood-800 p-2"
              title="Refresh"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-x-hidden">
          {renderPage()}
        </main>
      </div>
    </div>
  );
};

export default MobileAdminApp;
