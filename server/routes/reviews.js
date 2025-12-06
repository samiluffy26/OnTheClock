import express from 'express';
import { body, validationResult } from 'express-validator';
import Review from '../models/Review.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/reviews
// @desc    Submit a new review
// @access  Public
router.post('/', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').trim().notEmpty().isLength({ max: 1000 }).withMessage('Comment is required and must be under 1000 characters'),
  body('serviceType').optional().isIn(['wheelchair', 'ambulance', 'standard', 'medication-delivery', 'other'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { name, email, rating, comment, serviceType, location } = req.body;
    
    const review = new Review({
      name,
      email,
      rating,
      comment,
      serviceType: serviceType || 'other',
      location,
      status: 'pending'
    });
    
    await review.save();
    
    res.status(201).json({
      message: 'Review submitted successfully! It will be visible after approval.',
      review: {
        id: review._id,
        name: review.name,
        rating: review.rating
      }
    });
  } catch (error) {
    console.error('Submit review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/reviews
// @desc    Get approved reviews
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, featured } = req.query;
    
    const query = { status: 'approved' };
    if (featured === 'true') {
      query.featured = true;
    }
    
    const reviews = await Review.find(query)
      .sort({ featured: -1, approvedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-email -__v');
    
    const count = await Review.countDocuments(query);
    
    res.json({
      reviews,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalReviews: count
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/reviews/stats
// @desc    Get reviews statistics
// @access  Public
router.get('/stats', async (req, res) => {
  try {
    const totalReviews = await Review.countDocuments({ status: 'approved' });
    
    const avgRatingResult = await Review.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: null, avgRating: { $avg: '$rating' } } }
    ]);
    
    const ratingDistribution = await Review.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: '$rating', count: { $sum: 1 } } },
      { $sort: { _id: -1 } }
    ]);
    
    res.json({
      totalReviews,
      averageRating: avgRatingResult[0]?.avgRating.toFixed(1) || 0,
      ratingDistribution: ratingDistribution.reduce((acc, item) => {
        acc[`star${item._id}`] = item.count;
        return acc;
      }, {})
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ============ ADMIN ROUTES (Protected) ============

// @route   GET /api/reviews/admin/all
// @desc    Get all reviews (including pending)
// @access  Private
router.get('/admin/all', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    
    const query = {};
    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      query.status = status;
    }
    
    const reviews = await Review.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const count = await Review.countDocuments(query);
    
    res.json({
      reviews,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalReviews: count
    });
  } catch (error) {
    console.error('Get all reviews error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PATCH /api/reviews/admin/:id/approve
// @desc    Approve a review
// @access  Private
router.patch('/admin/:id/approve', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    review.status = 'approved';
    review.approvedAt = Date.now();
    review.approvedBy = req.admin.id;
    
    await review.save();
    
    res.json({ message: 'Review approved', review });
  } catch (error) {
    console.error('Approve review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PATCH /api/reviews/admin/:id/reject
// @desc    Reject a review
// @access  Private
router.patch('/admin/:id/reject', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    review.status = 'rejected';
    await review.save();
    
    res.json({ message: 'Review rejected', review });
  } catch (error) {
    console.error('Reject review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PATCH /api/reviews/admin/:id/feature
// @desc    Toggle featured status
// @access  Private
router.patch('/admin/:id/feature', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    review.featured = !review.featured;
    await review.save();
    
    res.json({ message: `Review ${review.featured ? 'featured' : 'unfeatured'}`, review });
  } catch (error) {
    console.error('Feature review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/reviews/admin/:id
// @desc    Delete a review
// @access  Private
router.delete('/admin/:id', auth, async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    res.json({ message: 'Review deleted' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;