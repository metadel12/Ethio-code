import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

export const EarningsChart = ({ data, type = "bar" }) => {
  const defaultData = [
    { name: "Jan", earnings: 1200, sales: 45 },
    { name: "Feb", earnings: 1900, sales: 62 },
    { name: "Mar", earnings: 1500, sales: 51 },
    { name: "Apr", earnings: 2200, sales: 78 },
    { name: "May", earnings: 2800, sales: 92 },
    { name: "Jun", earnings: 3100, sales: 108 },
  ];

  const chartData = data || defaultData;

  return (
    <div className="bg-white dark:bg-dark-surface rounded-lg p-5 border border-gray-200 dark:border-dark-border">
      <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Earnings Overview</h3>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          {type === "bar" ? (
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--tw-color-gray-200)" />
              <XAxis dataKey="name" stroke="var(--tw-color-gray-500)" />
              <YAxis stroke="var(--tw-color-gray-500)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--tw-color-dark-surface)",
                  border: "1px solid var(--tw-color-dark-border)",
                }}
              />
              <Bar dataKey="earnings" fill="#2E8B57" radius={[4, 4, 0, 0]} />
            </BarChart>
          ) : (
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--tw-color-gray-200)" />
              <XAxis dataKey="name" stroke="var(--tw-color-gray-500)" />
              <YAxis stroke="var(--tw-color-gray-500)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--tw-color-dark-surface)",
                  border: "1px solid var(--tw-color-dark-border)",
                }}
              />
              <Line type="monotone" dataKey="earnings" stroke="#2E8B57" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default EarningsChart;