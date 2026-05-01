// src/pages/blogs.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  FaSearch,
  FaCalendarAlt,
  FaTags,
  FaShareAlt,
  FaBookmark,
  FaArrowUp,
  FaBookOpen,
  FaComment,
  FaUser,
  FaFilter,
} from "react-icons/fa";
import "./blogs.css";

const BlogsPage = () => {
  const [blogs, setBlogs] = useState([]);
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [categories] = useState([
    "all",
    "system-design",
    "backend",
    "frontend",
    "devops",
    "database",
    "career",
    "interview",
  ]);
  const [featuredPost, setFeaturedPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [bookmarkedPosts, setBookmarkedPosts] = useState([]);
  const [comments, setComments] = useState({});
  const [showCommentForm, setShowCommentForm] = useState(null);
  const [commentText, setCommentText] = useState("");

  const commentRef = useRef(null);

  // Simulate API call to fetch blog posts
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setIsLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Sample blog data
        const blogData = [
          {
            id: 1,
            title: "Designing Scalable Microservices Architecture",
            excerpt:
              "Learn how to design and implement microservices that scale with your application needs.",
            content: "Full content would go here...",
            date: "2023-10-15",
            readTime: "10 min read",
            category: "system-design",
            tags: ["architecture", "scalability", "microservices"],
            image:
              "https://images.unsplash.com/photo-1550439062-609e1531270e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
            featured: true,
            author: {
              name: "Alex Johnson",
              avatar: "https://randomuser.me/api/portraits/men/32.jpg",
            },
            views: 1240,
            comments: 18,
          },
          {
            id: 2,
            title: "Mastering Database Indexing Strategies",
            excerpt:
              "Deep dive into database indexing and how to optimize query performance.",
            content: "Full content would go here...",
            date: "2023-10-10",
            readTime: "8 min read",
            category: "database",
            tags: ["database", "performance", "sql"],
            image:
              "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
            author: {
              name: "Sarah Williams",
              avatar: "https://randomuser.me/api/portraits/women/44.jpg",
            },
            views: 980,
            comments: 12,
          },
          {
            id: 3,
            title: "The Complete Guide to RESTful API Design",
            excerpt:
              "Best practices for designing clean, intuitive, and efficient REST APIs.",
            content: "Full content would go here...",
            date: "2023-10-05",
            readTime: "12 min read",
            category: "backend",
            tags: ["api", "rest", "design"],
            image:
              "https://images.unsplash.com/photo-1533750349088-cd871a92f312?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
            author: {
              name: "Michael Chen",
              avatar: "https://randomuser.me/api/portraits/men/22.jpg",
            },
            views: 1560,
            comments: 24,
          },
          {
            id: 4,
            title: "DevOps Culture: Breaking Down Silos",
            excerpt:
              "How adopting DevOps practices can transform your engineering culture.",
            content: "Full content would go here...",
            date: "2023-09-28",
            readTime: "7 min read",
            category: "devops",
            tags: ["devops", "culture", "automation"],
            image:
              "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
            author: {
              name: "Emma Rodriguez",
              avatar: "https://randomuser.me/api/portraits/women/65.jpg",
            },
            views: 870,
            comments: 9,
          },
          {
            id: 5,
            title: "Preparing for Senior Engineering Interviews",
            excerpt:
              "Strategies and resources to ace your senior-level engineering interviews.",
            content: "Full content would go here...",
            date: "2023-09-20",
            readTime: "9 min read",
            category: "career",
            tags: ["interview", "career", "preparation"],
            image:
              "https://images.unsplash.com/photo-1551836022-d5d88e9218df?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
            author: {
              name: "David Kim",
              avatar: "https://randomuser.me/api/portraits/men/41.jpg",
            },
            views: 2100,
            comments: 31,
          },
          {
            id: 6,
            title: "Modern Frontend Architecture Patterns",
            excerpt:
              "Exploring component-based architecture and state management patterns.",
            content: "Full content would go here...",
            date: "2023-09-15",
            readTime: "11 min read",
            category: "frontend",
            tags: ["frontend", "architecture", "react"],
            image:
              "https://images.unsplash.com/photo-1581276879432-15e50529f34b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
            author: {
              name: "Lisa Anderson",
              avatar: "https://randomuser.me/api/portraits/women/33.jpg",
            },
            views: 1350,
            comments: 15,
          },
          {
            id: 7,
            title: "Building Resilient Systems with Circuit Breakers",
            excerpt:
              "Implementing fault tolerance patterns in distributed systems.",
            content: "Full content would go here...",
            date: "2023-09-10",
            readTime: "14 min read",
            category: "system-design",
            tags: ["resilience", "microservices", "patterns"],
            image:
              "https://images.unsplash.com/photo-1547658719-da2b51169166?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
            author: {
              name: "James Wilson",
              avatar: "https://randomuser.me/api/portraits/men/51.jpg",
            },
            views: 920,
            comments: 11,
          },
          {
            id: 8,
            title: "Container Orchestration with Kubernetes",
            excerpt:
              "Deep dive into Kubernetes architecture and deployment strategies.",
            content: "Full content would go here...",
            date: "2023-09-05",
            readTime: "15 min read",
            category: "devops",
            tags: ["kubernetes", "containers", "devops"],
            image:
              "https://images.unsplash.com/photo-1633539231913-0c9e0a4c6a7d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
            author: {
              name: "Rachel Green",
              avatar: "https://randomuser.me/api/portraits/women/28.jpg",
            },
            views: 1750,
            comments: 21,
          },
        ];

        setBlogs(blogData);
        setFilteredBlogs(blogData);

        // Set featured post
        const featured = blogData.find((blog) => blog.featured);
        setFeaturedPost(featured);

        // Initialize comments
        const initialComments = {};
        blogData.forEach((blog) => {
          initialComments[blog.id] = [
            {
              id: 1,
              user: "TechEnthusiast",
              text: "Great insights! Thanks for sharing.",
              date: "2023-10-16",
            },
            {
              id: 2,
              user: "CodeMaster",
              text: "This helped me solve a problem I was facing. Much appreciated!",
              date: "2023-10-15",
            },
          ];
        });
        setComments(initialComments);
      } catch (error) {
        console.error("Failed to load blogs:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  // Filter blogs based on category and search term
  useEffect(() => {
    let result = blogs;

    // Apply category filter
    if (selectedCategory !== "all") {
      result = result.filter((blog) => blog.category === selectedCategory);
    }

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (blog) =>
          blog.title.toLowerCase().includes(term) ||
          blog.excerpt.toLowerCase().includes(term) ||
          blog.tags.some((tag) => tag.toLowerCase().includes(term)) ||
          blog.author.name.toLowerCase().includes(term)
      );
    }

    setFilteredBlogs(result);
  }, [blogs, selectedCategory, searchTerm]);

  // Handle scroll to show scroll-to-top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.pageYOffset > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Format date
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Toggle bookmark
  const toggleBookmark = (id) => {
    if (bookmarkedPosts.includes(id)) {
      setBookmarkedPosts(bookmarkedPosts.filter((postId) => postId !== id));
    } else {
      setBookmarkedPosts([...bookmarkedPosts, id]);
    }
  };

  // Add comment
  const addComment = (postId) => {
    if (!commentText.trim()) return;

    const newComment = {
      id: Date.now(),
      user: "CurrentUser",
      text: commentText,
      date: new Date().toISOString().split("T")[0],
    };

    setComments({
      ...comments,
      [postId]: [...comments[postId], newComment],
    });

    setCommentText("");
    setShowCommentForm(null);
  };

  // Scroll to top
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="blogs-page">
      {/* Header */}
      <header className="blog-header">
        <div className="header-content">
          <h1>EthiCode Engineering Insights</h1>
          <p>Expert knowledge, tutorials, and industry perspectives</p>
        </div>
        <div className="header-stats">
          <div className="stat-item">
            <FaBookOpen className="stat-icon" />
            <span>{blogs.length} Articles</span>
          </div>
          <div className="stat-item">
            <FaUser className="stat-icon" />
            <span>8 Expert Authors</span>
          </div>
          <div className="stat-item">
            <FaComment className="stat-icon" />
            <span>142 Comments</span>
          </div>
        </div>
      </header>

      {/* Search and Filters */}
      <div className="search-section">
        <div className="search-container">
          <div className="search-bar">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search articles, topics, or authors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            className="filter-toggle"
            onClick={() => setShowFilters(!showFilters)}
          >
            <FaFilter /> Filters
          </button>
        </div>

        {showFilters && (
          <div className="category-filters">
            {categories.map((category) => (
              <button
                key={category}
                className={`category-btn ${
                  selectedCategory === category ? "active" : ""
                }`}
                onClick={() => setSelectedCategory(category)}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Content */}
      <main className="blog-main">
        {isLoading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading insightful articles...</p>
          </div>
        ) : (
          <>
            {/* Featured Post */}
            {featuredPost && (
              <section className="featured-post">
                <div className="featured-image">
                  <img src={featuredPost.image} alt={featuredPost.title} />
                  <div className="featured-badge">Featured</div>
                </div>
                <div className="featured-content">
                  <div className="post-meta">
                    <span className="category-tag">
                      {featuredPost.category}
                    </span>
                    <span className="post-date">
                      <FaCalendarAlt /> {formatDate(featuredPost.date)}
                    </span>
                    <span className="read-time">{featuredPost.readTime}</span>
                  </div>
                  <h2>{featuredPost.title}</h2>
                  <p className="excerpt">{featuredPost.excerpt}</p>

                  <div className="author-info">
                    <img
                      src={featuredPost.author.avatar}
                      alt={featuredPost.author.name}
                    />
                    <div>
                      <span className="author-name">
                        {featuredPost.author.name}
                      </span>
                      <span className="post-stats">
                        {featuredPost.views} views · {featuredPost.comments}{" "}
                        comments
                      </span>
                    </div>
                  </div>

                  <div className="featured-actions">
                    <button className="read-more-btn">Read Full Article</button>
                    <button
                      className={`bookmark-btn ${
                        bookmarkedPosts.includes(featuredPost.id)
                          ? "bookmarked"
                          : ""
                      }`}
                      onClick={() => toggleBookmark(featuredPost.id)}
                    >
                      <FaBookmark />
                    </button>
                    <button className="share-btn">
                      <FaShareAlt />
                    </button>
                  </div>

                  <div className="tags">
                    <FaTags className="tags-icon" />
                    <div className="tag-list">
                      {featuredPost.tags.map((tag, index) => (
                        <span key={index} className="tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Blog Grid */}
            <section className="blog-grid">
              <h2 className="section-title">Latest Articles</h2>
              <div className="grid-container">
                {filteredBlogs
                  .filter((blog) => !blog.featured)
                  .map((blog) => (
                    <article key={blog.id} className="blog-card">
                      <div className="card-image">
                        <img src={blog.image} alt={blog.title} />
                        <button
                          className={`bookmark-btn ${
                            bookmarkedPosts.includes(blog.id)
                              ? "bookmarked"
                              : ""
                          }`}
                          onClick={() => toggleBookmark(blog.id)}
                        >
                          <FaBookmark />
                        </button>
                      </div>
                      <div className="card-content">
                        <div className="post-meta">
                          <span className="category-tag">{blog.category}</span>
                          <span className="post-date">
                            <FaCalendarAlt /> {formatDate(blog.date)}
                          </span>
                        </div>
                        <h3>{blog.title}</h3>
                        <p className="excerpt">{blog.excerpt}</p>

                        <div className="author-info">
                          <img
                            src={blog.author.avatar}
                            alt={blog.author.name}
                          />
                          <span>{blog.author.name}</span>
                        </div>

                        <div className="post-stats">
                          <span>{blog.views} views</span>
                          <span>{blog.comments} comments</span>
                          <span>{blog.readTime}</span>
                        </div>

                        <div className="card-footer">
                          <div className="tags">
                            {blog.tags.slice(0, 2).map((tag, index) => (
                              <span key={index} className="tag">
                                {tag}
                              </span>
                            ))}
                            {blog.tags.length > 2 && (
                              <span className="tag">
                                +{blog.tags.length - 2}
                              </span>
                            )}
                          </div>
                          <div className="card-actions">
                            <button
                              className="action-btn"
                              onClick={() =>
                                setShowCommentForm(
                                  showCommentForm === blog.id ? null : blog.id
                                )
                              }
                            >
                              <FaComment />
                            </button>
                            <button className="action-btn">
                              <FaShareAlt />
                            </button>
                          </div>
                        </div>

                        {/* Comment Section */}
                        {showCommentForm === blog.id && (
                          <div className="comment-section" ref={commentRef}>
                            <h4>Comments ({comments[blog.id]?.length || 0})</h4>

                            <div className="comments-list">
                              {comments[blog.id]?.map((comment) => (
                                <div key={comment.id} className="comment">
                                  <div className="comment-header">
                                    <span className="comment-user">
                                      {comment.user}
                                    </span>
                                    <span className="comment-date">
                                      {formatDate(comment.date)}
                                    </span>
                                  </div>
                                  <p className="comment-text">{comment.text}</p>
                                </div>
                              ))}
                            </div>

                            <div className="comment-form">
                              <textarea
                                placeholder="Add your comment..."
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                rows={3}
                              />
                              <div className="form-actions">
                                <button
                                  className="cancel-btn"
                                  onClick={() => setShowCommentForm(null)}
                                >
                                  Cancel
                                </button>
                                <button
                                  className="submit-btn"
                                  onClick={() => addComment(blog.id)}
                                >
                                  Post Comment
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </article>
                  ))}
              </div>
            </section>

            {/* Empty State */}
            {filteredBlogs.length === 0 && (
              <div className="empty-state">
                <h3>No articles found</h3>
                <p>Try adjusting your search or filter criteria</p>
                <button
                  className="reset-btn"
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("all");
                  }}
                >
                  Reset Filters
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Scroll to Top */}
      {showScrollTop && (
        <button className="scroll-top-btn" onClick={scrollToTop}>
          <FaArrowUp />
        </button>
      )}

      {/* Newsletter */}
      <section className="newsletter-section">
        <div className="newsletter-content">
          <h2>Stay Updated with Our Latest Insights</h2>
          <p>Join 10,000+ engineers receiving our weekly technical articles</p>
          <div className="subscribe-form">
            <input type="email" placeholder="Your email address" />
            <button className="subscribe-btn">Subscribe</button>
          </div>
          <p className="disclaimer">No spam. Unsubscribe anytime.</p>
        </div>
      </section>

      {/* Footer
      <footer className="blog-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <h3>EthiCode Engineering</h3>
            <p>Sharing knowledge to build better software</p>
          </div>

          <div className="footer-links">
            <div className="link-group">
              <h4>Categories</h4>
              <ul>
                {categories.slice(1).map((category) => (
                  <li key={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </li>
                ))}
              </ul>
            </div>

            <div className="link-group">
              <h4>Resources</h4>
              <ul>
                <li>Documentation</li>
                <li>Tutorials</li>
                <li>Webinars</li>
                <li>Case Studies</li>
              </ul>
            </div>

            <div className="link-group">
              <h4>Company</h4>
              <ul>
                <li>About Us</li>
                <li>Team</li>
                <li>Careers</li>
                <li>Contact</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2023 EthiCode Engineering. All rights reserved.</p>
          <div className="social-links">
            <span>Follow us:</span>
            <a href="#">Twitter</a>
            <a href="#">LinkedIn</a>
            <a href="#">GitHub</a>
            <a href="#">YouTube</a>
          </div>
        </div>
      </footer> */}
    </div>
  );
};

export default BlogsPage;
