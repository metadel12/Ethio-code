import React from "react";

export const SearchBar = ({ value, onChange, onSearch, placeholder = "Search templates..." }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch && onSearch(value);
  };

  return (
    <form onSubmit={handleSubmit} className="relative flex-1 max-w-2xl">
      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-surface text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-eth-green focus:border-transparent"
      />
    </form>
  );
};

export const Breadcrumbs = ({ items }) => {
  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
      {items.map((item, i) => (
        <React.Fragment key={i}>
          {i > 0 && <span>/</span>}
          {item.href ? (
            <a href={item.href} className="hover:text-eth-green transition-colors">{item.label}</a>
          ) : (
            <span className="text-gray-900 dark:text-white">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export const FilterSidebar = ({
  categories,
  selectedCategory,
  onCategoryChange,
  priceFilter,
  onPriceChange,
  ratingFilter,
  onRatingChange,
  tags,
  selectedTags,
  onTagChange,
  sortBy,
  onSortChange,
  isOpen,
  onClose,
}) => {
  const priceRanges = [
    { value: 'all', label: 'All Prices' },
    { value: 'free', label: 'Free', desc: '$0' },
    { value: '0-500', label: 'Under $500', desc: '$0 — $499' },
    { value: '500-2000', label: '$500 — $2,000', desc: '$500 — $2,000' },
    { value: '2000+', label: '$2,000+', desc: 'Over $2,000' },
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'popular', label: 'Most Popular' },
  ];

  const handlePriceChange = (value) => {
    onPriceChange(value);
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />
      )}

      <aside className={`
        fixed lg:sticky top-0 left-0 z-50 w-64 h-full lg:h-auto
        bg-white dark:bg-dark-surface border-r border-gray-200 dark:border-dark-border
        transform transition-transform duration-300 overflow-y-auto
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        <div className="sticky top-0 bg-white dark:bg-dark-surface z-10">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-dark3">
            <h2 className="font-bold text-gray-900 dark:text-white">Filters</h2>
            <button onClick={onClose} className="lg:hidden p-1 rounded hover:bg-gray-100 dark:hover:bg-dark3">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-4 space-y-6">
          {/* Sort By */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm uppercase tracking-wide">Sort By</h3>
            <div className="space-y-2">
              {sortOptions.map((opt) => (
                <label key={opt.value} className="flex items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-dark3 -mx-2 px-2 py-1.5 rounded">
                  <input
                    type="radio"
                    name="sort"
                    value={opt.value}
                    checked={sortBy === opt.value}
                    onChange={() => onSortChange(opt.value)}
                    className="w-4 h-4 text-eth-green border-gray-300 focus:ring-eth-green"
                  />
                  <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Category */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm uppercase tracking-wide">Category</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              <label className="flex items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-dark3 -mx-2 px-2 py-1.5 rounded">
                <input
                  type="radio"
                  name="category"
                  value="all"
                  checked={selectedCategory === "all"}
                  onChange={() => onCategoryChange("all")}
                  className="w-4 h-4 text-eth-green border-gray-300 focus:ring-eth-green"
                />
                <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">All Categories</span>
              </label>
              {categories.map((cat) => (
                <label key={cat.id} className="flex items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-dark3 -mx-2 px-2 py-1.5 rounded">
                  <input
                    type="radio"
                    name="category"
                    value={cat.id}
                    checked={selectedCategory === cat.id}
                    onChange={() => onCategoryChange(cat.id)}
                    className="w-4 h-4 text-eth-green border-gray-300 focus:ring-eth-green"
                  />
                  <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">{cat.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm uppercase tracking-wide">Price Range</h3>
            <div className="space-y-2">
              {priceRanges.map((opt) => (
                <label key={opt.value} className="flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-dark3 -mx-2 px-2 py-1.5 rounded group">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      name="price"
                      value={opt.value}
                      checked={priceFilter === opt.value}
                      onChange={() => handlePriceChange(opt.value)}
                      className="w-4 h-4 text-eth-green border-gray-300 focus:ring-eth-green"
                    />
                    <span className="ml-3 text-sm text-gray-700 dark:text-gray-300 group-hover:text-eth-green transition-colors">
                      {opt.label}
                    </span>
                  </div>
                  {opt.desc && (
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      {opt.desc}
                    </span>
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Rating */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm uppercase tracking-wide">Minimum Rating</h3>
            <div className="space-y-2">
              <label className="flex items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-dark3 -mx-2 px-2 py-1.5 rounded">
                <input
                  type="radio"
                  name="rating"
                  value=""
                  checked={ratingFilter === null}
                  onChange={() => onRatingChange(null)}
                  className="w-4 h-4 text-eth-green border-gray-300 focus:ring-eth-green"
                />
                <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">Any Rating</span>
              </label>
              {[5, 4, 3, 2].map((rating) => (
                <label key={rating} className="flex items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-dark3 -mx-2 px-2 py-1.5 rounded">
                  <input
                    type="radio"
                    name="rating"
                    value={rating}
                    checked={ratingFilter === rating}
                    onChange={() => onRatingChange(rating)}
                    className="w-4 h-4 text-eth-green border-gray-300 focus:ring-eth-green"
                  />
                  <span className="ml-2 flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-4 h-4 ${i < rating ? "text-yellow-400" : "text-gray-300 dark:text-gray-600"}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                    <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">&amp; up</span>
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Tags */}
          {tags && tags.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm uppercase tracking-wide">Tags</h3>
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => onTagChange(tag)}
                    className={`px-2 py-0.5 text-xs rounded-full transition-colors ${
                      selectedTags.includes(tag)
                        ? "bg-eth-green text-white"
                        : "bg-gray-100 dark:bg-dark3 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-dark4"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default FilterSidebar;