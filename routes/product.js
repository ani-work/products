const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// Tokenize query and remove stop words
const tokenize = (query) => {
  const stopWords = ['for', 'the', 'and', 'a', 'an'];
  return query.split(/\s+/).filter(token => !stopWords.includes(token.toLowerCase()));
};

// Get all products or search for products
router.get('/', async (req, res) => {
  try {
    const query = req.query.q;
    let products;

    if (query) {
      const tokens = tokenize(query);
      const regexes = tokens.map(token => new RegExp(token, 'i')); // Create regexes for each token

      // If there's a search query, filter products by name or description
      products = await Product.find({
        $or: [
          { title: { $in: regexes } }, // Case-insensitive search
          { description: { $in: regexes } },
          { category: { $in: regexes } }
        ]
      });
    } else {
      // If no search query, return all products
      products = await Product.find();
    }

    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a specific product by ID
router.get('/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    console.log('Product ID:', productId);
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    console.error('Error fetching product:', err);
    res.status(500).json({ message: err.message });
  }
});

// Create a new product
router.post('/', async (req, res) => {
  const product = new Product({
    name: req.body.name,
    description: req.body.description,
    price: req.body.price,
    image: req.body.image,
    category: req.body.category,
  });

  try {
    const newProduct = await product.save();
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update a product
router.put('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a product
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
