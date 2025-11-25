import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ShoppingCart, Minus, Plus, Star, Check, Truck, Shield, ArrowLeft, MessageSquare, ThumbsUp, User } from 'lucide-react';
import { productsAPI, reviewsAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import ProductCard from '../components/products/ProductCard';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, loading: cartLoading } = useCart();
  const { user } = useAuth();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState(null);
  const [customization, setCustomization] = useState({
    text: '',
    additionalNotes: ''
  });

  // Review states
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewPage, setReviewPage] = useState(1);
  const [reviewPages, setReviewPages] = useState(1);
  const [ratingDistribution, setRatingDistribution] = useState({ 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });
  const [canReview, setCanReview] = useState(false);
  const [existingReview, setExistingReview] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  // Similar products state
  const [similarProducts, setSimilarProducts] = useState([]);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchReviews();
      if (user) {
        checkCanReview();
      }
    }
  }, [id, user, reviewPage]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const { data } = await productsAPI.getById(id);
      setProduct(data);
      if (data.sizes?.length > 0) {
        setSelectedSize(data.sizes[0]);
      }
      // Fetch similar products based on categories
      if (data.categories?.length > 0) {
        fetchSimilarProducts(data.categories, data._id);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Product not found');
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  const fetchSimilarProducts = async (categories, currentProductId) => {
    try {
      // Get category IDs
      const categoryIds = categories.map(cat => cat._id || cat);
      // Fetch products from same categories
      const { data } = await productsAPI.getAll({ 
        category: categoryIds[0], // Use first category
        limit: 5 
      });
      // Filter out current product and limit to 4
      const filtered = data.products
        .filter(p => p._id !== currentProductId)
        .slice(0, 4);
      setSimilarProducts(filtered);
    } catch (error) {
      console.error('Error fetching similar products:', error);
    }
  };

  const fetchReviews = async () => {
    try {
      setReviewsLoading(true);
      const { data } = await reviewsAPI.getProductReviews(id, { page: reviewPage, limit: 5 });
      setReviews(data.reviews);
      setReviewPages(data.pages);
      setRatingDistribution(data.ratingDistribution);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setReviewsLoading(false);
    }
  };

  const checkCanReview = async () => {
    try {
      const { data } = await reviewsAPI.canReview(id);
      setCanReview(data.canReview);
      if (data.existingReview) {
        setExistingReview(data.existingReview);
      }
    } catch (error) {
      console.error('Error checking review eligibility:', error);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewForm.comment.trim()) {
      toast.error('Please write a review comment');
      return;
    }

    try {
      setSubmittingReview(true);
      await reviewsAPI.create(id, reviewForm);
      toast.success('Review submitted successfully!');
      setShowReviewForm(false);
      setReviewForm({ rating: 5, title: '', comment: '' });
      fetchReviews();
      fetchProduct(); // Refresh product to update rating
      checkCanReview();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleAddToCart = async () => {
    if (product.customizable && !customization.text) {
      toast.error('Please enter customization text');
      return;
    }

    const success = await addToCart(
      product._id,
      quantity,
      selectedSize,
      product.customizable ? customization : null
    );

    if (success) {
      // Optionally navigate to cart
      // navigate('/cart');
    }
  };

  const calculatePrice = () => {
    let basePrice = product.discountPrice || product.price;
    if (selectedSize?.priceModifier) {
      basePrice += selectedSize.priceModifier;
    }
    return basePrice * quantity;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-wood-100 rounded w-32 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="aspect-square bg-wood-100 rounded-xl"></div>
              <div className="space-y-4">
                <div className="h-8 bg-wood-100 rounded w-3/4"></div>
                <div className="h-6 bg-wood-100 rounded w-1/4"></div>
                <div className="h-24 bg-wood-100 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const displayPrice = product.discountPrice || product.price;
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;

  return (
    <div className="min-h-screen bg-cream-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-wood-600 hover:text-wood-800 mb-8"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Products
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div>
            {/* Main Image */}
            <div className="aspect-square rounded-xl overflow-hidden bg-white shadow-lg mb-4">
              {product.images?.length > 0 ? (
                <img
                  src={product.images[selectedImage].url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-wood-100">
                  <span className="text-9xl font-serif text-wood-300">W</span>
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {product.images?.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition ${
                      selectedImage === index ? 'border-wood-700' : 'border-transparent'
                    }`}
                  >
                    <img src={image.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            {/* Category & Name */}
            <span className="text-sm text-wood-500 uppercase tracking-wider">
              {product.category?.replace('-', ' ')}
            </span>
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-wood-900 mt-2">
              {product.name}
            </h1>

            {/* Rating */}
            {product.numReviews > 0 && (
              <div className="flex items-center mt-3">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(product.averageRating || 0)
                          ? 'text-yellow-500 fill-yellow-500'
                          : 'text-wood-200'
                      }`}
                    />
                  ))}
                </div>
                <span className="ml-2 text-wood-600">
                  {(product.averageRating || 0).toFixed(1)} ({product.numReviews} reviews)
                </span>
              </div>
            )}

            {/* Price */}
            <div className="mt-6">
              <div className="flex items-baseline">
                <span className="text-3xl font-bold text-wood-900">
                  ₹{displayPrice.toLocaleString()}
                </span>
                {hasDiscount && (
                  <>
                    <span className="text-xl text-wood-400 line-through ml-3">
                      ₹{product.price.toLocaleString()}
                    </span>
                    <span className="ml-3 bg-red-100 text-red-700 text-sm font-medium px-2 py-1 rounded">
                      {product.discountPercentage}% OFF
                    </span>
                  </>
                )}
              </div>
              <p className="text-sm text-wood-500 mt-1">Inclusive of all taxes</p>
            </div>

            {/* Description */}
            <p className="text-wood-600 mt-6 leading-relaxed">
              {product.description}
            </p>

            {/* Categories */}
            {product.categories?.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {product.categories.map((cat, idx) => (
                  <span key={idx} className="px-3 py-1 bg-wood-100 text-wood-700 text-sm rounded-full">
                    {cat.name || cat}
                  </span>
                ))}
              </div>
            )}

            {/* Size Selection */}
            {product.sizes?.length > 0 && (
              <div className="mt-6">
                <label className="block text-sm font-medium text-wood-700 mb-3">
                  Select Size
                </label>
                <div className="flex flex-wrap gap-3">
                  {product.sizes.map((size, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 rounded-lg border-2 transition ${
                        selectedSize?.name === size.name
                          ? 'border-wood-700 bg-wood-50'
                          : 'border-wood-200 hover:border-wood-400'
                      }`}
                    >
                      <span className="font-medium">{size.name}</span>
                      <span className="text-sm text-wood-500 ml-2">({size.dimensions})</span>
                      {size.priceModifier > 0 && (
                        <span className="text-sm text-wood-600 ml-2">
                          +₹{size.priceModifier}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Customization */}
            {product.customizable && (
              <div className="mt-6 p-4 bg-wood-50 rounded-xl">
                <h3 className="font-medium text-wood-900 mb-4">Customize Your Nameplate</h3>
                
                {/* Custom Text */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-wood-700 mb-2">
                    Your Text (Max {product.customizationOptions?.maxCharacters || 30} characters)
                  </label>
                  <input
                    type="text"
                    value={customization.text}
                    onChange={(e) => setCustomization(prev => ({ ...prev, text: e.target.value }))}
                    maxLength={product.customizationOptions?.maxCharacters || 30}
                    placeholder="Enter your name or text"
                    className="input-field"
                  />
                  <span className="text-xs text-wood-500 mt-1">
                    {customization.text.length}/{product.customizationOptions?.maxCharacters || 30} characters
                  </span>
                </div>

                {/* Additional Notes */}
                <div>
                  <label className="block text-sm font-medium text-wood-700 mb-2">
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    value={customization.additionalNotes}
                    onChange={(e) => setCustomization(prev => ({ ...prev, additionalNotes: e.target.value }))}
                    placeholder="Any special instructions..."
                    rows={2}
                    className="input-field resize-none"
                  />
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-wood-700 mb-3">
                Quantity
              </label>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-10 h-10 rounded-lg border border-wood-200 flex items-center justify-center hover:bg-wood-50"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                  className="w-10 h-10 rounded-lg border border-wood-200 flex items-center justify-center hover:bg-wood-50"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Stock Status */}
            <div className="mt-4">
              {product.stock > 0 ? (
                <div className="flex items-center text-green-600">
                  <Check className="w-5 h-5 mr-2" />
                  <span className="font-medium">In Stock</span>
                  {product.stock <= 5 && (
                    <span className="text-orange-600 ml-2">
                      (Only {product.stock} left!)
                    </span>
                  )}
                </div>
              ) : (
                <span className="text-red-600 font-medium">Out of Stock</span>
              )}
            </div>

            {/* Total Price */}
            <div className="mt-6 p-4 bg-white rounded-xl border border-wood-100">
              <div className="flex justify-between items-center">
                <span className="text-wood-600">Total Price:</span>
                <span className="text-2xl font-bold text-wood-900">
                  ₹{calculatePrice().toLocaleString()}
                </span>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0 || cartLoading}
              className="w-full btn-primary mt-6 flex items-center justify-center"
            >
              {cartLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              ) : (
                <ShoppingCart className="w-5 h-5 mr-2" />
              )}
              Add to Cart
            </button>

            {/* Features */}
            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="flex items-center text-wood-600">
                <Truck className="w-5 h-5 mr-2 text-wood-500" />
                <span className="text-sm">Free shipping over ₹999</span>
              </div>
              <div className="flex items-center text-wood-600">
                <Shield className="w-5 h-5 mr-2 text-wood-500" />
                <span className="text-sm">30-day guarantee</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Similar Products Section */}
        {similarProducts.length > 0 && (
          <div className="mt-16 border-t border-wood-200 pt-12">
            <div className="flex justify-between items-end mb-8">
              <div>
                <h2 className="text-2xl font-serif font-bold text-wood-900">Similar Products</h2>
                <p className="text-wood-600 mt-1">You might also like these</p>
              </div>
              <Link 
                to="/products" 
                className="text-wood-700 hover:text-wood-900 font-medium hidden sm:block"
              >
                View All →
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {similarProducts.map((similarProduct) => (
                <ProductCard key={similarProduct._id} product={similarProduct} />
              ))}
            </div>
          </div>
        )}

        {/* Reviews Section */}
        <div className="mt-16 border-t border-wood-200 pt-12">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Rating Summary */}
            <div className="lg:w-1/3">
              
              <div className="bg-white rounded-xl p-6 shadow-sm">
                {/* Average Rating */}
                <div className="text-center mb-6">
                  <div className="text-5xl font-bold text-wood-900">
                    {(product.averageRating || 0).toFixed(1)}
                  </div>
                  <div className="flex items-center justify-center mt-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.floor(product.averageRating || 0)
                            ? 'text-yellow-500 fill-yellow-500'
                            : 'text-wood-200'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-wood-500 mt-1">Based on {product.numReviews || 0} reviews</p>
                </div>

                {/* Rating Distribution */}
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((rating) => {
                    const count = ratingDistribution[rating] || 0;
                    const percentage = product.numReviews > 0 
                      ? (count / product.numReviews) * 100 
                      : 0;
                    return (
                      <div key={rating} className="flex items-center gap-2">
                        <span className="text-sm text-wood-600 w-3">{rating}</span>
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <div className="flex-1 h-2 bg-wood-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-yellow-500 rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-wood-500 w-8">{count}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Write Review Button */}
                <div className="mt-6">
                  {!user ? (
                    <button
                      onClick={() => navigate('/login')}
                      className="w-full btn-outline flex items-center justify-center"
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Login to Review
                    </button>
                  ) : canReview ? (
                    <button
                      onClick={() => setShowReviewForm(true)}
                      className="w-full btn-primary flex items-center justify-center"
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Write a Review
                    </button>
                  ) : existingReview ? (
                    <p className="text-center text-wood-500 text-sm">
                      You've already reviewed this product
                    </p>
                  ) : (
                    <p className="text-center text-wood-500 text-sm">
                      Only customers who purchased this product can review
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Reviews List */}
            <div className="lg:w-2/3">
              {/* Review Form Modal */}
              {showReviewForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
                    <h3 className="text-xl font-semibold text-wood-900 mb-4">Write a Review</h3>
                    <form onSubmit={handleSubmitReview}>
                      {/* Star Rating */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-wood-700 mb-2">
                          Your Rating
                        </label>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setReviewForm(prev => ({ ...prev, rating: star }))}
                              className="p-1"
                            >
                              <Star
                                className={`w-8 h-8 ${
                                  star <= reviewForm.rating
                                    ? 'text-yellow-500 fill-yellow-500'
                                    : 'text-wood-200'
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Title */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-wood-700 mb-2">
                          Review Title (Optional)
                        </label>
                        <input
                          type="text"
                          value={reviewForm.title}
                          onChange={(e) => setReviewForm(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="Summarize your review"
                          className="input-field"
                          maxLength={100}
                        />
                      </div>

                      {/* Comment */}
                      <div className="mb-6">
                        <label className="block text-sm font-medium text-wood-700 mb-2">
                          Your Review
                        </label>
                        <textarea
                          value={reviewForm.comment}
                          onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                          placeholder="Share your experience with this product..."
                          className="input-field resize-none"
                          rows={4}
                          maxLength={1000}
                          required
                        />
                        <p className="text-xs text-wood-500 mt-1">
                          {reviewForm.comment.length}/1000 characters
                        </p>
                      </div>

                      {/* Buttons */}
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => setShowReviewForm(false)}
                          className="flex-1 btn-outline"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={submittingReview}
                          className="flex-1 btn-primary flex items-center justify-center"
                        >
                          {submittingReview ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            'Submit Review'
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Reviews */}
              {reviewsLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-white rounded-xl p-6 shadow-sm animate-pulse">
                      <div className="flex gap-4">
                        <div className="w-10 h-10 bg-wood-100 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-wood-100 rounded w-1/4" />
                          <div className="h-3 bg-wood-100 rounded w-1/3" />
                          <div className="h-16 bg-wood-100 rounded mt-2" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review._id} className="bg-white rounded-xl p-6 shadow-sm">
                      <div className="flex gap-4">
                        <div className="w-10 h-10 bg-wood-200 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="w-5 h-5 text-wood-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-medium text-wood-900">{review.user?.name || 'Anonymous'}</h4>
                              <div className="flex items-center gap-2 mt-1">
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-4 h-4 ${
                                        i < review.rating
                                          ? 'text-yellow-500 fill-yellow-500'
                                          : 'text-wood-200'
                                      }`}
                                    />
                                  ))}
                                </div>
                                {review.isVerifiedPurchase && (
                                  <span className="text-xs text-green-600 flex items-center">
                                    <Check className="w-3 h-3 mr-1" />
                                    Verified Purchase
                                  </span>
                                )}
                              </div>
                            </div>
                            <span className="text-sm text-wood-500">
                              {new Date(review.createdAt).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                          {review.title && (
                            <h5 className="font-medium text-wood-800 mt-3">{review.title}</h5>
                          )}
                          <p className="text-wood-600 mt-2">{review.comment}</p>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Pagination */}
                  {reviewPages > 1 && (
                    <div className="flex justify-center gap-2 mt-6">
                      {[...Array(reviewPages)].map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setReviewPage(i + 1)}
                          className={`px-4 py-2 rounded-lg ${
                            reviewPage === i + 1
                              ? 'bg-wood-700 text-white'
                              : 'bg-wood-100 text-wood-700 hover:bg-wood-200'
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-xl p-12 text-center shadow-sm">
                  <MessageSquare className="w-12 h-12 text-wood-300 mx-auto mb-4" />
                  <h3 className="font-medium text-wood-900 mb-2">No reviews yet</h3>
                  <p className="text-wood-500">Be the first to review this product!</p>
                </div>
              )}
            </div>
          </div>
        </div>


      </div>
    </div>
  );
};

export default ProductDetail;
