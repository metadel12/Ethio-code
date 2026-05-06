import React from "react";

export const CreatorStats = ({ stats }) => {
  const statItems = [
    { label: "Total Templates", value: stats?.total_templates || 0, icon: "📁", color: "text-blue-500" },
    { label: "Total Sales", value: stats?.total_purchases || 0, icon: "🛍️", color: "text-green-500" },
    { label: "Total Earnings", value: `$${stats?.total_earnings?.toFixed(2) || "0.00"}`, icon: "💰", color: "text-eth-gold" },
    { label: "Pending", value: `$${stats?.pending_earnings?.toFixed(2) || "0.00"}`, icon: "⏳", color: "text-orange-500" },
    { label: "Avg Rating", value: stats?.rating_average?.toFixed(1) || "0.0", icon: "⭐", color: "text-yellow-500" },
    { label: "Reviews", value: stats?.rating_count || 0, icon: "💬", color: "text-purple-500" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {statItems.map((item, i) => (
        <div key={i} className="bg-white dark:bg-dark-surface rounded-lg p-5 border border-gray-200 dark:border-dark-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">{item.label}</p>
              <p className={`text-2xl font-bold mt-1 ${item.color}`}>{item.value}</p>
            </div>
            <span className="text-3xl">{item.icon}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CreatorStats;