import Product from '../models/Product.js';
import mongoose from 'mongoose';

export const getProducts = async (req, res) => {
  const { category, search, minPrice, maxPrice, farmer, location, sortBy, page, limit } = req.query;
  try {
    let query = {};

    if (category && category !== 'All') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } }
      ];
    }

    if (farmer) {
      if (mongoose.Types.ObjectId.isValid(farmer)) {
        query.farmer = farmer;
      }
    }

    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice && !isNaN(minPrice)) query.price.$gte = Number(minPrice);
      if (maxPrice && !isNaN(maxPrice)) query.price.$lte = Number(maxPrice);
    }

    // Sorting
    let sortOptions = { createdAt: -1 };
    if (sortBy === 'price_asc') sortOptions = { price: 1 };
    else if (sortBy === 'price_desc') sortOptions = { price: -1 };
    else if (sortBy === 'rating') sortOptions = { averageRating: -1 };
    else if (sortBy === 'newest') sortOptions = { createdAt: -1 };

    // Pagination
    if (page && limit) {
      const pageNum = Math.max(1, parseInt(page));
      const limitNum = Math.max(1, parseInt(limit));
      const skip = (pageNum - 1) * limitNum;

      const total = await Product.countDocuments(query);
      const products = await Product.find(query)
        .populate('farmer', 'name farmName location phone')
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum);

      return res.status(200).json({
        products,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        total
      });
    }

    // Default un-paginated array return for backward compatibility
    const products = await Product.find(query)
      .populate('farmer', 'name farmName location phone')
      .sort(sortOptions);

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProductById = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ message: 'Invalid Product ID' });
  }

  try {
    const product = await Product.findById(id).populate('farmer', 'name farmName location phone email');
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createProduct = async (req, res) => {
  const productData = req.body;

  // Stock and price validation
  const price = Number(productData.price);
  const quantity = Number(productData.quantity);

  if (isNaN(price) || price < 0) {
    return res.status(400).json({ message: "Price must be a valid positive number." });
  }
  if (isNaN(quantity) || quantity < 0) {
    return res.status(400).json({ message: "Quantity must be a valid non-negative number." });
  }

  // Handle uploaded images (multiple support up to 5)
  let imageList = [];
  if (req.files && req.files.length > 0) {
    imageList = req.files.map(f => f.path);
  } else if (req.file) {
    imageList = [req.file.path];
  } else if (productData.image) {
    imageList = [productData.image];
  }

  const primaryImage = imageList[0] || '';

  const newProduct = new Product({ 
    ...productData, 
    price,
    quantity,
    farmer: req.userId, 
    image: primaryImage,
    images: imageList,
    status: quantity > 0 ? 'Available' : 'Out of Stock',
    createdAt: new Date().toISOString() 
  });

  try {
    await newProduct.save();
    const populated = await Product.findById(newProduct._id).populate('farmer', 'name farmName location');
    
    if (req.io) {
      req.io.emit('product_created', populated);
    }
    
    res.status(201).json(populated);
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

export const updateProduct = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ message: 'No product with that ID' });
  }

  try {
    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Owner or Admin authorization check
    if (existingProduct.farmer && existingProduct.farmer.toString() !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Access denied. You do not own this product.' });
    }

    const updates = { ...req.body };

    if (updates.price !== undefined) {
      const price = Number(updates.price);
      if (isNaN(price) || price < 0) {
        return res.status(400).json({ message: 'Price must be a positive number.' });
      }
      updates.price = price;
    }

    if (updates.quantity !== undefined) {
      const quantity = Number(updates.quantity);
      if (isNaN(quantity) || quantity < 0) {
        return res.status(400).json({ message: 'Quantity must be a non-negative number.' });
      }
      updates.quantity = quantity;
      updates.status = quantity > 0 ? (updates.status || 'Available') : 'Out of Stock';
    }

    // Handle image updates if new files provided
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(f => f.path);
      updates.images = newImages;
      updates.image = newImages[0];
    } else if (req.file) {
      updates.images = [req.file.path];
      updates.image = req.file.path;
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, updates, { new: true })
      .populate('farmer', 'name farmName location');

    if (req.io) {
      req.io.emit('product_updated', updatedProduct);
    }

    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateStock = async (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).json({ message: 'No product with that id' });
  
  try {
    const existingProduct = await Product.findById(id);
    if (!existingProduct) return res.status(404).json({ message: 'Product not found' });

    if (existingProduct.farmer && existingProduct.farmer.toString() !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Access denied. You do not own this product.' });
    }

    const qty = Number(quantity);
    if (isNaN(qty) || qty < 0) {
      return res.status(400).json({ message: 'Invalid quantity value.' });
    }

    const status = qty > 0 ? 'Available' : 'Out of Stock';

    const updatedProduct = await Product.findByIdAndUpdate(id, { quantity: qty, status }, { new: true })
      .populate('farmer', 'name farmName location');
    
    if (req.io) {
      req.io.emit('product_stock_updated', updatedProduct);
    }
    
    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).json({ message: 'No product with that id' });
  
  try {
    const existingProduct = await Product.findById(id);
    if (!existingProduct) return res.status(404).json({ message: 'Product not found' });

    // Verify owner or admin
    if (existingProduct.farmer && existingProduct.farmer.toString() !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Access denied. You do not own this product.' });
    }

    await Product.findByIdAndDelete(id);
    
    if (req.io) {
      req.io.emit('product_deleted', { id });
    }
    
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addReview = async (req, res) => {
  const { id } = req.params;
  const { rating, comment } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).json({ message: 'Invalid Product ID' });

  const numRating = Number(rating);
  if (isNaN(numRating) || numRating < 1 || numRating > 5) {
    return res.status(400).json({ message: 'Rating must be a number between 1 and 5.' });
  }

  try {
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // Check if user already reviewed
    const alreadyReviewed = product.reviews.find(
      (r) => r.user && r.user.toString() === req.userId
    );

    if (alreadyReviewed) {
      alreadyReviewed.rating = numRating;
      alreadyReviewed.comment = comment || alreadyReviewed.comment;
      alreadyReviewed.date = new Date();
    } else {
      product.reviews.push({
        user: req.userId,
        rating: numRating,
        comment: comment || '',
        date: new Date()
      });
    }

    // Calculate new average rating
    const totalRating = product.reviews.reduce((acc, item) => item.rating + acc, 0);
    product.averageRating = Math.round((totalRating / product.reviews.length) * 10) / 10;

    await product.save();

    const updated = await Product.findById(id)
      .populate('farmer', 'name farmName location')
      .populate('reviews.user', 'name');

    if (req.io) {
      req.io.emit('product_review_added', updated);
    }

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
