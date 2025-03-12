import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  color,
  delay = 0 
}) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    if (value === 0) {
      setCount(0);
      return;
    }
    
    const duration = 1500; // Animation duration in ms
    const intervalTime = 20; // Update every 20ms
    const steps = duration / intervalTime;
    const increment = value / steps;
    let currentCount = 0;
    
    const timer = setInterval(() => {
      currentCount += increment;
      if (currentCount >= value) {
        clearInterval(timer);
        setCount(value);
      } else {
        setCount(Math.floor(currentCount));
      }
    }, intervalTime);
    
    return () => clearInterval(timer);
  }, [value]);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`rounded-2xl shadow-md overflow-hidden group hover-scale h-full`}
      style={{ background: color }}
    >
      <div className="p-6 flex items-start justify-between">
        <div className="space-y-4">
          <p className="text-sm font-medium text-white/80">{title}</p>
          <p className="text-4xl font-bold text-white">{count}</p>
        </div>
        <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl">
          <Icon className="h-8 w-8 text-white" />
        </div>
      </div>
      <div className="w-full h-1.5 bg-white/10">
        <motion.div 
          className="h-full bg-white/30"
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, (value / 100) * 100)}%` }}
          transition={{ duration: 1, delay: delay + 0.3 }}
        />
      </div>
    </motion.div>
  );
};

export default StatCard;