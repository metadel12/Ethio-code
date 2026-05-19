from fastapi import APIRouter, HTTPException, Depends, Query, BackgroundTasks, Request
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timedelta
import re
from bson import ObjectId

from app.database import db
from app.core.auth import get_current_user, get_optional_user

router = APIRouter(prefix="/blogs", tags=["Blogs"])

# ==================== MODELS ====================
class BlogCreate(BaseModel):
    title: str
    content: str
    excerpt: Optional[str] = None
    featured_image: Optional[str] = None
    gallery_images: Optional[List[str]] = []
    category_id: str
    tags: Optional[List[str]] = []
    is_featured: bool = False
    is_premium: bool = False
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None
    seo_keywords: Optional[List[str]] = []

class BlogUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    excerpt: Optional[str] = None
    featured_image: Optional[str] = None
    category_id: Optional[str] = None
    tags: Optional[List[str]] = None
    is_featured: Optional[bool] = None
    is_premium: Optional[bool] = None
    status: Optional[str] = None

class CommentCreate(BaseModel):
    content: str
    parent_id: Optional[str] = None

class CategoryCreate(BaseModel):
    name: str
    description: str
    icon: str
    color: str

class NewsletterSubscribe(BaseModel):
    email: str
    name: Optional[str] = ""


# ==================== PUBLIC ENDPOINTS ====================
@router.get("/")
async def get_blogs(
    page: int = Query(1, ge=1),
    limit: int = Query(12, ge=1, le=50),
    category: Optional[str] = None,
    tag: Optional[str] = None,
    search: Optional[str] = None,
    author: Optional[str] = None,
    sort_by: str = Query("newest", regex="^(newest|popular|trending)$")
):
    """Get all published blogs with filtering and pagination"""
    query = {"status": "published"}
    
    # Apply filters
    if category:
        category_doc = await db.blog_categories.find_one({"slug": category})
        if category_doc:
            query["category_id"] = category_doc["_id"]
    
    if tag:
        query["tags"] = tag
    
    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"content": {"$regex": search, "$options": "i"}},
            {"excerpt": {"$regex": search, "$options": "i"}}
        ]
    
    if author:
        query["author_name"] = {"$regex": author, "$options": "i"}
    
    # Sorting
    sort_options = {
        "newest": ("published_at", -1),
        "popular": ("views", -1),
        "trending": ("likes", -1)
    }
    sort_field, sort_order = sort_options.get(sort_by, ("published_at", -1))
    
    # Get total count
    total = await db.blogs.count_documents(query)
    
    # Get paginated results
    skip = (page - 1) * limit
    cursor = db.blogs.find(query).sort(sort_field, sort_order).skip(skip).limit(limit)
    blogs = await cursor.to_list(length=limit)

    
    # Process blogs for response
    for blog in blogs:
        blog["_id"] = str(blog["_id"])
        blog["category_id"] = str(blog.get("category_id", ""))
        blog["author_id"] = str(blog.get("author_id", ""))
        
        # Calculate reading time if not set
        if not blog.get("reading_time_minutes"):
            word_count = len(blog["content"].split())
            blog["reading_time_minutes"] = max(1, round(word_count / 200))
    
    return {
        "blogs": blogs,
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": (total + limit - 1) // limit
    }

@router.get("/featured")
async def get_featured_blogs(limit: int = 6):
    """Get featured blogs for homepage"""
    cursor = db.blogs.find({
        "status": "published",
        "is_featured": True
    }).sort("published_at", -1).limit(limit)
    
    blogs = await cursor.to_list(length=limit)
    
    for blog in blogs:
        blog["_id"] = str(blog["_id"])
        blog["category_id"] = str(blog.get("category_id", ""))
        blog["author_id"] = str(blog.get("author_id", ""))
    
    return {"featured_blogs": blogs}

