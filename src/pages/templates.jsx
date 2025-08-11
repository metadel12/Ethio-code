import React, { useState } from "react";
import "./templates.css";

const Templates = () => {
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("popular");

  const categories = [
    { id: "all", name: "All Templates", icon: "fas fa-th" },
    { id: "business", name: "Business", icon: "fas fa-briefcase" },
    { id: "design", name: "Design", icon: "fas fa-palette" },
    { id: "development", name: "Development", icon: "fas fa-code" },
    { id: "marketing", name: "Marketing", icon: "fas fa-bullhorn" },
    { id: "education", name: "Education", icon: "fas fa-graduation-cap" },
  ];

  const templates = [
    {
      id: 1,
      name: "Project Proposal",
      category: "business",
      description:
        "Professional project proposal template for client presentations",
      popularity: 4.8,
      downloads: 1200,
      updated: "3 days ago",
      preview: "/preview/project-proposal",
    },
    {
      id: 2,
      name: "UI Kit",
      category: "design",
      description: "Modern UI components library for web applications",
      popularity: 4.9,
      downloads: 4500,
      updated: "1 week ago",
      preview: "/preview/ui-kit",
    },
    {
      id: 3,
      name: "API Documentation",
      category: "development",
      description: "Clean documentation template for REST APIs",
      popularity: 4.5,
      downloads: 3200,
      updated: "2 weeks ago",
      preview: "/preview/api-docs",
    },
    {
      id: 4,
      name: "Social Media Calendar",
      category: "marketing",
      description: "Monthly planning calendar for social content",
      popularity: 4.7,
      downloads: 2800,
      updated: "5 days ago",
      preview: "/preview/social-calendar",
    },
    {
      id: 5,
      name: "Annual Report",
      category: "business",
      description: "Corporate annual report template with data visualization",
      popularity: 4.6,
      downloads: 1900,
      updated: "1 month ago",
      preview: "/preview/annual-report",
    },
    {
      id: 6,
      name: "Wireframe Kit",
      category: "design",
      description: "Low-fidelity wireframing components",
      popularity: 4.4,
      downloads: 3500,
      updated: "2 days ago",
      preview: "/preview/wireframe-kit",
    },
    {
      id: 7,
      name: "Lesson Plan",
      category: "education",
      description: "Structured educational lesson planning template",
      popularity: 4.7,
      downloads: 4200,
      updated: "4 days ago",
      preview: "/preview/lesson-plan",
    },
    {
      id: 8,
      name: "E-commerce Dashboard",
      category: "business",
      description: "Analytics dashboard for online stores",
      popularity: 4.9,
      downloads: 5100,
      updated: "1 week ago",
      preview: "/preview/ecommerce-dashboard",
    },
    {
      id: 9,
      name: "Mobile App Flow",
      category: "design",
      description: "User journey mapping for mobile applications",
      popularity: 4.3,
      downloads: 2700,
      updated: "3 weeks ago",
      preview: "/preview/mobile-flow",
    },
  ];

  // Filter and sort templates
  const filteredTemplates = templates
    .filter(
      (template) =>
        (filter === "all" || template.category === filter) &&
        (searchQuery === "" ||
          template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          template.description
            .toLowerCase()
            .includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortOption === "popular") {
        return b.popularity - a.popularity;
      } else if (sortOption === "downloads") {
        return b.downloads - a.downloads;
      } else if (sortOption === "newest") {
        return new Date(b.updated) - new Date(a.updated);
      }
      return a.name.localeCompare(b.name);
    });

  return (
    <div className="templates-container">
      {/* Hero Section */}
      <section className="templates-hero">
        <div className="hero-content">
          <h1>Professional Templates</h1>
          <p>Jumpstart your projects with expertly designed templates</p>

          <div className="search-container">
            <div className="search-input">
              <i className="fas fa-search"></i>
              <input
                type="text"
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button className="search-btn">Search</button>
            </div>
          </div>
        </div>
      </section>

      {/* Filters and Controls */}
      <section className="filters-section">
        <div className="filters-container">
          <div className="category-filters">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setFilter(category.id)}
                className={`category-btn ${
                  filter === category.id ? "active" : ""
                }`}
              >
                <i className={category.icon}></i>
                {category.name}
              </button>
            ))}
          </div>

          <div className="sort-container">
            <label>Sort by:</label>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="sort-select"
            >
              <option value="popular">Most Popular</option>
              <option value="downloads">Most Downloads</option>
              <option value="newest">Newest First</option>
              <option value="name">Alphabetical</option>
            </select>
          </div>
        </div>
      </section>

      {/* Templates Grid */}
      <section className="templates-grid">
        {filteredTemplates.length > 0 ? (
          <div className="grid-container">
            {filteredTemplates.map((template) => (
              <div key={template.id} className="template-card">
                <div className="card-header">
                  <div className="category-badge">
                    <i
                      className={
                        categories.find((c) => c.id === template.category).icon
                      }
                    ></i>
                    {template.category.charAt(0).toUpperCase() +
                      template.category.slice(1)}
                  </div>
                  <div className="popularity">
                    <i className="fas fa-star"></i>
                    <span>{template.popularity}</span>
                  </div>
                </div>

                <div className="template-preview">
                  <div className="preview-image"></div>
                </div>

                <div className="card-body">
                  <h3>{template.name}</h3>
                  <p>{template.description}</p>

                  <div className="template-stats">
                    <div className="stat">
                      <i className="fas fa-download"></i>
                      <span>{template.downloads.toLocaleString()}+</span>
                    </div>
                    <div className="stat">
                      <i className="fas fa-history"></i>
                      <span>Updated {template.updated}</span>
                    </div>
                  </div>
                </div>

                <div className="card-footer">
                  <button className="preview-btn">
                    <i className="fas fa-eye"></i> Preview
                  </button>
                  <button className="use-btn">
                    <i className="fas fa-plus"></i> Use Template
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-results">
            <i className="fas fa-file-search"></i>
            <h3>No templates found</h3>
            <p>Try adjusting your search or filter criteria</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default Templates;
