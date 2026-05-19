import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    FiHeart, FiBookmark, FiShare2, FiClock, FiCalendar, FiEye,
    FiMessageSquare, FiArrowLeft, FiUser, FiTag, FiSend
} from 'react-icons/fi';
import { formatDistance } from 'date-fns';
import { useAuth } from '../hooks/useAuth';
import './BlogDetailPage.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API = API_BASE.endsWith('/api/v1') ? API_BASE : `${API_BASE}/api/v1`;

export default function BlogDetailPage() {
    const { slug } = useParams();
    const { user } = useAuth();
    const [blog, setBlog] = useState(null);
    const [relatedPosts, setRelatedPosts] = useState([]);
    const [comments, setComments] = useState([]);
    const [reactions, setReactions] = useState({});
    const [userReactions, setUserReactions] = useState({});
    const [loading, setLoading] = useState(true);
    const [commentText, setCommentText] = useState('');
    const [replyTo, setReplyTo] = useState(null);
    const [submittingComment, setSubmittingComment] = useState(false);

    useEffect(() => {
        loadBlog();
    }, [slug]);

    const loadBlog = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            const response = await fetch(`${API}/blogs/${slug}`, { headers });
            const data = await response.json();

            setBlog(data.blog);
            setRelatedPosts(data.related_posts || []);
            setComments(data.comments || []);
            setReactions(data.reactions || {});
            setUserReactions(data.user_reactions || {});
        } catch (error) {
            console.error('Error loading blog:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLike = async () => {
        if (!user) {
            alert('Please login to like this post');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API}/blogs/${blog._id}/like`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` }
            });

            const data = await response.json();
            setUserReactions({ ...userReactions, liked: data.liked });
            setBlog({
                ...blog,
                likes: data.liked ? blog.likes + 1 : blog.likes - 1
            });
        } catch (error) {
            console.error('Error liking blog:', error);
        }
    };

    const handleBookmark = async () => {
        if (!user) {
            alert('Please login to bookmark this post');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API}/blogs/${blog._id}/bookmark`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` }
            });

            const data = await response.json();
            setUserReactions({ ...userReactions, bookmarked: data.bookmarked });
        } catch (error) {
            console.error('Error bookmarking blog:', error);
        }
    };


    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: blog.title,
                    text: blog.excerpt,
                    url: window.location.href
                });
            } catch (error) {
                console.log('Error sharing:', error);
            }
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert('Link copied to clipboard!');
        }
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();

        if (!user) {
            alert('Please login to comment');
            return;
        }

        if (!commentText.trim()) return;

        setSubmittingComment(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API}/blogs/${blog._id}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    content: commentText,
                    parent_id: replyTo
                })
            });

            if (response.ok) {
                const newComment = await response.json();

                if (replyTo) {
                    // Add reply to parent comment
                    setComments(comments.map(c => {
                        if (c._id === replyTo) {
                            return {
                                ...c,
                                replies: [...(c.replies || []), newComment]
                            };
                        }
                        return c;
                    }));
                } else {
                    // Add new top-level comment
                    setComments([newComment, ...comments]);
                }

                setCommentText('');
                setReplyTo(null);
                setBlog({ ...blog, comments_count: blog.comments_count + 1 });
            }
        } catch (error) {
            console.error('Error submitting comment:', error);
            alert('Failed to submit comment');
        } finally {
            setSubmittingComment(false);
        }
    };

    const formatDate = (date) => {
        return formatDistance(new Date(date), new Date(), { addSuffix: true });
    };

    if (loading) {
        return (
            <div className="blog-detail-page">
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Loading article...</p>
                </div>
            </div>
        );
    }

    if (!blog) {
        return (
            <div className="blog-detail-page">
                <div className="error-container">
                    <h2>Blog post not found</h2>
                    <Link to="/blogs" className="back-link">
                        <FiArrowLeft /> Back to Blogs
                    </Link>
                </div>
            </div>
        );
    }


    return (
        <div className="blog-detail-page">
            <div className="blog-detail-container">
                {/* Back Button */}
                <Link to="/blogs" className="back-button">
                    <FiArrowLeft /> Back to Blogs
                </Link>

                {/* Blog Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="blog-header"
                >
                    <div className="blog-category-badge" style={{ color: blog.category_color || '#10b981' }}>
                        {blog.category_name}
                    </div>

                    <h1 className="blog-detail-title">{blog.title}</h1>

                    <div className="blog-meta-info">
                        <div className="author-section">
                            <img
                                src={blog.author_avatar || '/images/default-avatar.png'}
                                alt={blog.author_name}
                                className="author-avatar-large"
                            />
                            <div>
                                <div className="author-name-large">{blog.author_name}</div>
                                <div className="blog-date">
                                    <FiCalendar /> {formatDate(blog.published_at || blog.created_at)}
                                </div>
                            </div>
                        </div>

                        <div className="blog-stats-header">
                            <span className="stat-item">
                                <FiEye /> {blog.views} views
                            </span>
                            <span className="stat-item">
                                <FiClock /> {blog.reading_time_minutes} min read
                            </span>
                            <span className="stat-item">
                                <FiMessageSquare /> {blog.comments_count} comments
                            </span>
                        </div>
                    </div>
                </motion.div>

                {/* Featured Image */}
                {blog.featured_image && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="featured-image-container"
                    >
                        <img
                            src={blog.featured_image}
                            alt={blog.title}
                            className="featured-image"
                        />
                    </motion.div>
                )}

                <div className="blog-content-wrapper">
                    {/* Main Content */}
                    <div className="blog-main-content">
                        {/* Action Buttons */}
                        <div className="action-buttons">
                            <button
                                onClick={handleLike}
                                className={`action-btn ${userReactions.liked ? 'active' : ''}`}
                            >
                                <FiHeart /> {blog.likes}
                            </button>
                            <button
                                onClick={handleBookmark}
                                className={`action-btn ${userReactions.bookmarked ? 'active' : ''}`}
                            >
                                <FiBookmark />
                            </button>
                            <button onClick={handleShare} className="action-btn">
                                <FiShare2 />
                            </button>
                        </div>

                        {/* Blog Content */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="blog-content"
                            dangerouslySetInnerHTML={{ __html: blog.content }}
                        />

                        {/* Tags */}
                        {blog.tags && blog.tags.length > 0 && (
                            <div className="blog-tags">
                                <FiTag className="tags-icon" />
                                {blog.tags.map((tag, index) => (
                                    <Link key={index} to={`/blogs?tag=${tag}`} className="tag-link">
                                        {tag}
                                    </Link>
                                ))}
                            </div>
                        )}


                        {/* Comments Section */}
                        <div className="comments-section">
                            <h2 className="comments-title">
                                <FiMessageSquare /> Comments ({blog.comments_count})
                            </h2>

                            {/* Comment Form */}
                            {user ? (
                                <form onSubmit={handleCommentSubmit} className="comment-form">
                                    {replyTo && (
                                        <div className="reply-indicator">
                                            Replying to comment...
                                            <button
                                                type="button"
                                                onClick={() => setReplyTo(null)}
                                                className="cancel-reply-btn"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    )}
                                    <textarea
                                        value={commentText}
                                        onChange={(e) => setCommentText(e.target.value)}
                                        placeholder="Share your thoughts..."
                                        className="comment-textarea"
                                        rows="4"
                                    />
                                    <button
                                        type="submit"
                                        disabled={submittingComment || !commentText.trim()}
                                        className="submit-comment-btn"
                                    >
                                        {submittingComment ? 'Posting...' : (
                                            <>
                                                <FiSend /> Post Comment
                                            </>
                                        )}
                                    </button>
                                </form>
                            ) : (
                                <div className="login-prompt">
                                    <Link to="/login">Login</Link> to leave a comment
                                </div>
                            )}

                            {/* Comments List */}
                            <div className="comments-list">
                                {comments.map(comment => (
                                    <div key={comment._id} className="comment">
                                        <img
                                            src={comment.user_avatar || '/images/default-avatar.png'}
                                            alt={comment.user_name}
                                            className="comment-avatar"
                                        />
                                        <div className="comment-content">
                                            <div className="comment-header">
                                                <span className="comment-author">{comment.user_name}</span>
                                                <span className="comment-date">{formatDate(comment.created_at)}</span>
                                            </div>
                                            <p className="comment-text">{comment.content}</p>
                                            <button
                                                onClick={() => setReplyTo(comment._id)}
                                                className="reply-btn"
                                            >
                                                Reply
                                            </button>

                                            {/* Replies */}
                                            {comment.replies && comment.replies.length > 0 && (
                                                <div className="replies">
                                                    {comment.replies.map(reply => (
                                                        <div key={reply._id} className="comment reply">
                                                            <img
                                                                src={reply.user_avatar || '/images/default-avatar.png'}
                                                                alt={reply.user_name}
                                                                className="comment-avatar"
                                                            />
                                                            <div className="comment-content">
                                                                <div className="comment-header">
                                                                    <span className="comment-author">{reply.user_name}</span>
                                                                    <span className="comment-date">{formatDate(reply.created_at)}</span>
                                                                </div>
                                                                <p className="comment-text">{reply.content}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>


                    {/* Sidebar */}
                    <aside className="blog-sidebar">
                        {/* Author Card */}
                        <div className="sidebar-card author-card">
                            <img
                                src={blog.author_avatar || '/images/default-avatar.png'}
                                alt={blog.author_name}
                                className="author-avatar-sidebar"
                            />
                            <h3 className="author-name-sidebar">{blog.author_name}</h3>
                            {blog.author_bio && (
                                <p className="author-bio">{blog.author_bio}</p>
                            )}
                        </div>

                        {/* Related Posts */}
                        {relatedPosts.length > 0 && (
                            <div className="sidebar-card related-posts">
                                <h3 className="sidebar-title">Related Articles</h3>
                                {relatedPosts.map(post => (
                                    <Link
                                        key={post._id}
                                        to={`/blogs/${post.slug}`}
                                        className="related-post"
                                    >
                                        {post.featured_image && (
                                            <img
                                                src={post.featured_image}
                                                alt={post.title}
                                                className="related-post-image"
                                            />
                                        )}
                                        <div className="related-post-content">
                                            <h4 className="related-post-title">{post.title}</h4>
                                            <div className="related-post-meta">
                                                <FiClock /> {post.reading_time_minutes} min read
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </aside>
                </div>
            </div>
        </div>
    );
}
