# EthioCode - Modern Home Page

A sleek, minimal, universally appealing home page for **EthioCode** - Ethiopia's premier coding education and job platform.

## 🎯 Project Overview

Built with **React (Vite) + Tailwind CSS** frontend and **FastAPI + MongoDB** backend. Features a white/dark theme toggle, real Ethiopian job listings, comprehensive learning methods, and modern animations.

## ✨ Features

### Frontend
- **Minimalist Modern Design** - Clean lines, ample whitespace, subtle gradients
- **White/Dark Theme** - Toggle with persistence (localStorage)
- **Fully Responsive** - Mobile, tablet, desktop, 4K
- **Smooth Animations** - Using Framer Motion and Tailwind CSS
- **15 Sections** - Complete landing page content
- **Real-time Data** - Fetch from API endpoints

### Backend
- **FastAPI** - High-performance async Python framework
- **MongoDB + Motor** - Async document database
- **Real Ethiopian Data** - Jobs from companies like Chapa, Safaricom, Dashen Bank
- **RESTful APIs** - Cached endpoints for fast loading

## 🗂️ 15 Home Page Sections

1. **Modern Hero** - Typing animation, CTA buttons, trust badges
2. **Live Stats** - Animated counters from database
3. **Learning Methods** - 6 cards (challenges, videos, projects, etc.)
4. **Technologies** - 5x4 grid of tech stack
5. **Job Listings** - Real Ethiopian tech jobs with external links
6. **Success Stories** - Carousel of Ethiopian developer testimonials
7. **How It Works** - 3-step process
8. **Company Partners** - Trusted by logos
9. **Learning Paths** - 4 cards by experience level
10. **Community Hub** - Discord/Telegram integration with live stats
11. **Blog & Resources** - Featured articles
12. **Events & Workshops** - Upcoming sessions
13. **Pricing** - Free/Pro Monthly/Pro Yearly tiers
14. **Newsletter CTA** - Email subscription banner
15. **FAQ Accordion** - 6 common questions
16. **Footer** - 4-column layout with links

## 🛠️ Tech Stack

### Frontend
| Package | Version |
|---------|---------|
| React | 18.3 |
| Vite | 5.0 |
| Tailwind CSS | 3.4 |
| Framer Motion | 12.38 |
| React Router DOM | 6.20 |
| Axios | 1.15 |
| React Icons | 5.5 |

### Backend
| Package | Version |
|---------|---------|
| FastAPI | 0.104 |
| Motor | 3.x |
| Pydantic | 2.x |
| Uvicorn | 0.24 |

## 📦 Installation

### Prerequisites
- Node.js 18+
- Python 3.11+
- MongoDB 6+ (local or Atlas)

### 1. Clone Repository

```bash
cd "C:\Users\tg computer\Desktop\Projects\ethio code\Ethio-code"
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1  # Windows PowerShell
# OR
source venv/bin/activate  # Mac/Linux

# Install dependencies
pip install fastapi uvicorn motor pydantic pydantic-settings python-jose[cryptography] passlib[bcrypt] faker

# Configure environment
cp .env.example .env
# Edit .env with your settings (MONGODB_URL, SECRET_KEY, etc.)

# Initialize MongoDB with seed data
python seed_mongo.py

# Start the API server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

API will run at `http://localhost:8000`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will run at `http://localhost:5173`

### 4. MongoDB Atlas (Optional)

If using MongoDB Atlas instead of local:

```env
MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/
MONGODB_DB_NAME=ethiocode
```

## 🗄️ Database Schema

### Collections

- **jobs** - Tech job listings from Ethiopian companies
- **testimonials** - Success stories from developers
- **blogs** - Blog posts and tutorials
- **events** - Workshops and meetups
- **newsletter** - Email subscriptions
- **users** - Platform users

## 📡 API Endpoints

