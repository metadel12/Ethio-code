import { useEffect, useState } from "react";
import HeroSection from "../components/home/HeroSection";
import StatsSection from "../components/home/StatsSection";
import LearningMethodsSection from "../components/home/LearningMethodsSection";
import TechnologiesSection from "../components/home/TechnologiesSection";
import JobListingsSection from "../components/home/JobListingsSection";
import TestimonialsSection from "../components/home/TestimonialsSection";
import HowItWorksSection from "../components/home/HowItWorksSection";
import PartnersSection from "../components/home/PartnersSection";
import LearningPathsSection from "../components/home/LearningPathsSection";
import CommunitySection from "../components/home/CommunitySection";
import BlogSection from "../components/home/BlogSection";
import EventsSection from "../components/home/EventsSection";
import PricingSection from "../components/home/PricingSection";
import NewsletterSection from "../components/home/NewsletterSection";
import FAQSection from "../components/home/FAQSection";
import Footer from "../components/home/Footer";
import { fetchStats } from "../api/homeApi";

export default function UltimateHomePage() {
  const [stats, setStats] = useState({
    total_users: 0,
    total_jobs: 0,
    success_rate: 0,
    salary_boost: 0,
    problems_solved: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await fetchStats();
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
      // Use fallback stats
      setStats({
        total_users: 10000,
        total_jobs: 500,
        success_rate: 98.7,
        salary_boost: 247,
        problems_solved: 50000,
      });
    } finally {
      setLoading(false);
    }
  };

  const displayStats = loading
    ? { total_users: "...", total_jobs: "...", success_rate: "...", salary_boost: "...", problems_solved: "..." }
    : stats;

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 transition-colors duration-300">
      {/* 1. Hero Section */}
      <HeroSection stats={displayStats} />

      {/* 2. Live Stats */}
      <StatsSection stats={displayStats} />

      {/* 3. Learning Methods */}
      <LearningMethodsSection />

      {/* 4. Technologies */}
      <TechnologiesSection />

      {/* 5. Job Listings - Ethiopian Companies */}
      <JobListingsSection />

      {/* 6. Success Stories */}
      <TestimonialsSection />

      {/* 7. How It Works (3 Steps) */}
      <HowItWorksSection />

      {/* 8. Company Partners */}
      <PartnersSection />

      {/* 9. Learning Paths by Level */}
      <LearningPathsSection />

      {/* 10. Community Hub */}
      <CommunitySection />

      {/* 11. Blog & Resources */}
      <BlogSection />

      {/* 12. Events & Workshops */}
      <EventsSection />

      {/* 13. Pricing */}
      <PricingSection />

      {/* 14. Newsletter CTA */}
      <NewsletterSection />

      {/* 15. FAQ */}
      <FAQSection />

      {/* Footer */}
      <Footer />
    </div>
  );
}
