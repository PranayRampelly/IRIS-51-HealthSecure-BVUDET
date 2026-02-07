import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedGaugeProps {
    value: number; // 0-100
    max?: number;
    size?: number;
    thickness?: number;
    label?: string;
    showValue?: boolean;
    color?: string;
}

export const AnimatedGauge: React.FC<AnimatedGaugeProps> = ({
    value,
    max = 100,
    size = 120,
    thickness = 12,
    label,
    showValue = true,
    color
}) => {
    const radius = (size - thickness) / 2;
    const circumference = 2 * Math.PI * radius;
    const percentage = Math.min(Math.max(value, 0), max) / max;
    const offset = circumference - (percentage * circumference);

    // Determine color based on value if not provided
    const getColor = () => {
        if (color) return color;
        if (value > 70) return '#EF4444'; // red
        if (value > 40) return '#F59E0B'; // amber
        return '#10B981'; // green
    };

    const gaugeColor = getColor();

    return (
        <div className="relative inline-flex flex-col items-center">
            <svg width={size} height={size} className="transform -rotate-90">
                {/* Background circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="#E5E7EB"
                    strokeWidth={thickness}
                />

                {/* Animated progress circle */}
                <motion.circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={gaugeColor}
                    strokeWidth={thickness}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1, ease: "easeOut" }}
                />
            </svg>

            {/* Center content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                {showValue && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5, type: "spring" }}
                        className="text-center"
                    >
                        <div className="text-2xl font-bold" style={{ color: gaugeColor }}>
                            {Math.round(value)}%
                        </div>
                        {label && (
                            <div className="text-xs text-gray-500 mt-1">
                                {label}
                            </div>
                        )}
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default AnimatedGauge;
