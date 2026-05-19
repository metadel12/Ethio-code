# 🚀 Blog System - Quick Start Guide

## ⚡ 3-Step Setup

### Step 1: Seed Categories
```bash
cd backend
python seed_blog_categories.py
```
**Output**: ✅ 6 categories created (Tutorial, Career, News, Success Story, Interview Prep, Tech Stack)

### Step 2: Start Backend
```bash
cd backend
uvicorn app.main:app --reload
```
**Running on**: http://localhost:8000

### Step 3: Start Frontend
```bash
cd frontend
npm run dev
```
**Running on**: http://localhost:5173

## 🎯 Access Points

- **Blog Listing**: http://localhost:5173/blogs
- **API Docs**: http://localhost:8000/docs
- **Categories API**: http://localhost:8000/api/v1/blogs/categories

## 📝 Create Your First Blog Post

### Using API (Postman/cURL)

1. **Login First** (get token):
```bash
POST http://localhost:8000/api/v1/auth/login
{
  "email": "your@email.com",
  "password": "yourpassword"
}
```

2. **Get Category ID**:
```bash
GET http://localhost:8000/api/v1/blogs/categories
```
Copy the `_id` of "Tutorial" category

3. **Create Blog**:
```bash
POST http://localhost:8000/api/v1/blogs/create
Authorization: Bearer <your_token>
Content-Type: application/json

{
  "title": "My First Blog Post",
  "content": "<h2>Hello World</h2><p>This is my first blog post on EthioCode!</p>",
  "excerpt": "My journey into blogging",
  "featured_image": "https://images.unsplash.com/photo-1499750310107-5fef28a66643",
  "category_id": "<tutorial_category_id>",
  "tags": ["introduction", "blogging", "ethiocode"]
}
```

4. **Publish Blog**:
```bash
POST http://localhost:8000/api/v1/blogs/<blog_id>/publish
Authorization: Bearer <your_token>
```

5. **View on Frontend**:
Go to http://localhost:5173/blogs

## 🎨 Features You Can Use Right Away

### For Visitors (No Login)
- ✅ Browse all blogs
- ✅ Search articles
- ✅ Filter by category
- ✅ View blog details
- ✅ Subscribe to newsletter

### For Logged-In Users
- ✅ Like posts
- ✅ Bookmark posts
- ✅ Comment on posts
- ✅ Reply to comments
- ✅ Share posts

### For Authors
- ✅ Create blog posts
- ✅ Edit own posts
- ✅ Publish/unpublish
- ✅ Delete own posts
- ✅ View analytics

### For Admins
- ✅ Manage all posts
- ✅ Create categories
- ✅ View full analytics
- ✅ Moderate comments

## 📊 Test the System

### 1. Test Categories
```bash
curl http://localhost:8000/api/v1/blogs/categories
```

### 2. Test Blog Listing
```bash
curl http://localhost:8000/api/v1/blogs
```

### 3. Test Search
```bash
curl "http://localhost:8000/api/v1/blogs?search=python"
```

### 4. Test Newsletter
```bash
curl -X POST http://localhost:8000/api/v1/blogs/newsletter/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test User"}'
```

## 🎯 Common Tasks

### Change User Role to Author
```javascript
// In MongoDB
db.users.updateOne(
  { email: "user@example.com" },
  { $set: { role: "author" } }
)
```

### View All Blogs
```javascript
// In MongoDB
db.blogs.find({ status: "published" })
```

### Check Newsletter Subscribers
```javascript
// In MongoDB
db.blog_newsletter_subscribers.find({ is_active: true })
```

## 🐛 Troubleshooting

### Issue: "Categories not found"
**Solution**: Run `python seed_blog_categories.py`

### Issue: "Cannot create blog"
**Solution**: Make sure your user role is "author" or "admin"

### Issue: "Blog not showing on frontend"
**Solution**: Make sure blog status is "published"

### Issue: "Comments not appearing"
**Solution**: Check if user is logged in

## 📚 File Locations

### Backend
- **Blog API**: `backend/app/api/v1/blogs.py`
- **Auth**: `backend/app/core/auth.py`
- **Main**: `backend/app/main.py`

### Frontend
- **Blog List**: `frontend/src/pages/BlogsPage.jsx`
- **Blog Detail**: `frontend/src/pages/BlogDetailPage.jsx`
- **Routes**: `frontend/src/App.jsx`

## 🎉 You're Ready!

Your blog system is fully functional. Start creating amazing content! 🚀

**Need Help?** Check `BLOG_SYSTEM_DOCUMENTATION.md` for complete API reference.
