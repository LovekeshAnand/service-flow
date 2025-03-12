import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { motion } from 'framer-motion';

const IssuesLineChart = ({ data }) => {
  // Extract data from props
  const { serviceData, serviceName, metrics = ['upvotes', 'feedbacks', 'issues'] } = data;
  
  // Updated colors for each metric line to match the new card colors
  const colors = {
    upvotes: "#6366F1", // Indigo
    feedbacks: "#2DD4BF", // Teal
    issues: "#8B5CF6" // Purple
  };
  
  // Custom tooltip to show all metrics
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg">
          <p className="font-medium text-gray-800 dark:text-gray-200 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p 
              key={`tooltip-${index}`} 
              className="text-sm" 
              style={{ color: entry.color }}
            >
              {`${entry.name}: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full h-full"
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={serviceData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
          <XAxis 
            dataKey="date" 
            fontSize={12}
            tick={{ fill: '#6B7280' }}
          />
          <YAxis 
            fontSize={12}
            tick={{ fill: '#6B7280' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
          />
          
          {/* Dynamically create lines for each metric */}
          {metrics.map((metric, index) => (
            <Line
              key={metric}
              type="monotone"
              dataKey={metric}
              name={metric.charAt(0).toUpperCase() + metric.slice(1)}
              stroke={colors[metric]}
              activeDot={{ r: 8 }}
              strokeWidth={2}
              dot={{ strokeWidth: 2 }}
              animationDuration={1500}
              animationEasing="ease-out"
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

export default IssuesLineChart;