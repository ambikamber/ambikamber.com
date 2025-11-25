import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, ShoppingCart, User, LogOut, Package, Truck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate('/');
  };

  return (
    <>
      {/* Top Banner */}
      <div className="bg-wood-700 text-white text-center py-2 px-4">
        <div className="flex items-center justify-center gap-2 text-sm font-medium">
          <Truck className="w-4 h-4" />
          <span>🇮🇳 Pan India Delivery Available</span>
        </div>
      </div>
      
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-wood-700 rounded-lg flex items-center justify-center">
                  <span className="text-white font-serif font-bold text-xl">A</span>
                </div>
                <span className="font-serif text-xl font-bold text-wood-800 hidden sm:block">
                Ambikamber
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-wood-700 hover:text-wood-900 font-medium transition">
              Home
            </Link>
            
            <Link to="/products" className="text-wood-700 hover:text-wood-900 font-medium transition">
              Products
            </Link>
          </div>

          {/* Right side icons */}
          <div className="flex items-center space-x-4">
            {/* Cart */}
            <Link to="/cart" className="relative p-2 text-wood-700 hover:text-wood-900 transition">
              <ShoppingCart className="w-6 h-6" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-wood-700 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 p-2 text-wood-700 hover:text-wood-900 transition"
                >
                  <User className="w-6 h-6" />
                  <span className="hidden sm:block font-medium">{user?.name?.split(' ')[0]}</span>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                    <Link
                      to="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center px-4 py-2 text-wood-700 hover:bg-wood-50"
                    >
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </Link>
                    <Link
                      to="/orders"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center px-4 py-2 text-wood-700 hover:bg-wood-50"
                    >
                      <Package className="w-4 h-4 mr-2" />
                      My Orders
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center px-4 py-2 text-wood-700 hover:bg-wood-50"
                      >
                        <Package className="w-4 h-4 mr-2" />
                        Admin Panel
                      </Link>
                    )}
                    <hr className="my-2 border-wood-100" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-wood-700 hover:bg-wood-50"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center space-x-2">
                <Link to="/login" className="btn-outline text-sm">
                  Login
                </Link>
                <Link to="/register" className="btn-primary text-sm">
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 text-wood-700"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-wood-100">
            <Link
              to="/"
              onClick={() => setIsOpen(false)}
              className="block py-2 text-wood-700 hover:text-wood-900 font-medium"
            >
              Home
            </Link>
            <Link
              to="/products"
              onClick={() => setIsOpen(false)}
              className="block py-2 text-wood-700 hover:text-wood-900 font-medium"
            >
              Products
            </Link>
            
            {!isAuthenticated && (
              <div className="flex space-x-2 mt-4 pt-4 border-t border-wood-100">
                <Link to="/login" onClick={() => setIsOpen(false)} className="btn-outline flex-1 text-center">
                  Login
                </Link>
                <Link to="/register" onClick={() => setIsOpen(false)} className="btn-primary flex-1 text-center">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        )}
        </div>
      </nav>
    </>
  );
};

export default Navbar;
