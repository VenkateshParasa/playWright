import express from 'express';
import searchController from '../controllers/searchController.js';
// import { authenticate } from '../middleware/auth.js'; // Uncomment if authentication is required

const router = express.Router();

/**
 * @route   GET /api/search
 * @desc    Perform global search
 * @access  Public (or Protected if authentication is enabled)
 * @query   q (required) - search query
 * @query   type (optional) - content type filter
 * @query   difficulty (optional) - difficulty level filter
 * @query   category (optional) - category filter
 * @query   track (optional) - learning track filter
 * @query   limit (optional) - number of results per page (default: 20)
 * @query   offset (optional) - pagination offset (default: 0)
 */
router.get('/', searchController.search);

/**
 * @route   GET /api/search/suggestions
 * @desc    Get search suggestions based on partial query
 * @access  Public
 * @query   q (required) - partial search query (min 2 characters)
 * @query   limit (optional) - number of suggestions (default: 5)
 */
router.get('/suggestions', searchController.suggestions);

/**
 * @route   GET /api/search/trending
 * @desc    Get trending/popular search queries
 * @access  Public
 * @query   limit (optional) - number of trending items (default: 10)
 */
router.get('/trending', searchController.trending);

/**
 * @route   POST /api/search/analytics
 * @desc    Track search analytics
 * @access  Public (or Protected)
 * @body    query (required) - search query
 * @body    resultsCount (required) - number of results
 * @body    filters (optional) - applied filters
 * @body    selectedResultId (optional) - ID of selected result
 * @body    selectedResultType (optional) - type of selected result
 */
router.post('/analytics', searchController.trackAnalytics);

/**
 * @route   GET /api/search/categories
 * @desc    Get all available categories for filtering
 * @access  Public
 */
router.get('/categories', searchController.getCategories);

/**
 * @route   GET /api/search/tags
 * @desc    Get all available tags for filtering
 * @access  Public
 */
router.get('/tags', searchController.getTags);

export default router;