All endpoints under `/api/v1/`:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/stats` | Homepage stats |
| GET | `/jobs` | Latest job listings |
| GET | `/testimonials` | Success stories |
| GET | `/blogs/featured` | Featured blog posts |
| GET | `/events/upcoming` | Upcoming events |
| GET | `/technologies` | Tech stack list |
| GET | `/learning-paths` | Learning paths |
| GET | `/community-stats` | Discord/Telegram stats |
| GET | `/pricing` | Pricing tiers |
| GET | `/faqs` | FAQ items |
| POST | `/newsletter/subscribe` | Subscribe to newsletter |

## 🎨 Tailwind Configuration

Extending colors for theme:

```js
colors: {
  'ethiopia-green': { light: '#10B981', DEFAULT: '#10B981', dark: '#34D399' },
  'ethiopia-blue': { light: '#3B82F6', DEFAULT: '#3B82F6', dark: '#60A5FA' },
  'ethiopia-purple': { light: '#8B5CF6', DEFAULT: '#8B5CF6', dark: '#A78BFA' },
  // Light mode palette
  'light-bg': '#FFFFFF',
  'light-surface': '#F8FAFC',
  'light-text': '#0F172A',
  // Dark mode palette
  'dark-bg': '#0F172A',
  'dark-surface': '#1E293B',
  'dark-text': '#F8FAFC',
}
```

## 🔄 Theme Toggle

The theme toggle uses:

- **LocalStorage** - Persists user preference
- **CSS Class** - `.dark` class on HTML root
- **Tailwind dark:** - Conditional styling
- **Transition** - Smooth 300ms color changes

Toggle location: Fixed top-right corner

## 📱 Responsive Breakpoints

| Breakpoint | Width | Grid Cols |
|------------|-------|-----------|
| Mobile | default (0px) | 1 col |
| Tablet | sm:640px | 2 cols |
| Desktop | md:768px | 3 cols |
| Large | lg:1024px | 4 cols |
| XL | xl:1280px | max-w-7xl |

## 🚀 Performance Targets

- **LCP** (Largest Contentful Paint): < 1.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1
- **Lighthouse Score**: > 95
- **Mobile Score**: > 90

## 🐳 Docker Setup

### Backend
```bash
cd backend
docker-compose up -d
```

### Frontend
```bash
cd frontend
docker build -t ethiocode-frontend .
docker run -p 5173:80 ethiocode-frontend
```

## 📁 Project Structure

```
ethiocode/
├── backend/
│   ├── app/
│   │   ├── api/v1/
│   │   │   └── home.py           # API endpoints
│   │   ├── models/               # MongoDB schemas
│   │   │   ├── job.py
│   │   │   ├── testimonial.py
│   │   │   ├── blog.py
│   │   │   ├── event.py
│   │   │   └── newsletter.py
│   │   ├── database_mongo.py     # Motor connection
│   │   ├── config.py             # Settings
│   │   └── main.py               # FastAPI app
│   ├── seed_mongo.py             # Database seeder
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── home/             # Home page components
│   │   │       ├── HeroSection.jsx
│   │   │       ├── StatsSection.jsx
│   │   │       ├── LearningMethodsSection.jsx
│   │   │       ├── TechnologiesSection.jsx
│   │   │       ├── JobListingsSection.jsx
│   │   │       ├── TestimonialsSection.jsx
│   │   │       ├── HowItWorksSection.jsx
│   │   │       ├── PartnersSection.jsx
│   │   │       ├── LearningPathsSection.jsx
│   │   │       ├── CommunitySection.jsx
│   │   │       ├── BlogSection.jsx
│   │   │       ├── EventsSection.jsx
│   │   │       ├── PricingSection.jsx
│   │   │       ├── NewsletterSection.jsx
│   │   │       ├── FAQSection.jsx
│   │   │       └── Footer.jsx
│   │   ├── context/
│   │   │   └── ThemeContext.jsx
│   │   ├── pages/
│   │   │   └── UltimateHomePageNew.jsx
│   │   └── api/
│   │       └── homeApi.js
│   ├── tailwind.config.js
│   └── vite.config.js
└── README.md
```

## 🌟 Real Ethiopian Companies

Jobs sourced from actual Ethiopian companies:

| Company | Type | Careers URL |
|---------|------|-------------|
| Chapa | Fintech | chapa.co/careers |
| Safaricom Ethiopia | Telecom | safaricom.et/careers |
| Dashen Bank | Banking | dashenbanksc.com/careers |
| Ethio Telecom | Telecom | ethiotelecom.et/careers |
| Kifiya Financial | Fintech | kifiya.com/careers |
| Awash Bank | Banking | awashbank.com/careers |
| Bank of Abyssinia | Banking | bankofabyssinia.com/career |
| Nib Insurance | Insurance | nibinsurance.com.et/careers |
| BelCash | Fintech | belcash.com/career |
| Addis Software | Software | addissoftware.com/careers |

## 🔧 Build Commands

### Frontend
```bash
npm run dev        # Development
npm run build      # Production build
npm run preview    # Preview build
npm run lint       # ESLint check
```

### Backend
```bash
uvicorn app.main:app --reload
```

### Database Seeding
```bash
python seed_mongo.py
```

## 📦 Package Scripts Reference

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint . --ext js,jsx",
    "preview": "vite preview"
  }
}
```

## 🔍 Key Design Decisions

1. **No Custom CSS** - All styling via Tailwind
2. **Dark Mode First** - Works in both themes
3. **Mobile-First** - Responsive by default
4. **Component Isolation** - Each section is its own component
5. **API-First** - All data from backend
6. **Ethiopia-Focused** - Local companies, content, community

## 🎯 Accessibility

- WCAG 2.1 AA compliant
- ARIA labels on interactive elements
- Keyboard navigation support
- Color contrast ratios meet standards
- Focus states clearly visible

## 🐛 Troubleshooting

### Frontend won't start
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Backend connection refused
```bash
# Check MongoDB is running
mongo --eval "db.adminCommand('ping')"
# Or if using Atlas, verify MONGODB_URL
```

### Theme not persisting
Check browser localStorage: `localStorage.getItem('theme')`

### APIs returning empty data
Run seed script: `python seed_mongo.py`

## 📄 License

Proprietary - EthioCode 2024

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Follow ESLint rules
4. Test on both themes
5. Submit PR

## 📞 Contact

- **Email:** support@ethiocode.com
- **Discord:** discord.ethiocode.com
- **Telegram:** t.me/ethiocode

---

**"Empowering Ethiopian developers for global success"** 🚀🇪🇹
