import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    FiSearch, FiBookmark, FiHeart, FiMessageSquare, FiEye, FiClock,
    FiCalendar, FiTag, FiUser, FiChevronRight, FiTrendingUp, FiStar,
    FiArrowRight, FiGrid, FiList
} from 'react-icons/fi';
import { formatDistance } from 'date-fns';
import './BlogsPage.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API = API_BASE.endsWith('/api/v1') ? API_BASE : `${API_BASE}/api/v1`;

export default function BlogsPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [blogs, setBlogs] = useState([]);
    const [categories, setCategories] = useState([]);
    const [popularTags, setPopularTags] = useState([]);
    const [featuredBlogs, setFeaturedBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
    const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [viewMode, setViewMode] = useState('grid');
    const [newsletterEmail, setNewsletterEmail] = useState('');
    const [newsletterLoading, setNewsletterLoading] = useState(false);

    useEffect(() => {
        loadCategories();
        loadPopularTags();
        loadFeaturedBlogs();
    }, []);

    useEffect(() => {
        loadBlogs();
    }, [selectedCategory, searchQuery, currentPage]);

    const loadCategories = async () => {
        try {
            const response = await fetch(`${API}/blogs/categories`);
            const data = await response.json();
            setCategories(data.categories);
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    };

    const loadPopularTags = async () => {
        try {
            const response = await fetch(`${API}/blogs/tags`);
            const data = await response.json();
            setPopularTags(data.tags);
        } catch (error) {
            console.error('Error loading tags:', error);
        }
    };


    const loadFeaturedBlogs = async () => {
        try {
            const response = await fetch(`${API}/blogs/featured`);
            const data = await response.json();
            setFeaturedBlogs(data.featured_blogs);
        } catch (error) {
            console.error('Error loading featured blogs:', error);
        }
    };

    const loadBlogs = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: currentPage,
                limit: 9,
                ...(selectedCategory !== 'all' && { category: selectedCategory }),
                ...(searchQuery && { search: searchQuery })
            });

            const response = await fetch(`${API}/blogs?${params}`);
            const data = await response.json();
            setBlogs(data.blogs);
            setTotalPages(data.total_pages);
        } catch (error) {
            console.error('Error loading blogs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        setSearchParams({ search: searchQuery, category: selectedCategory });
        loadBlogs();
    };

    const handleCategoryChange = (categorySlug) => {
        setSelectedCategory(categorySlug);
        setCurrentPage(1);
        setSearchParams({ category: categorySlug, search: searchQuery });
    };

    const handleNewsletterSubscribe = async (e) => {
        e.preventDefault();
        if (!newsletterEmail) return;

        setNewsletterLoading(true);
        try {
            const response = await fetch(`${API}/blogs/newsletter/subscribe`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: newsletterEmail })
            });

            if (response.ok) {
                alert('Successfully subscribed to newsletter! 🎉');
                setNewsletterEmail('');
            } else {
                alert('Failed to subscribe. Please try again.');
            }
        } catch (error) {
            console.error('Error subscribing:', error);
            alert('An error occurred. Please try again.');
        } finally {
            setNewsletterLoading(false);
        }
    };

    const formatDate = (date) => {
        return formatDistance(new Date(date), new Date(), { addSuffix: true });
    };


    const BlogCard = ({ blog, featured = false }) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            className={`blog-card ${featured ? 'featured' : ''}`}
        >
            <Link to={`/blogs/${blog.slug}`} className="blog-card-link">
                <div className="blog-image-container">
                    <img
                        src={blog.featured_image || '/images/blog-placeholder.jpg'}
                        alt={blog.title}
                        className="blog-image"
                    />
                    {blog.is_premium && (
                        <div className="premium-badge">
                            <FiStar /> Premium
                        </div>
                    )}
                </div>

                <div className="blog-content">
                    <div className="blog-meta">
                        <span
                            className="category-badge"
                            style={{
                                backgroundColor: `${blog.category_color || '#10b981'}20`,
                                color: blog.category_color || '#10b981'
                            }}
                        >
                            {blog.category_name}
                        </span>
                        <div className="reading-time">
                            <FiClock />
                            <span>{blog.reading_time_minutes} min read</span>
                        </div>
                    </div>

                    <h3 className="blog-title">{blog.title}</h3>
                    <p className="blog-excerpt">{blog.excerpt}</p>

                    <div className="blog-footer">
                        <div className="author-info">
                            <img
                                src={blog.author_avatar || '/images/default-avatar.png'}
                                alt={blog.author_name}
                                className="author-avatar"
                            />
                            <span className="author-name">{blog.author_name}</span>
                        </div>

                        <div className="blog-stats">
                            <span className="stat">
                                <FiEye /> {blog.views}
                            </span>
                            <span className="stat">
                                <FiHeart /> {blog.likes}
                            </span>
                            <span className="stat">
                                <FiMessageSquare /> {blog.comments_count}
                            </span>
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );


    return (
        <div className="blogs-page">
            {/* Hero Section */}
            <div className="blogs-hero">
                <div className="hero-content">
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="hero-title"
                    >
                        EthioCode Blog
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="hero-subtitle"
                    >
                        Insights, tutorials, and stories from the Ethiopian tech community
                    </motion.p>

                    {/* Search Bar */}
                    <motion.form
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        onSubmit={handleSearch}
                        className="search-form"
                    >
                        <div className="search-input-wrapper">
                            <FiSearch className="search-icon" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search articles..."
                                className="search-input"
                            />
                        </div>
                    </motion.form>
                </div>
            </div>

            <div className="blogs-container">
                {/* Categories */}
                <div className="categories-section">
                    <button
                        onClick={() => handleCategoryChange('all')}
                        className={`category-btn ${selectedCategory === 'all' ? 'active' : ''}`}
                    >
                        All
                    </button>
                    {categories.map(cat => (
                        <button
                            key={cat._id}
                            onClick={() => handleCategoryChange(cat.slug)}
                            className={`category-btn ${selectedCategory === cat.slug ? 'active' : ''}`}
                        >
                            {cat.icon} {cat.name}
                        </button>
                    ))}
                </div>

                {/* View Toggle */}
                <div className="view-controls">
                    <p className="results-count">{blogs.length} articles found</p>
                    <div className="view-toggle">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                        >
                            <FiGrid />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                        >
                            <FiList />
                        </button>
                    </div>
                </div>


                {/* Featured Posts */}
                {featuredBlogs.length > 0 && currentPage === 1 && !searchQuery && selectedCategory === 'all' && (
                    <div className="featured-section">
                        <h2 className="section-title">
                            <FiStar className="title-icon" /> Featured Articles
                        </h2>
                        <div className="featured-grid">
                            {featuredBlogs.slice(0, 2).map(blog => (
                                <BlogCard key={blog._id} blog={blog} featured={true} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Blog Grid/List */}
                {loading ? (
                    <div className="loading-container">
                        <div className="spinner"></div>
                        <p>Loading articles...</p>
                    </div>
                ) : blogs.length === 0 ? (
                    <div className="empty-state">
                        <p>No articles found. Try different search terms.</p>
                    </div>
                ) : (
                    <div className={`blogs-grid ${viewMode}`}>
                        {blogs.map(blog => (
                            <BlogCard key={blog._id} blog={blog} />
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="pagination">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="pagination-btn"
                        >
                            Previous
                        </button>
                        {[...Array(totalPages).keys()].map(p => (
                            <button
                                key={p}
                                onClick={() => setCurrentPage(p + 1)}
                                className={`pagination-btn ${currentPage === p + 1 ? 'active' : ''}`}
                            >
                                {p + 1}
                            </button>
                        ))}
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="pagination-btn"
                        >
                            Next
                        </button>
                    </div>
                )}

                {/* Popular Tags */}
                {popularTags.length > 0 && (
                    <div className="tags-section">
                        <h3 className="section-subtitle">
                            <FiTag className="title-icon" /> Popular Tags
                        </h3>
                        <div className="tags-cloud">
                            {popularTags.map(tag => (
                                <Link
                                    key={tag._id}
                                    to={`/blogs?tag=${tag._id}`}
                                    className="tag-badge"
                                >
                                    {tag._id} ({tag.count})
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Newsletter Signup */}
                <div className="newsletter-section">
                    <h3 className="newsletter-title">Subscribe to Our Newsletter</h3>
                    <p className="newsletter-subtitle">
                        Get the latest tech insights delivered to your inbox weekly
                    </p>
                    <form onSubmit={handleNewsletterSubscribe} className="newsletter-form">
                        <input
                            type="email"
                            value={newsletterEmail}
                            onChange={(e) => setNewsletterEmail(e.target.value)}
                            placeholder="Your email address"
                            className="newsletter-input"
                            required
                        />
                        <button
                            type="submit"
                            disabled={newsletterLoading}
                            className="newsletter-btn"
                        >
                            {newsletterLoading ? 'Subscribing...' : 'Subscribe'}
                        </button>
                    </form>
                    <p className="newsletter-note">No spam. Unsubscribe anytime.</p>
                </div>
            </div>
        </div>
    );
}
