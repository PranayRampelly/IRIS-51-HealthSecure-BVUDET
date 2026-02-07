import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface TrendIndicatorProps {
    current: number;
    previous: number;
    label?: string;
}

export const TrendIndicator: React.FC<TrendIndicatorProps> = ({ current, previous, label }) => {
    const change = current - previous;
    const percentChange = previous !== 0 ? ((change / previous) * 100) : 0;

    const getTrendIcon = () => {
        if (Math.abs(percentChange) < 2) return <Minus className="h-4 w-4" />;
        return percentChange > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />;
    };

    const getTrendColor = () => {
        if (Math.abs(percentChange) < 2) return 'text-gray-500';
        return percentChange > 0 ? 'text-red-500' : 'text-green-500';
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex items-center gap-1 ${getTrendColor()}`}
        >
            {getTrendIcon()}
            <span className="text-sm font-medium">
                {Math.abs(percentChange).toFixed(1)}%
            </span>
            {label && <span className="text-xs text-gray-500">{label}</span>}
        </motion.div>
    );
};

export default TrendIndicator;
