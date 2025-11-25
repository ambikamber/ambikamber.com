import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Truck, Shield, Award, Palette, ChevronLeft, ChevronRight } from 'lucide-react';
import { productsAPI, categoriesAPI } from '../services/api';
import ProductCard from '../components/products/ProductCard';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const carouselRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          productsAPI.getFeatured(),
          categoriesAPI.getAll()
        ]);
        setFeaturedProducts(productsRes.data);
        // Get all active categories sorted by displayOrder
        const activeCategories = categoriesRes.data
          .filter(cat => cat.isActive)
          .sort((a, b) => a.displayOrder - b.displayOrder);
        setCategories(activeCategories);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const scrollCarousel = (direction) => {
    if (carouselRef.current) {
      const scrollAmount = 200;
      carouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const features = [
    {
      icon: Award,
      title: 'Premium Quality',
      description: 'Handcrafted from the finest woods with expert craftsmanship'
    },
    {
      icon: Palette,
      title: 'Fully Customizable',
      description: 'Choose your text, font, and design to match your style'
    },
    {
      icon: Truck,
      title: 'Free Shipping',
      description: 'Free delivery on orders above ₹999 across India'
    },
    {
      icon: Shield,
      title: 'Quality Guarantee',
      description: '30-day money-back guarantee on all products'
    },
  ];

  return (
    <div className="fade-in">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-wood-800 to-wood-950 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920')] bg-cover bg-center"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="max-w-3xl">
            <h1 className="font-serif text-4xl md:text-6xl font-bold leading-tight">
              Handcrafted Wooden Nameplates
              <span className="block text-wood-300 mt-2">For Every Space</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-cream-200 leading-relaxed">
              Add a touch of elegance to your home or office with our premium, 
              customizable wooden nameplates. Each piece is carefully crafted 
              from the finest wood to create a lasting impression.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Link to="/products" className="btn-primary bg-cream-100 text-wood-900 hover:bg-white inline-flex items-center justify-center">
                Shop Now
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-cream-50 to-transparent"></div>
      </section>

      

      {/* Categories Section */}
      <section className="py-16 bg-cream-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="section-title">Shop by Category</h2>
            <p className="section-subtitle">Find the perfect nameplate for every space</p>
          </div>

          {categories.length > 0 ? (
            <div className="relative">
              {/* Left Arrow */}
              <button
                onClick={() => scrollCarousel('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center text-wood-700 hover:bg-wood-50 transition-colors -ml-2 md:-ml-5 hidden sm:flex"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* Carousel Container */}
              <div
                ref={carouselRef}
                className="flex gap-6 overflow-x-auto scrollbar-hide px-2 py-4 snap-x snap-mandatory"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {categories.map((category) => (
                  <Link
                    key={category._id}
                    to={`/products?category=${category._id}`}
                    className="flex-shrink-0 flex flex-col items-center gap-3 group snap-center"
                  >
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden ring-2 ring-wood-200 group-hover:ring-wood-500 group-hover:ring-4 transition-all duration-300 shadow-md">
                      {category.image?.url ? (
                        <img
                          src={category.image.url}
                          alt={category.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-wood-600 to-wood-800 flex items-center justify-center">
                          <span className="text-white text-2xl font-serif">{category.name.charAt(0)}</span>
                        </div>
                      )}
                    </div>
                    <span className="text-sm md:text-base font-medium text-wood-800 text-center w-20 md:w-24 leading-tight line-clamp-2 group-hover:text-wood-600 transition-colors">
                      {category.name}
                    </span>
                  </Link>
                ))}
              </div>

              {/* Right Arrow */}
              <button
                onClick={() => scrollCarousel('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center text-wood-700 hover:bg-wood-50 transition-colors -mr-2 md:-mr-5 hidden sm:flex"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="text-center py-12 text-wood-500">
              <p>No categories available yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="section-title">Featured Products</h2>
              <p className="section-subtitle">Our most popular handcrafted nameplates</p>
            </div>
            <Link to="/products" className="btn-outline hidden sm:inline-flex items-center">
              View All
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="card animate-pulse">
                  <div className="aspect-square bg-wood-100"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-wood-100 rounded w-1/3"></div>
                    <div className="h-6 bg-wood-100 rounded w-3/4"></div>
                    <div className="h-6 bg-wood-100 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.slice(0, 8).map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-wood-600">No featured products yet. Check back soon!</p>
            </div>
          )}

          <div className="text-center mt-10 sm:hidden">
            <Link to="/products" className="btn-primary inline-flex items-center">
              View All Products
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-6">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-wood-100 rounded-full mb-4">
                  <feature.icon className="w-7 h-7 text-wood-700" />
                </div>
                <h3 className="font-serif font-semibold text-lg text-wood-900">{feature.title}</h3>
                <p className="text-wood-600 mt-2">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-wood-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-bold">
            Want Something Unique?
          </h2>
          <p className="mt-4 text-cream-200 text-lg">
            Create a custom nameplate that perfectly matches your style. 
            Choose your wood, design, and personalization options.
          </p>
          <Link 
            to="/products?category=custom-nameplate" 
            className="btn-primary bg-cream-100 text-wood-900 hover:bg-white mt-8 inline-flex items-center"
          >
            Design Your Own
            <Palette className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
