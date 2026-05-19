"""
Seed script to create sample blog articles for each category
Run: python seed_blog_articles.py
"""
import asyncio
from datetime import datetime, timedelta
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId

# MongoDB connection
MONGO_URL = "mongodb://localhost:27017"
DATABASE_NAME = "ethiocode"

async def seed_articles():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DATABASE_NAME]
    
    # Get categories
    categories = await db.blog_categories.find({}).to_list(length=10)
    
    if not categories:
        print("❌ No categories found! Please run seed_blog_categories.py first.")
        return
    
    # Get a user to be the author (or create a default one)
    author = await db.users.find_one({})
    
    if not author:
        # Create a default author
        author_data = {
            "email": "author@ethiocode.com",
            "full_name": "EthioCode Team",
            "name": "EthioCode Team",
            "avatar": "https://ui-avatars.com/api/?name=EthioCode+Team&background=10b981&color=fff",
            "bio": "Building the future of Ethiopian tech education",
            "role": "author",
            "created_at": datetime.utcnow()
        }
        result = await db.users.insert_one(author_data)
        author = await db.users.find_one({"_id": result.inserted_id})
        print(f"✅ Created default author: {author['full_name']}")
    
    # Sample articles for each category
    articles_data = {
        "tutorial": [
            {
                "title": "Getting Started with Python: A Complete Beginner's Guide",
                "content": """
                <h2>Introduction to Python</h2>
                <p>Python is one of the most popular programming languages in the world, known for its simplicity and versatility. Whether you're interested in web development, data science, or automation, Python is an excellent choice.</p>
                
                <h3>Why Learn Python?</h3>
                <ul>
                    <li>Easy to learn and read</li>
                    <li>Versatile - used in web dev, data science, AI, automation</li>
                    <li>Large community and extensive libraries</li>
                    <li>High demand in the job market</li>
                </ul>
                
                <h3>Installing Python</h3>
                <p>First, download Python from <a href="https://python.org">python.org</a>. Choose the latest version for your operating system.</p>
                
                <h3>Your First Python Program</h3>
                <pre><code>print("Hello, Ethiopia!")</code></pre>
                
                <h3>Basic Concepts</h3>
                <p>Let's cover some fundamental concepts:</p>
                
                <h4>Variables</h4>
                <pre><code>name = "Abebe"
age = 25
is_student = True</code></pre>
                
                <h4>Data Types</h4>
                <p>Python has several built-in data types including strings, integers, floats, booleans, lists, and dictionaries.</p>
                
                <h3>Next Steps</h3>
                <p>Practice is key! Start with small projects and gradually increase complexity. Join the EthioCode community to connect with other learners.</p>
                """,
                "excerpt": "Learn Python from scratch with this comprehensive beginner's guide. Perfect for Ethiopian developers starting their coding journey.",
                "featured_image": "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=1200",
                "tags": ["python", "tutorial", "beginner", "programming"],
                "is_featured": True
            },
            {
                "title": "Building Your First React Application",
                "content": """
                <h2>Introduction to React</h2>
                <p>React is a powerful JavaScript library for building user interfaces. Created by Facebook, it's now one of the most popular frontend frameworks.</p>
                
                <h3>Prerequisites</h3>
                <ul>
                    <li>Basic HTML, CSS, and JavaScript knowledge</li>
                    <li>Node.js installed on your computer</li>
                    <li>A code editor (VS Code recommended)</li>
                </ul>
                
                <h3>Setting Up Your Project</h3>
                <pre><code>npx create-react-app my-first-app
cd my-first-app
npm start</code></pre>
                
                <h3>Understanding Components</h3>
                <p>Components are the building blocks of React applications. Here's a simple component:</p>
                
                <pre><code>function Welcome() {
  return &lt;h1&gt;Welcome to EthioCode!&lt;/h1&gt;;
}</code></pre>
                
                <h3>State and Props</h3>
                <p>State allows components to manage their own data, while props allow data to be passed between components.</p>
                
                <h3>Building a Todo App</h3>
                <p>Let's build a simple todo application to practice these concepts...</p>
                """,
                "excerpt": "Create your first React application with this step-by-step tutorial. Learn components, state, and props.",
                "featured_image": "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1200",
                "tags": ["react", "javascript", "frontend", "tutorial"],
                "is_featured": False
            }
        ],
        "career": [
            {
                "title": "How to Land Your First Tech Job in Ethiopia",
                "content": """
                <h2>Breaking Into Tech in Ethiopia</h2>
                <p>The Ethiopian tech industry is growing rapidly, with numerous opportunities for skilled developers. Here's your roadmap to landing that first job.</p>
                
                <h3>1. Build a Strong Foundation</h3>
                <p>Master the fundamentals of programming. Choose one language and become proficient in it before moving to others.</p>
                
                <h3>2. Create a Portfolio</h3>
                <ul>
                    <li>Build 3-5 solid projects</li>
                    <li>Host them on GitHub</li>
                    <li>Deploy at least one live project</li>
                    <li>Write clear documentation</li>
                </ul>
                
                <h3>3. Network Actively</h3>
                <p>Join Ethiopian tech communities:</p>
                <ul>
                    <li>Attend meetups and conferences</li>
                    <li>Join online communities (Telegram, Discord)</li>
                    <li>Connect with developers on LinkedIn</li>
                    <li>Contribute to open source projects</li>
                </ul>
                
                <h3>4. Prepare for Interviews</h3>
                <p>Practice coding challenges on platforms like LeetCode and HackerRank. Study common interview questions and practice explaining your projects.</p>
                
                <h3>5. Apply Strategically</h3>
                <p>Don't just apply randomly. Research companies, tailor your resume, and write personalized cover letters.</p>
                
                <h3>Top Companies Hiring in Ethiopia</h3>
                <ul>
                    <li>Ride (formerly ZayRide)</li>
                    <li>Kifiya Financial Technology</li>
                    <li>Gebeya</li>
                    <li>Kazana Group</li>
                    <li>And many more startups!</li>
                </ul>
                """,
                "excerpt": "A comprehensive guide to landing your first tech job in Ethiopia's growing tech industry.",
                "featured_image": "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1200",
                "tags": ["career", "jobs", "ethiopia", "advice"],
                "is_featured": True
            },
            {
                "title": "Salary Expectations for Developers in Ethiopia (2024)",
                "content": """
                <h2>Developer Salaries in Ethiopia</h2>
                <p>Understanding salary ranges helps you negotiate better and set realistic expectations. Here's a breakdown of developer salaries in Ethiopia.</p>
                
                <h3>Junior Developer (0-2 years)</h3>
                <p><strong>Range:</strong> 15,000 - 30,000 ETB/month</p>
                <p>Entry-level positions for fresh graduates or bootcamp graduates.</p>
                
                <h3>Mid-Level Developer (2-5 years)</h3>
                <p><strong>Range:</strong> 30,000 - 60,000 ETB/month</p>
                <p>Developers with solid experience and proven track record.</p>
                
                <h3>Senior Developer (5+ years)</h3>
                <p><strong>Range:</strong> 60,000 - 120,000+ ETB/month</p>
                <p>Experienced developers with leadership skills and specialized expertise.</p>
                
                <h3>Factors Affecting Salary</h3>
                <ul>
                    <li>Company size and funding</li>
                    <li>Your skill set and specialization</li>
                    <li>Location (Addis Ababa vs. other cities)</li>
                    <li>Remote vs. on-site</li>
                    <li>Negotiation skills</li>
                </ul>
                
                <h3>Benefits to Consider</h3>
                <p>Don't just focus on base salary. Consider health insurance, professional development budget, flexible hours, and remote work options.</p>
                """,
                "excerpt": "Comprehensive breakdown of developer salaries in Ethiopia for 2024. Know your worth!",
                "featured_image": "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=1200",
                "tags": ["salary", "career", "ethiopia", "compensation"],
                "is_featured": False
            }
        ],
        "news": [
            {
                "title": "Ethiopia's Tech Ecosystem: 2024 Growth Report",
                "content": """
                <h2>Ethiopian Tech on the Rise</h2>
                <p>Ethiopia's technology sector has seen remarkable growth in 2024, with increased investment, new startups, and expanding opportunities for developers.</p>
                
                <h3>Key Highlights</h3>
                <ul>
                    <li>Over $50M in venture capital invested in Ethiopian startups</li>
                    <li>200+ new tech startups launched</li>
                    <li>5,000+ new tech jobs created</li>
                    <li>Growing fintech and e-commerce sectors</li>
                </ul>
                
                <h3>Major Developments</h3>
                
                <h4>Fintech Boom</h4>
                <p>Mobile money and digital payment solutions are transforming how Ethiopians handle finances. Companies like Telebirr and CBE Birr are leading the charge.</p>
                
                <h4>E-Commerce Growth</h4>
                <p>Online shopping platforms are gaining traction, with improved logistics and payment systems.</p>
                
                <h4>Government Support</h4>
                <p>The government has launched initiatives to support tech entrepreneurship and digital transformation.</p>
                
                <h3>Challenges Ahead</h3>
                <p>Despite growth, challenges remain including internet connectivity, payment infrastructure, and access to funding.</p>
                
                <h3>Looking Forward</h3>
                <p>The future looks bright for Ethiopian tech. With continued investment and talent development, Ethiopia is positioning itself as a tech hub in East Africa.</p>
                """,
                "excerpt": "Ethiopia's tech ecosystem shows remarkable growth in 2024 with increased investment and opportunities.",
                "featured_image": "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200",
                "tags": ["news", "ethiopia", "tech", "growth"],
                "is_featured": True
            }
        ],
        "success-story": [
            {
                "title": "From Bootcamp to Senior Developer: Abebe's Journey",
                "content": """
                <h2>A Success Story from Addis Ababa</h2>
                <p>Meet Abebe Tadesse, who went from a coding bootcamp graduate to a senior developer at a leading Ethiopian tech company in just 3 years.</p>
                
                <h3>The Beginning</h3>
                <p>"I had no computer science degree," Abebe recalls. "I was working in a completely different field when I discovered coding through a free online course."</p>
                
                <h3>The Bootcamp Experience</h3>
                <p>Abebe enrolled in a 6-month intensive coding bootcamp. "It was challenging, but the structured learning and project-based approach helped me build real skills quickly."</p>
                
                <h3>First Job Hunt</h3>
                <p>Landing the first job wasn't easy. "I applied to over 50 positions and got rejected many times. But I kept improving my portfolio and practicing coding challenges."</p>
                
                <h3>Breaking Through</h3>
                <p>His breakthrough came when he built a mobile app that solved a local problem. "That project caught the attention of my current employer."</p>
                
                <h3>Rapid Growth</h3>
                <p>Within 3 years, Abebe progressed from junior to senior developer. His secret? "Continuous learning, taking on challenging projects, and mentoring others."</p>
                
                <h3>Advice for Aspiring Developers</h3>
                <blockquote>
                "Don't wait for the perfect moment. Start learning today. Build projects that solve real problems. Network with other developers. And never stop learning."
                </blockquote>
                
                <h3>Current Role</h3>
                <p>Today, Abebe leads a team of 5 developers and contributes to open source projects. He also mentors bootcamp students, giving back to the community that helped him start.</p>
                """,
                "excerpt": "How Abebe went from bootcamp graduate to senior developer in 3 years. An inspiring Ethiopian success story.",
                "featured_image": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=1200",
                "tags": ["success-story", "inspiration", "career", "ethiopia"],
                "is_featured": True
            }
        ],
        "interview-prep": [
            {
                "title": "Top 20 JavaScript Interview Questions for 2024",
                "content": """
                <h2>Master These JavaScript Questions</h2>
                <p>Preparing for a JavaScript interview? Here are the top 20 questions you're likely to encounter, with detailed explanations.</p>
                
                <h3>1. What is the difference between let, const, and var?</h3>
                <p><strong>Answer:</strong> var is function-scoped, while let and const are block-scoped. const cannot be reassigned, but let can.</p>
                
                <pre><code>var x = 1;  // function-scoped
let y = 2;  // block-scoped, can be reassigned
const z = 3; // block-scoped, cannot be reassigned</code></pre>
                
                <h3>2. Explain closures in JavaScript</h3>
                <p><strong>Answer:</strong> A closure is a function that has access to variables in its outer (enclosing) function's scope, even after the outer function has returned.</p>
                
                <pre><code>function outer() {
  let count = 0;
  return function inner() {
    count++;
    return count;
  };
}
const counter = outer();
console.log(counter()); // 1
console.log(counter()); // 2</code></pre>
                
                <h3>3. What is the event loop?</h3>
                <p><strong>Answer:</strong> The event loop is JavaScript's mechanism for handling asynchronous operations. It continuously checks the call stack and task queue.</p>
                
                <h3>4. Explain promises and async/await</h3>
                <p><strong>Answer:</strong> Promises represent the eventual completion or failure of an asynchronous operation. Async/await is syntactic sugar for working with promises.</p>
                
                <pre><code>// Promise
fetch('/api/data')
  .then(response => response.json())
  .then(data => console.log(data));

// Async/await
async function getData() {
  const response = await fetch('/api/data');
  const data = await response.json();
  console.log(data);
}</code></pre>
                
                <h3>5. What is the difference between == and ===?</h3>
                <p><strong>Answer:</strong> == performs type coercion before comparison, while === checks both value and type without coercion.</p>
                
                <p><em>Continue reading for 15 more essential questions...</em></p>
                """,
                "excerpt": "Master the top 20 JavaScript interview questions with detailed explanations and code examples.",
                "featured_image": "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=1200",
                "tags": ["interview", "javascript", "preparation", "coding"],
                "is_featured": True
            }
        ],
        "tech-stack": [
            {
                "title": "React vs Vue vs Angular: Which Framework to Choose in 2024?",
                "content": """
                <h2>The Great Frontend Framework Debate</h2>
                <p>Choosing the right frontend framework can significantly impact your project's success. Let's compare the top three options.</p>
                
                <h3>React</h3>
                <h4>Pros:</h4>
                <ul>
                    <li>Huge ecosystem and community</li>
                    <li>Flexible and unopinionated</li>
                    <li>Strong job market demand</li>
                    <li>Backed by Facebook/Meta</li>
                </ul>
                
                <h4>Cons:</h4>
                <ul>
                    <li>Steeper learning curve</li>
                    <li>Requires additional libraries for routing, state management</li>
                    <li>Frequent updates can be overwhelming</li>
                </ul>
                
                <h3>Vue</h3>
                <h4>Pros:</h4>
                <ul>
                    <li>Easiest to learn</li>
                    <li>Great documentation</li>
                    <li>Progressive framework - use as much or as little as needed</li>
                    <li>Excellent performance</li>
                </ul>
                
                <h4>Cons:</h4>
                <ul>
                    <li>Smaller ecosystem than React</li>
                    <li>Less corporate backing</li>
                    <li>Fewer job opportunities</li>
                </ul>
                
                <h3>Angular</h3>
                <h4>Pros:</h4>
                <ul>
                    <li>Complete framework with everything included</li>
                    <li>TypeScript by default</li>
                    <li>Backed by Google</li>
                    <li>Great for large enterprise applications</li>
                </ul>
                
                <h4>Cons:</h4>
                <ul>
                    <li>Steepest learning curve</li>
                    <li>Verbose syntax</li>
                    <li>Heavier bundle size</li>
                </ul>
                
                <h3>Our Recommendation</h3>
                <p><strong>For beginners:</strong> Start with Vue for its gentle learning curve.</p>
                <p><strong>For job seekers:</strong> Learn React for maximum opportunities.</p>
                <p><strong>For enterprise:</strong> Consider Angular for large-scale applications.</p>
                
                <h3>Conclusion</h3>
                <p>There's no "best" framework - it depends on your needs, team, and project requirements. All three are excellent choices.</p>
                """,
                "excerpt": "Comprehensive comparison of React, Vue, and Angular to help you choose the right framework for your project.",
                "featured_image": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200",
                "tags": ["react", "vue", "angular", "comparison", "frontend"],
                "is_featured": False
            }
        ]
    }
    
    # Check if articles already exist
    existing = await db.blogs.count_documents({})
    if existing > 0:
        print(f"⚠️  {existing} articles already exist. Skipping seed.")
        print("   Delete existing articles first if you want to re-seed.")
        return
    
    # Create articles
    total_created = 0
    
    for category in categories:
        category_slug = category["slug"]
        category_articles = articles_data.get(category_slug, [])
        
        if not category_articles:
            continue
        
        for idx, article_data in enumerate(category_articles):
            # Calculate reading time
            word_count = len(article_data["content"].split())
            reading_time = max(1, round(word_count / 200))
            
            # Create slug from title
            slug = article_data["title"].lower()
            slug = slug.replace(" ", "-")
            slug = "".join(c for c in slug if c.isalnum() or c == "-")
            
            # Create article
            article = {
                "title": article_data["title"],
                "slug": slug,
                "content": article_data["content"],
                "excerpt": article_data["excerpt"],
                "featured_image": article_data["featured_image"],
                "gallery_images": [],
                "author_id": author["_id"],
                "author_name": author.get("full_name", author.get("name", "EthioCode Team")),
                "author_avatar": author.get("avatar", ""),
                "author_bio": author.get("bio", ""),
                "category_id": category["_id"],
                "category_name": category["name"],
                "tags": article_data["tags"],
                "status": "published",
                "is_featured": article_data["is_featured"],
                "is_premium": False,
                "views": (idx + 1) * 150,  # Simulate some views
                "likes": (idx + 1) * 25,   # Simulate some likes
                "shares": (idx + 1) * 5,
                "bookmarks": (idx + 1) * 10,
                "comments_count": 0,
                "reading_time_minutes": reading_time,
                "seo_title": article_data["title"],
                "seo_description": article_data["excerpt"],
                "seo_keywords": article_data["tags"],
                "published_at": datetime.utcnow() - timedelta(days=idx * 2),
                "created_at": datetime.utcnow() - timedelta(days=idx * 2),
                "updated_at": datetime.utcnow()
            }
            
            await db.blogs.insert_one(article)
            total_created += 1
            print(f"  ✅ Created: {article['title'][:50]}...")
    
    print(f"\n🎉 Successfully created {total_created} blog articles!")
    print(f"📊 Articles per category:")
    
    # Show count per category
    for category in categories:
        count = await db.blogs.count_documents({
            "category_id": category["_id"],
            "status": "published"
        })
        if count > 0:
            print(f"  {category['icon']} {category['name']}: {count} articles")
    
    client.close()

if __name__ == "__main__":
    print("🌱 Seeding blog articles...")
    print("=" * 60)
    asyncio.run(seed_articles())
    print("=" * 60)
    print("✨ Done! Visit http://localhost:5173/blogs to see your articles!")
