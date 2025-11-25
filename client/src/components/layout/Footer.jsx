import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Instagram, Twitter } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-wood-900 text-cream-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-wood-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-serif font-bold text-xl">A</span>
              </div>
              <span className="font-serif text-xl font-bold text-cream-100">
                Ambikamber
              </span>
            </Link>
            <p className="text-cream-300 text-sm leading-relaxed">
              Handcrafted wooden nameplates that bring elegance and warmth to your home. 
              Each piece is carefully crafted with premium wood and attention to detail.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-serif font-bold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/products" className="text-cream-300 hover:text-cream-100 transition">
                  All Products
                </Link>
              </li>
              <li>
                <Link to="/products?category=door-nameplate" className="text-cream-300 hover:text-cream-100 transition">
                  Door Nameplates
                </Link>
              </li>
              <li>
                <Link to="/products?category=desk-nameplate" className="text-cream-300 hover:text-cream-100 transition">
                  Desk Nameplates
                </Link>
              </li>
              <li>
                <Link to="/products?category=custom-nameplate" className="text-cream-300 hover:text-cream-100 transition">
                  Custom Designs
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="font-serif font-bold text-lg mb-4">Customer Service</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/orders" className="text-cream-300 hover:text-cream-100 transition">
                  Track Order
                </Link>
              </li>
              <li>
                <Link to="/profile" className="text-cream-300 hover:text-cream-100 transition">
                  My Account
                </Link>
              </li>
              <li>
                <a href="#" className="text-cream-300 hover:text-cream-100 transition">
                  Shipping Info
                </a>
              </li>
              <li>
                <a href="#" className="text-cream-300 hover:text-cream-100 transition">
                  Returns & Refunds
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-serif font-bold text-lg mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-3 text-cream-300">
                <Mail className="w-5 h-5" />
                <span>support@ambikamber.com</span>
              </li>
              <li className="flex items-center space-x-3 text-cream-300">
                <Phone className="w-5 h-5" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-start space-x-3 text-cream-300">
                <MapPin className="w-5 h-5 mt-0.5" />
                <span>123 Craft Street, Artisan Lane, Mumbai 400001</span>
              </li>
            </ul>
            
            {/* Social Links */}
            <div className="flex space-x-4 mt-6">
              <a href="#" className="text-cream-300 hover:text-cream-100 transition">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-cream-300 hover:text-cream-100 transition">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-cream-300 hover:text-cream-100 transition">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-wood-700 mt-10 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-cream-400 text-sm">
            © {new Date().getFullYear()} Ambikamber. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-cream-400 hover:text-cream-100 text-sm transition">
              Privacy Policy
            </a>
            <a href="#" className="text-cream-400 hover:text-cream-100 text-sm transition">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