@router.get("/popular")
async def get_popular_blogs(limit: int = 5, days: int = 30):
    """Get most popular blogs from last N days"""
    cutoff_date = datetime.utcnow() - timedelta(days=days)
    
    cursor = db.blogs.find({
        "status": "published",
        "published_at": {"$gte": cutoff_date}
    }).sort("views", -1).limit(limit)
    
    blogs = await cursor.to_list(length=limit)
    
    for blog in blogs:
        blog["_id"] = str(blog["_id"])
    
    return {"popular_blogs": blogs}


@router.get("/categories")
async def get_categories():
    """Get all blog categories"""
    categories = await db.blog_categories.find({"is_active": True}).sort("order", 1).to_list(length=20)
    
    for category in categories:
        category["_id"] = str(category["_id"])
        # Get post count for this category
        category["post_count"] = await db.blogs.count_documents({
            "category_id": ObjectId(category["_id"]),
            "status": "published"
        })
    
    return {"categories": categories}

@router.get("/tags")
async def get_popular_tags(limit: int = 20):
    """Get most used tags"""
    pipeline = [
        {"$match": {"status": "published"}},
        {"$unwind": "$tags"},
        {"$group": {"_id": "$tags", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": limit}
    ]
    
    tags = await db.blogs.aggregate(pipeline).to_list(length=limit)
    return {"tags": tags}

@router.get("/search/suggestions")
async def get_search_suggestions(q: str = Query(..., min_length=2)):
    """Get search suggestions as user types"""
    suggestions = []
    
    # Search titles
    cursor = db.blogs.find({
        "status": "published",
        "title": {"$regex": q, "$options": "i"}
    }).limit(5)
    
    async for blog in cursor:
        suggestions.append({
            "type": "title",
            "text": blog["title"],
            "url": f"/blogs/{blog['slug']}"
        })
    
    # Search tags
    tags = await db.blogs.distinct("tags", {
        "status": "published",
        "tags": {"$regex": q, "$options": "i"}
    })
    
    for tag in tags[:5]:
        suggestions.append({
            "type": "tag",
            "text": tag,
            "url": f"/blogs?tag={tag}"
        })
    
    return {"suggestions": suggestions}


@router.get("/{slug}")
async def get_blog_by_slug(slug: str, request: Request, current_user: dict = Depends(get_optional_user)):
    """Get single blog post by slug"""
    blog = await db.blogs.find_one({"slug": slug, "status": "published"})
    
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")
    
    # Increment view count
    await db.blogs.update_one(
        {"_id": blog["_id"]},
        {"$inc": {"views": 1}}
    )
    
    # Record view for analytics
    await db.blog_views.insert_one({
        "blog_id": blog["_id"],
        "user_id": current_user["_id"] if current_user else None,
        "ip_address": request.client.host,
        "user_agent": request.headers.get("user-agent"),
        "referrer": request.headers.get("referer"),
        "viewed_at": datetime.utcnow()
    })
    
    # Get related posts (same category or tags)
    related = await db.blogs.find({
        "_id": {"$ne": blog["_id"]},
        "status": "published",
        "$or": [
            {"category_id": blog.get("category_id")},
            {"tags": {"$in": blog.get("tags", [])}}
        ]
    }).sort("published_at", -1).limit(3).to_list(length=3)
    
    # Get comments
    comments = await db.blog_comments.find({
        "blog_id": blog["_id"],
        "is_approved": True,
        "parent_id": None
    }).sort("created_at", -1).to_list(length=100)
    
    # Get nested replies for each comment
    for comment in comments:
        comment["_id"] = str(comment["_id"])
        comment["blog_id"] = str(comment["blog_id"])
        comment["user_id"] = str(comment.get("user_id", ""))
        
        replies = await db.blog_comments.find({
            "parent_id": ObjectId(comment["_id"]),
            "is_approved": True
        }).sort("created_at", 1).to_list(length=50)
        
        for reply in replies:
            reply["_id"] = str(reply["_id"])
            reply["blog_id"] = str(reply["blog_id"])
            reply["user_id"] = str(reply.get("user_id", ""))
        
        comment["replies"] = replies
    
    # Get reaction counts
    reactions = {}
    for reaction in ["like", "love", "helpful", "insightful"]:
        count = await db.blog_reactions.count_documents({
            "blog_id": blog["_id"],
            "reaction_type": reaction
        })
        reactions[reaction] = count
    
    # Check if current user has reacted/bookmarked
    user_reactions = {}
    if current_user:
        user_reactions["liked"] = await db.blog_reactions.find_one({
            "blog_id": blog["_id"],
            "user_id": current_user["_id"],
            "reaction_type": "like"
        }) is not None
        
        user_reactions["bookmarked"] = await db.blog_bookmarks.find_one({
            "blog_id": blog["_id"],
            "user_id": current_user["_id"]
        }) is not None
    
    blog["_id"] = str(blog["_id"])
    blog["category_id"] = str(blog.get("category_id", ""))
    blog["author_id"] = str(blog.get("author_id", ""))
    
    for related_blog in related:
        related_blog["_id"] = str(related_blog["_id"])
    
    return {
        "blog": blog,
        "related_posts": related,
        "comments": comments,
        "reactions": reactions,
        "user_reactions": user_reactions
    }


# ==================== AUTHENTICATED ENDPOINTS ====================
@router.post("/{blog_id}/like")
async def like_blog(blog_id: str, current_user = Depends(get_current_user)):
    """Like or unlike a blog post"""
    blog = await db.blogs.find_one({"_id": ObjectId(blog_id)})
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")
    
    existing = await db.blog_reactions.find_one({
        "blog_id": ObjectId(blog_id),
        "user_id": current_user["_id"],
        "reaction_type": "like"
    })
    
    if existing:
        # Unlike
        await db.blog_reactions.delete_one({"_id": existing["_id"]})
        await db.blogs.update_one(
            {"_id": ObjectId(blog_id)},
            {"$inc": {"likes": -1}}
        )
        return {"liked": False}
    else:
        # Like
        await db.blog_reactions.insert_one({
            "blog_id": ObjectId(blog_id),
            "user_id": current_user["_id"],
            "reaction_type": "like",
            "created_at": datetime.utcnow()
        })
        await db.blogs.update_one(
            {"_id": ObjectId(blog_id)},
            {"$inc": {"likes": 1}}
        )
        return {"liked": True}

@router.post("/{blog_id}/bookmark")
async def bookmark_blog(blog_id: str, current_user = Depends(get_current_user)):
    """Bookmark or remove bookmark from blog"""
    blog = await db.blogs.find_one({"_id": ObjectId(blog_id)})
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")
    
    existing = await db.blog_bookmarks.find_one({
        "blog_id": ObjectId(blog_id),
        "user_id": current_user["_id"]
    })
    
    if existing:
        await db.blog_bookmarks.delete_one({"_id": existing["_id"]})
        await db.blogs.update_one(
            {"_id": ObjectId(blog_id)},
            {"$inc": {"bookmarks": -1}}
        )
        return {"bookmarked": False}
    else:
        await db.blog_bookmarks.insert_one({
            "blog_id": ObjectId(blog_id),
            "user_id": current_user["_id"],
            "created_at": datetime.utcnow()
        })
        await db.blogs.update_one(
            {"_id": ObjectId(blog_id)},
            {"$inc": {"bookmarks": 1}}
        )
        return {"bookmarked": True}


@router.post("/{blog_id}/comments")
async def add_comment(
    blog_id: str,
    comment_data: CommentCreate,
    current_user = Depends(get_current_user)
):
    """Add comment to blog post"""
    blog = await db.blogs.find_one({"_id": ObjectId(blog_id)})
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")
    
    comment = {
        "blog_id": ObjectId(blog_id),
        "user_id": current_user["_id"],
        "user_name": current_user.get("full_name", current_user.get("name", "Anonymous")),
        "user_avatar": current_user.get("avatar"),
        "user_email": current_user.get("email"),
        "parent_id": ObjectId(comment_data.parent_id) if comment_data.parent_id else None,
        "content": comment_data.content,
        "likes": 0,
        "is_approved": True,
        "is_spam": False,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    result = await db.blog_comments.insert_one(comment)
    
    # Increment comment count
    await db.blogs.update_one(
        {"_id": ObjectId(blog_id)},
        {"$inc": {"comments_count": 1}}
    )
    
    comment["_id"] = str(result.inserted_id)
    comment["blog_id"] = str(comment["blog_id"])
    comment["user_id"] = str(comment["user_id"])
    if comment["parent_id"]:
        comment["parent_id"] = str(comment["parent_id"])
    
    return comment

@router.get("/user/bookmarks")
async def get_user_bookmarks(current_user = Depends(get_current_user)):
    """Get user's bookmarked blogs"""
    pipeline = [
        {"$match": {"user_id": current_user["_id"]}},
        {"$lookup": {
            "from": "blogs",
            "localField": "blog_id",
            "foreignField": "_id",
            "as": "blog"
        }},
        {"$unwind": "$blog"},
        {"$match": {"blog.status": "published"}},
        {"$sort": {"created_at": -1}}
    ]
    
    bookmarks = await db.blog_bookmarks.aggregate(pipeline).to_list(length=50)
    
    for bookmark in bookmarks:
        bookmark["_id"] = str(bookmark["_id"])
        bookmark["blog"]["_id"] = str(bookmark["blog"]["_id"])
        bookmark["blog"]["category_id"] = str(bookmark["blog"].get("category_id", ""))
        bookmark["blog"]["author_id"] = str(bookmark["blog"].get("author_id", ""))
    
    return {"bookmarks": bookmarks}


# ==================== AUTHOR ENDPOINTS ====================
@router.post("/create")
async def create_blog(blog_data: BlogCreate, current_user = Depends(get_current_user)):
    """Create a new blog post (author or admin)"""
    # Check if user is author or admin
    if current_user.get("role") not in ["author", "admin", "employer"]:
        raise HTTPException(status_code=403, detail="Only authors can create blog posts")
    
    # Generate slug from title
    slug = re.sub(r'[^a-zA-Z0-9]+', '-', blog_data.title.lower()).strip('-')
    
    # Ensure unique slug
    existing = await db.blogs.find_one({"slug": slug})
    if existing:
        slug = f"{slug}-{datetime.now().strftime('%Y%m%d%H%M%S')}"
    
    # Generate excerpt if not provided
    excerpt = blog_data.excerpt
    if not excerpt:
        plain_text = re.sub(r'<[^>]+>', '', blog_data.content)
        excerpt = plain_text[:200] + "..." if len(plain_text) > 200 else plain_text
    
    # Calculate reading time
    word_count = len(blog_data.content.split())
    reading_time = max(1, round(word_count / 200))
    
    # Get category
    category = await db.blog_categories.find_one({"_id": ObjectId(blog_data.category_id)})
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    # Generate SEO metadata if not provided
    seo_title = blog_data.seo_title or blog_data.title
    seo_description = blog_data.seo_description or excerpt
    seo_keywords = blog_data.seo_keywords or blog_data.tags
    
    blog_doc = {
        "title": blog_data.title,
        "slug": slug,
        "content": blog_data.content,
        "excerpt": excerpt,
        "featured_image": blog_data.featured_image,
        "gallery_images": blog_data.gallery_images,
        "author_id": current_user["_id"],
        "author_name": current_user.get("full_name", current_user.get("name", "Anonymous")),
        "author_avatar": current_user.get("avatar"),
        "author_bio": current_user.get("bio", ""),
        "category_id": ObjectId(blog_data.category_id),
        "category_name": category["name"],
        "tags": blog_data.tags,
        "status": "draft",
        "is_featured": blog_data.is_featured,
        "is_premium": blog_data.is_premium,
        "views": 0,
        "likes": 0,
        "shares": 0,
        "bookmarks": 0,
        "comments_count": 0,
        "reading_time_minutes": reading_time,
        "seo_title": seo_title,
        "seo_description": seo_description,
        "seo_keywords": seo_keywords,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    result = await db.blogs.insert_one(blog_doc)
    
    return {
        "message": "Blog created successfully",
        "blog_id": str(result.inserted_id),
        "slug": slug
    }


@router.put("/{blog_id}")
async def update_blog(
    blog_id: str,
    blog_data: BlogUpdate,
    current_user = Depends(get_current_user)
):
    """Update blog post (author or admin)"""
    blog = await db.blogs.find_one({"_id": ObjectId(blog_id)})
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")
    
    # Check permission
    if blog["author_id"] != current_user["_id"] and current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Access denied")
    
    update_data = blog_data.dict(exclude_unset=True)
    
    if "category_id" in update_data:
        category = await db.blog_categories.find_one({"_id": ObjectId(update_data["category_id"])})
        if category:
            update_data["category_name"] = category["name"]
    
    update_data["updated_at"] = datetime.utcnow()
    
    await db.blogs.update_one(
        {"_id": ObjectId(blog_id)},
        {"$set": update_data}
    )
    
    return {"message": "Blog updated successfully"}

@router.post("/{blog_id}/publish")
async def publish_blog(blog_id: str, current_user = Depends(get_current_user)):
    """Publish a draft blog"""
    blog = await db.blogs.find_one({"_id": ObjectId(blog_id)})
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")
    
    # Check permission
    if blog["author_id"] != current_user["_id"] and current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Access denied")
    
    await db.blogs.update_one(
        {"_id": ObjectId(blog_id)},
        {"$set": {
            "status": "published",
            "published_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }}
    )
    
    return {"message": "Blog published successfully"}

@router.delete("/{blog_id}")
async def delete_blog(blog_id: str, current_user = Depends(get_current_user)):
    """Delete blog post (author or admin)"""
    blog = await db.blogs.find_one({"_id": ObjectId(blog_id)})
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")
    
    # Check permission
    if blog["author_id"] != current_user["_id"] and current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Delete related data
    await db.blog_comments.delete_many({"blog_id": ObjectId(blog_id)})
    await db.blog_reactions.delete_many({"blog_id": ObjectId(blog_id)})
    await db.blog_bookmarks.delete_many({"blog_id": ObjectId(blog_id)})
    await db.blog_views.delete_many({"blog_id": ObjectId(blog_id)})
    await db.blogs.delete_one({"_id": ObjectId(blog_id)})
    
    return {"message": "Blog deleted successfully"}


# ==================== NEWSLETTER ENDPOINTS ====================
@router.post("/newsletter/subscribe")
async def subscribe_newsletter(subscribe_data: NewsletterSubscribe):
    """Subscribe to blog newsletter"""
    email = subscribe_data.email
    name = subscribe_data.name
    
    if not email:
        raise HTTPException(status_code=400, detail="Email is required")
    
    existing = await db.blog_newsletter_subscribers.find_one({"email": email})
    
    if existing:
        if not existing.get("is_active"):
            await db.blog_newsletter_subscribers.update_one(
                {"_id": existing["_id"]},
                {"$set": {"is_active": True, "subscribed_at": datetime.utcnow()}}
            )
        return {"message": "Subscribed successfully"}
    
    subscriber = {
        "email": email,
        "name": name,
        "is_active": True,
        "subscribed_at": datetime.utcnow()
    }
    
    await db.blog_newsletter_subscribers.insert_one(subscriber)
    
    return {"message": "Subscribed successfully"}

@router.post("/newsletter/unsubscribe")
async def unsubscribe_newsletter(email: str):
    """Unsubscribe from blog newsletter"""
    await db.blog_newsletter_subscribers.update_one(
        {"email": email},
        {"$set": {"is_active": False, "unsubscribed_at": datetime.utcnow()}}
    )
    
    return {"message": "Unsubscribed successfully"}

# ==================== CATEGORY MANAGEMENT (Admin) ====================
@router.post("/categories/create")
async def create_category(category_data: CategoryCreate, current_user = Depends(get_current_user)):
    """Create blog category (admin only)"""
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    slug = re.sub(r'[^a-zA-Z0-9]+', '-', category_data.name.lower()).strip('-')
    
    # Get max order
    max_order_doc = await db.blog_categories.find_one(sort=[("order", -1)])
    order = (max_order_doc["order"] + 1) if max_order_doc else 1
    
    category = {
        "name": category_data.name,
        "slug": slug,
        "description": category_data.description,
        "icon": category_data.icon,
        "color": category_data.color,
        "post_count": 0,
        "order": order,
        "is_active": True,
        "created_at": datetime.utcnow()
    }
    
    result = await db.blog_categories.insert_one(category)
    
    return {"message": "Category created successfully", "category_id": str(result.inserted_id)}


# ==================== ANALYTICS ENDPOINTS (Admin) ====================
@router.get("/analytics/overview")
async def get_blog_analytics(current_user = Depends(get_current_user)):
    """Get blog analytics (admin only)"""
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Total posts
    total_posts = await db.blogs.count_documents({"status": "published"})
    draft_posts = await db.blogs.count_documents({"status": "draft"})
    
    # Total views (last 30 days)
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    total_views = await db.blog_views.count_documents({
        "viewed_at": {"$gte": thirty_days_ago}
    })
    
    # Total comments
    total_comments = await db.blog_comments.count_documents({"is_approved": True})
    
    # Average reading time
    pipeline = [
        {"$match": {"status": "published"}},
        {"$group": {
            "_id": None,
            "avg_reading_time": {"$avg": "$reading_time_minutes"}
        }}
    ]
    avg_reading = await db.blogs.aggregate(pipeline).to_list(length=1)
    
    # Top performing posts
    top_posts = await db.blogs.find({
        "status": "published"
    }).sort("views", -1).limit(5).to_list(length=5)
    
    for post in top_posts:
        post["_id"] = str(post["_id"])
    
    # Views by day (last 7 days)
    views_by_day = []
    for i in range(7):
        day = datetime.utcnow() - timedelta(days=i)
        day_start = datetime(day.year, day.month, day.day)
        day_end = day_start + timedelta(days=1)
        
        count = await db.blog_views.count_documents({
            "viewed_at": {"$gte": day_start, "$lt": day_end}
        })
        
        views_by_day.append({
            "date": day.strftime("%Y-%m-%d"),
            "views": count
        })
    
    views_by_day.reverse()
    
    return {
        "total_posts": total_posts,
        "draft_posts": draft_posts,
        "total_views_30d": total_views,
        "total_comments": total_comments,
        "avg_reading_time": avg_reading[0]["avg_reading_time"] if avg_reading else 0,
        "top_posts": top_posts,
        "views_by_day": views_by_day
    }

@router.get("/user/my-blogs")
async def get_my_blogs(current_user = Depends(get_current_user)):
    """Get current user's blog posts"""
    blogs = await db.blogs.find({
        "author_id": current_user["_id"]
    }).sort("created_at", -1).to_list(length=100)
    
    for blog in blogs:
        blog["_id"] = str(blog["_id"])
        blog["category_id"] = str(blog.get("category_id", ""))
        blog["author_id"] = str(blog.get("author_id", ""))
    
    return {"blogs": blogs}
