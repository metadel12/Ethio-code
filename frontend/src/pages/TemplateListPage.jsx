import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { TemplateCard } from "../components/marketplace/TemplateCard";
import { SearchBar, Breadcrumbs, FilterSidebar } from "../components/marketplace/MarketplaceFilters";
import { templateService } from "../services/templateService";
import { useAuth } from "../hooks/useAuth";
import { LoadingSpinner } from "../components/common/LoadingSpinner";

export const TemplateListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [templates, setTemplates] = useState([]);
  const [categories, setCategories] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [savedTemplateIds, setSavedTemplateIds] = useState(new Set());
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Parse URL params
  const page = parseInt(searchParams.get("page") || "1", 10);
  const search = searchParams.get("q") || "";
  const category = searchParams.get("category") || "all";
  const sort = searchParams.get("sort") || "created_at";
  const order = searchParams.get("order") || "desc";
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const minRating = searchParams.get("minRating");

  // Build sort value for FilterSidebar
  const sortValue = useMemo(() => {
    if (sort === "created_at" && order === "desc") return "newest";
    if (sort === "created_at" && order === "asc") return "oldest";
    if (sort === "price" && order === "asc") return "price-low";
    if (sort === "price" && order === "desc") return "price-high";
    if (sort === "rating") return "rating";
    if (sort === "download_count") return "popular";
    return "newest";
  }, [sort, order]);

  // Build price filter value for FilterSidebar
  const priceFilterValue = useMemo(() => {
    if (minPrice === "0" && maxPrice === "500") return "0-500";
    if (minPrice === "500" && maxPrice === "2000") return "500-2000";
    if (minPrice === "2000" && !maxPrice) return "2000+";
    if (minPrice === "0" && !maxPrice) return "free";
    return "all";
  }, [minPrice, maxPrice]);

  // Rating filter
  const ratingFilterValue = useMemo(() => {
    return minRating ? parseInt(minRating) : null;
  }, [minRating]);

  useEffect(() => {
    loadCategories();
    loadSavedTemplates();
  }, []);

  useEffect(() => {
    loadTemplates(true);
  }, [page, search, category, sort, order, minPrice, maxPrice, minRating]);

  const loadCategories = async () => {
    try {
      const data = await templateService.getCategories();
      setCategories([{ id: "all", name: "All Categories" }, ...data.map((c) => ({ id: c, name: c }))]);
    } catch (e) {
      console.error("Failed to load categories:", e);
    }
  };

  const loadSavedTemplates = async () => {
    if (!user) return;
    try {
      const saved = await templateService.getSavedTemplates();
      setSavedTemplateIds(new Set(saved.map((t) => t.template_id)));
    } catch (e) {
      console.error("Failed to load saved templates:", e);
    }
  };

  const loadTemplates = useCallback(async (reset = false) => {
    const currentPage = reset ? 1 : page;

    try {
      if (reset) setLoading(true);
      else setLoadingMore(true);

      // Build params for /api/payment/templates/search endpoint
      const params = {
        page: currentPage,
        per_page: 12,
        sort_by: sort,
        sort_order: order,
      };

      if (search) params.q = search;
      if (category !== "all") params.category = category;
      if (minPrice) params.min_price = minPrice;
      if (maxPrice) params.max_price = maxPrice;
      if (minRating) params.min_rating = minRating;

      // Use searchTemplates which calls /templates/search
      // This integrates with the backend /api/payment/templates/search endpoint
      const data = await templateService.searchTemplates(params);

      // Handle both array and paginated response formats
      const items = Array.isArray(data) ? data : (data.items || []);
      const total = Array.isArray(data) ? items.length : (data.total || items.length);
      const totalPages = Array.isArray(data) ? 1 : (data.total_pages || 1);
      const current = Array.isArray(data) ? 1 : (data.page || 1);

      if (reset) {
        setTemplates(items);
      } else {
        setTemplates((prev) => [...prev, ...items]);
      }
      setTotalCount(total);
      setHasMore(current < totalPages);
    } catch (e) {
      console.error("Failed to load templates:", e);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [page, search, category, sort, order, minPrice, maxPrice, minRating]);

  const extractAllTags = useCallback((templates) => {
    const tags = new Set();
    templates.forEach((t) => {
      if (t.tags && Array.isArray(t.tags)) {
        t.tags.forEach((tag) => tags.add(tag));
      }
    });
    return Array.from(tags);
  }, []);

  const handleSave = async (templateId) => {
    if (!user) {
      navigate("/login");
      return;
    }
    try {
      if (savedTemplateIds.has(templateId)) {
        await templateService.unsaveTemplate(templateId);
        setSavedTemplateIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(templateId);
          return newSet;
        });
      } else {
        await templateService.saveTemplate(templateId);
        setSavedTemplateIds((prev) => new Set(prev).add(templateId));
      }
    } catch (e) {
      console.error("Failed to save/unsave template:", e);
    }
  };

  const updateFilters = (updates) => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      Object.entries(updates).forEach(([key, value]) => {
        if (value === undefined || value === null || value === "") {
          newParams.delete(key);
        } else {
          newParams.set(key, value);
        }
      });
      newParams.set("page", "1");
      return newParams;
    });
  };

  const handleSortChange = (sortValue) => {
    const mappings = {
      newest: { sort: "created_at", order: "desc" },
      oldest: { sort: "created_at", order: "asc" },
      "price-low": { sort: "price", order: "asc" },
      "price-high": { sort: "price", order: "desc" },
      rating: { sort: "rating", order: "desc" },
      popular: { sort: "download_count", order: "desc" },
    };
    const mapping = mappings[sortValue] || mappings.newest;
    updateFilters(mapping);
  };

  const handlePriceChange = (priceValue) => {
    switch (priceValue) {
      case "free":
        updateFilters({ minPrice: "0", maxPrice: undefined });
        break;
      case "0-500":
        updateFilters({ minPrice: "0", maxPrice: "500" });
        break;
      case "500-2000":
        updateFilters({ minPrice: "500", maxPrice: "2000" });
        break;
      case "2000+":
        updateFilters({ minPrice: "2000", maxPrice: undefined });
        break;
      default:
        updateFilters({ minPrice: undefined, maxPrice: undefined });
    }
  };

  const handleRatingChange = (ratingValue) => {
    if (ratingValue === null) {
      updateFilters({ minRating: undefined });
    } else {
      updateFilters({ minRating: ratingValue.toString() });
    }
  };

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Marketplace" },
    { label: category === "all" ? "All Templates" : category },
  ];

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
      <div className="container mx-auto px-4 py-6 lg:py-8">
        <Breadcrumbs items={breadcrumbItems} />

        {/* Hero Section */}
        <div className="text-center mb-8 lg:mb-10">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-3">
            {category === "all" ? "Explore All Templates" : category}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-base lg:text-lg max-w-2xl mx-auto">
            {templates.length} {templates.length === 1 ? 'template' : 'templates'} available. Find the perfect template for your next project.
          </p>
        </div>

        {/* Search Bar */}
        <div className="flex justify-center mb-6 lg:mb-8">
          <SearchBar
            value={search}
            onChange={(value) => updateFilters({ q: value })}
            onSearch={(value) => updateFilters({ q: value })}
            placeholder="Search templates..."
          />
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Filter Sidebar */}
          <FilterSidebar
            categories={categories}
            selectedCategory={category}
            onCategoryChange={(v) => updateFilters({ category: v })}
            priceFilter={priceFilterValue}
            onPriceChange={handlePriceChange}
            ratingFilter={ratingFilterValue}
            onRatingChange={handleRatingChange}
            tags={allTags}
            selectedTags={[]}
            onTagChange={() => { }}
            sortBy={sortValue}
            onSortChange={handleSortChange}
            isOpen={mobileFiltersOpen}
            onClose={() => setMobileFiltersOpen(false)}
          />

          {/* Main Content */}
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setMobileFiltersOpen(true)}
                  className="lg:hidden px-4 py-2.5 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-surface text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark3 transition-colors text-sm font-medium"
                >
                  <svg className="w-4 h-4 inline mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  Filters
                  <span className="ml-1.5 px-1.5 py-0.5 bg-eth-green/10 text-eth-green text-xs font-semibold rounded">
                    {(minPrice || maxPrice || minRating || category !== 'all' || search) ? 'Active' : '0'}
                  </span>
                </button>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Showing {templates.length} of {totalCount}
                </span>
              </div>

              <select
                value={sortValue}
                onChange={(e) => handleSortChange(e.target.value)}
                className="px-3.5 py-2 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-surface text-gray-700 dark:text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-eth-green focus:border-transparent"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>

            {templates.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border">
                <svg className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No templates found</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">Try adjusting your search or filters</p>
                {(search || category !== 'all' || minPrice || maxPrice || minRating) && (
                  <button
                    onClick={() => {
                      setSearchParams({ page: '1' });
                    }}
                    className="px-4 py-2 bg-eth-green text-white rounded-lg hover:bg-eth-green/90 transition-colors text-sm font-medium"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {templates.map((template) => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      onSave={handleSave}
                      isSaved={savedTemplateIds.has(template.id)}
                    />
                  ))}
                </div>

                {hasMore && (
                  <div className="mt-8 text-center">
                    <button
                      onClick={() => updateFilters({ page: page + 1 })}
                      disabled={loadingMore}
                      className="px-6 py-2.5 bg-eth-green text-white rounded-lg hover:bg-eth-green/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                    >
                      {loadingMore ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          Loading...
                        </span>
                      ) : (
                        "Load More"
                      )}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateListPage;