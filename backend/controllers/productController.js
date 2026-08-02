import Product from '../models/Product.js';
import mongoose from 'mongoose';

export const getProducts = async (req, res) => {
  const { category, search, minPrice, maxPrice, farmer } = req.query;
  try {
    let query = {};
    if (category && category !== 'All') query.category = category;
    if (search) query.name = { $regex: search, $options: 'i' };
    if (farmer) query.farmer = farmer;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const products = await Product.find(query).populate('farmer', 'name farmName location');
    res.status(200).json(products);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const createProduct = async (req, res) => {
  const product = req.body;
  const newProduct = new Product({ 
    ...product, 
    farmer: req.userId, 
    image: req.file ? req.file.path : (product.image || ''),
    createdAt: new Date().toISOString() 
  });

  try {
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

export const updateStock = async (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;
  if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send('No product with that id');
  
  const updatedProduct = await Product.findByIdAndUpdate(id, { quantity }, { new: true });
  res.json(updatedProduct);
};

export const deleteProduct = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send('No product with that id');
  
  try {
    await Product.findByIdAndDelete(id);
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
