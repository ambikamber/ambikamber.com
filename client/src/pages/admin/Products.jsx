import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, X, Upload, Image, Check, AlertTriangle } from 'lucide-react';
import { adminAPI, categoriesAPI } from '../../services/api';
import toast from 'react-hot-toast';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteModal, setDeleteModal] = useState({ open: false, product: null });
  const [deleting, setDeleting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    discountPrice: '',
    categories: [], // Changed to array for multiple categories
    stock: '10',
    featured: false,
    customizable: true,
    sizes: [],
    images: [],
    removeImages: [] // Track images to remove when editing
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [page, searchTerm]);

  const fetchCategories = async () => {
    try {
      const { data } = await categoriesAPI.getAll();
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data } = await adminAPI.getProducts({ page, search: searchTerm });
      setProducts(data.products);
      setTotalPages(data.pages);
    } catch (error) {
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }));
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const removeExistingImage = (publicId) => {
    setFormData(prev => ({
      ...prev,
      removeImages: [...prev.removeImages, publicId]
    }));
  };

  const handleAddSize = () => {
    setFormData(prev => ({
      ...prev,
      sizes: [...prev.sizes, { name: '', dimensions: '', priceModifier: 0 }]
    }));
  };

  const handleSizeChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.map((size, i) => 
        i === index ? { ...size, [field]: value } : size
      )
    }));
  };

  const removeSize = (index) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.filter((_, i) => i !== index)
    }));
  };

  const openModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      // Extract category IDs from populated categories array
      const categoryIds = product.categories?.map(cat => cat._id || cat) || [];
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        discountPrice: product.discountPrice?.toString() || '',
        categories: categoryIds,
        stock: product.stock.toString(),
        featured: product.featured,
        customizable: product.customizable,
        sizes: product.sizes || [],
        images: [],
        removeImages: []
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        discountPrice: '',
        categories: [],
        stock: '10',
        featured: false,
        customizable: true,
        sizes: [],
        images: [],
        removeImages: []
      });
    }
    setShowModal(true);
  };

  const handleCategoryToggle = (categoryId) => {
    setFormData(prev => {
      const isSelected = prev.categories.includes(categoryId);
      return {
        ...prev,
        categories: isSelected
          ? prev.categories.filter(id => id !== categoryId)
          : [...prev.categories, categoryId]
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.description || !formData.price) {
      toast.error('Please fill in required fields');
      return;
    }

    if (formData.categories.length === 0) {
      toast.error('Please select at least one category');
      return;
    }

    try {
      setSubmitting(true);
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('description', formData.description);
      submitData.append('price', formData.price);
      if (formData.discountPrice) submitData.append('discountPrice', formData.discountPrice);
      submitData.append('categories', JSON.stringify(formData.categories));
      submitData.append('stock', formData.stock);
      submitData.append('featured', formData.featured);
      submitData.append('customizable', formData.customizable);
      submitData.append('sizes', JSON.stringify(formData.sizes));
      
      // Add new images
      formData.images.forEach(image => {
        submitData.append('images', image);
      });

      // Add images to remove (for editing)
      if (formData.removeImages.length > 0) {
        submitData.append('removeImages', JSON.stringify(formData.removeImages));
      }

      if (editingProduct) {
        await adminAPI.updateProduct(editingProduct._id, submitData);
        toast.success('Product updated successfully');
      } else {
        await adminAPI.createProduct(submitData);
        toast.success('Product created successfully');
      }

      setShowModal(false);
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.product) return;

    try {
      setDeleting(true);
      await adminAPI.deleteProduct(deleteModal.product._id);
      toast.success('Product deleted successfully');
      setDeleteModal({ open: false, product: null });
      fetchProducts();
    } catch (error) {
      toast.error('Failed to delete product');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-serif font-bold text-wood-900">Products</h1>
        <button
          onClick={() => openModal()}
          className="btn-primary flex items-center justify-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Product
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-wood-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* Products Table - Desktop */}
      <div className="hidden md:block bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-wood-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-wood-700">Product</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-wood-700">Categories</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-wood-700">Price</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-wood-700">Stock</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-wood-700">Status</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-wood-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-wood-100">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="px-6 py-4">
                      <div className="animate-pulse h-12 bg-wood-100 rounded"></div>
                    </td>
                  </tr>
                ))
              ) : products.length > 0 ? (
                products.map((product) => (
                  <tr key={product._id} className="hover:bg-wood-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-wood-100 mr-3">
                          {product.images?.[0] ? (
                            <img src={product.images[0].url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Image className="w-6 h-6 text-wood-400" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-wood-900">{product.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {product.categories?.length > 0 ? (
                          product.categories.map(cat => (
                            <span 
                              key={cat._id || cat} 
                              className="px-2 py-0.5 text-xs bg-wood-100 text-wood-700 rounded-full"
                            >
                              {cat.name || cat}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-400 text-sm">No category</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <span className="font-medium text-wood-900">
                          ₹{product.discountPrice?.toLocaleString() || product.price?.toLocaleString()}
                        </span>
                        {product.discountPrice && (
                          <span className="text-sm text-wood-400 line-through ml-2">
                            ₹{product.price?.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-medium ${product.stock <= 5 ? 'text-red-600' : 'text-wood-900'}`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        product.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {product.isActive ? 'Active' : 'Inactive'}
                      </span>
                      {product.featured && (
                        <span className="ml-2 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Featured
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => openModal(product)}
                          className="p-2 text-wood-600 hover:text-wood-900 hover:bg-wood-100 rounded-lg"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setDeleteModal({ open: true, product })}
                          className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-wood-500">
                    No products found
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

      {/* Products Cards - Mobile */}
      <div className="md:hidden space-y-4">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-4 shadow-sm">
              <div className="animate-pulse space-y-3">
                <div className="h-20 bg-wood-100 rounded"></div>
                <div className="h-4 bg-wood-100 rounded w-3/4"></div>
                <div className="h-4 bg-wood-100 rounded w-1/2"></div>
              </div>
            </div>
          ))
        ) : products.length > 0 ? (
          products.map((product) => (
            <div key={product._id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-4">
                <div className="flex items-start gap-3">
                  {/* Product Image */}
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-wood-100 flex-shrink-0">
                    {product.images?.[0] ? (
                      <img src={product.images[0].url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Image className="w-8 h-8 text-wood-400" />
                      </div>
                    )}
                  </div>
                  
                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-wood-900 truncate">{product.name}</h3>
                    
                    {/* Categories */}
                    <div className="flex flex-wrap gap-1 mt-1">
                      {product.categories?.length > 0 ? (
                        product.categories.slice(0, 2).map(cat => (
                          <span 
                            key={cat._id || cat} 
                            className="px-2 py-0.5 text-xs bg-wood-100 text-wood-700 rounded-full"
                          >
                            {cat.name || cat}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-400 text-xs">No category</span>
                      )}
                      {product.categories?.length > 2 && (
                        <span className="text-xs text-wood-500">+{product.categories.length - 2}</span>
                      )}
                    </div>

                    {/* Price */}
                    <div className="mt-2">
                      <span className="font-semibold text-wood-900">
                        ₹{product.discountPrice?.toLocaleString() || product.price?.toLocaleString()}
                      </span>
                      {product.discountPrice && (
                        <span className="text-sm text-wood-400 line-through ml-2">
                          ₹{product.price?.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status Row */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-wood-100">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      product.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {product.isActive ? 'Active' : 'Inactive'}
                    </span>
                    {product.featured && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Featured
                      </span>
                    )}
                    <span className={`text-sm ${product.stock <= 5 ? 'text-red-600' : 'text-wood-600'}`}>
                      Stock: {product.stock}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openModal(product)}
                      className="p-2 text-wood-600 hover:text-wood-900 hover:bg-wood-100 rounded-lg"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setDeleteModal({ open: true, product })}
                      className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-xl p-8 text-center text-wood-500">
            No products found
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-wood-100">
              <h2 className="font-serif text-xl font-bold text-wood-900">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-wood-400 hover:text-wood-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-wood-700 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="Enter product name"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-wood-700 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="input-field resize-none"
                  placeholder="Product description"
                />
              </div>

              {/* Price & Discount */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-wood-700 mb-2">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-wood-700 mb-2">
                    Discount Price (₹)
                  </label>
                  <input
                    type="number"
                    name="discountPrice"
                    value={formData.discountPrice}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Categories - Multiple Selection */}
              <div>
                <label className="block text-sm font-medium text-wood-700 mb-2">
                  Categories * <span className="text-xs text-gray-500">(Select one or more)</span>
                </label>
                {categories.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2 p-3 border border-gray-200 rounded-lg max-h-48 overflow-y-auto">
                    {categories.map(cat => (
                      <label
                        key={cat._id}
                        className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                          formData.categories.includes(cat._id)
                            ? 'bg-wood-100 border border-wood-300'
                            : 'bg-gray-50 border border-transparent hover:bg-gray-100'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-colors ${
                            formData.categories.includes(cat._id)
                              ? 'bg-wood-600 border-wood-600'
                              : 'border-gray-300'
                          }`}
                        >
                          {formData.categories.includes(cat._id) && (
                            <Check className="w-3 h-3 text-white" />
                          )}
                        </div>
                        <input
                          type="checkbox"
                          checked={formData.categories.includes(cat._id)}
                          onChange={() => handleCategoryToggle(cat._id)}
                          className="sr-only"
                        />
                        <span className="text-sm text-gray-700">{cat.name}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-red-500">
                    No categories found. Please add categories first.
                  </p>
                )}
                {formData.categories.length > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.categories.length} category(ies) selected
                  </p>
                )}
              </div>

              {/* Stock */}
              <div>
                <label className="block text-sm font-medium text-wood-700 mb-2">
                  Stock
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="10"
                />
              </div>

              {/* Sizes */}
              <div>
                <label className="block text-sm font-medium text-wood-700 mb-2">
                  Sizes
                </label>
                {formData.sizes.map((size, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Name (e.g., Small)"
                      value={size.name}
                      onChange={(e) => handleSizeChange(index, 'name', e.target.value)}
                      className="input-field flex-1"
                    />
                    <input
                      type="text"
                      placeholder="Dimensions"
                      value={size.dimensions}
                      onChange={(e) => handleSizeChange(index, 'dimensions', e.target.value)}
                      className="input-field flex-1"
                    />
                    <input
                      type="number"
                      placeholder="+₹"
                      value={size.priceModifier}
                      onChange={(e) => handleSizeChange(index, 'priceModifier', Number(e.target.value))}
                      className="input-field w-24"
                    />
                    <button
                      type="button"
                      onClick={() => removeSize(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddSize}
                  className="btn-outline text-sm"
                >
                  + Add Size
                </button>
              </div>

              {/* Images */}
              <div>
                <label className="block text-sm font-medium text-wood-700 mb-2">
                  Images <span className="text-xs text-gray-500">(Up to 5 images)</span>
                </label>
                
                {/* Existing Images */}
                {editingProduct?.images?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {editingProduct.images
                      .filter(img => !formData.removeImages.includes(img.public_id))
                      .map((img, index) => (
                        <div key={index} className="relative group">
                          <img src={img.url} alt="" className="w-20 h-20 object-cover rounded-lg" />
                          <button
                            type="button"
                            onClick={() => removeExistingImage(img.public_id)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Remove image"
                          >
                            <X className="w-3 h-3" />
                          </button>
                          <span className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs text-center py-0.5 rounded-b-lg">
                            Saved
                          </span>
                        </div>
                      ))}
                  </div>
                )}

                {/* Show removed count */}
                {formData.removeImages.length > 0 && (
                  <p className="text-xs text-orange-600 mb-2">
                    {formData.removeImages.length} image(s) will be removed on save
                  </p>
                )}

                {/* New Images */}
                {formData.images.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {formData.images.map((file, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(file)}
                          alt=""
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Remove image"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        <span className="absolute bottom-0 left-0 right-0 bg-green-600/80 text-white text-xs text-center py-0.5 rounded-b-lg">
                          New
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Calculate remaining slots */}
                {(() => {
                  const existingCount = editingProduct?.images?.filter(img => !formData.removeImages.includes(img.public_id)).length || 0;
                  const newCount = formData.images.length;
                  const totalCount = existingCount + newCount;
                  const canAddMore = totalCount < 5;
                  
                  return canAddMore ? (
                    <label className="flex items-center justify-center w-full h-24 border-2 border-dashed border-wood-300 rounded-lg cursor-pointer hover:border-wood-400 transition-colors">
                      <div className="flex flex-col items-center text-wood-500">
                        <Upload className="w-5 h-5 mb-1" />
                        <span className="text-sm">Upload Images</span>
                        <span className="text-xs text-gray-400">({5 - totalCount} remaining)</span>
                      </div>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  ) : (
                    <p className="text-sm text-center text-gray-500 py-4 border-2 border-dashed border-gray-200 rounded-lg">
                      Maximum 5 images reached
                    </p>
                  );
                })()}
              </div>

              {/* Checkboxes */}
              <div className="flex space-x-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-wood-700 border-wood-300 rounded focus:ring-wood-500"
                  />
                  <span className="ml-2 text-wood-700">Featured Product</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="customizable"
                    checked={formData.customizable}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-wood-700 border-wood-300 rounded focus:ring-wood-500"
                  />
                  <span className="ml-2 text-wood-700">Customizable</span>
                </label>
              </div>

              {/* Submit */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={submitting}
                  className="btn-outline"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="btn-primary flex items-center justify-center min-w-[140px]"
                >
                  {submitting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    editingProduct ? 'Update Product' : 'Create Product'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-wood-900 text-center mb-2">
              Delete Product?
            </h3>
            <p className="text-wood-600 text-center mb-2">
              Are you sure you want to delete <span className="font-medium">"{deleteModal.product?.name}"</span>?
            </p>
            <p className="text-sm text-red-600 text-center mb-6 bg-red-50 p-2 rounded-lg">
              ⚠️ This action cannot be undone. All product data and images will be permanently deleted.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteModal({ open: false, product: null })}
                disabled={deleting}
                className="flex-1 px-4 py-2 border border-wood-300 text-wood-700 rounded-lg hover:bg-wood-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center"
              >
                {deleting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
