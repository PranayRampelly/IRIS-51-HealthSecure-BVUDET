import React, { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AutoRefreshProps {
    onRefresh: () => void | Promise<void>;
    interval?: number; // in milliseconds
}

const AutoRefresh: React.FC<AutoRefreshProps> = ({ onRefresh, interval = 60000 }) => {
    const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        const timer = setInterval(async () => {
            setIsRefreshing(true);
            await onRefresh();
            setLastRefresh(new Date());
            setIsRefreshing(false);
        }, interval);

        return () => clearInterval(timer);
    }, [onRefresh, interval]);

    const handleManualRefresh = async () => {
        setIsRefreshing(true);
        await onRefresh();
        setLastRefresh(new Date());
        setIsRefreshing(false);
    };

    return (
        <div className="flex items-center gap-2 text-xs text-gray-500">
            <Button
                variant="ghost"
                size="sm"
                onClick={handleManualRefresh}
                disabled={isRefreshing}
                className="h-7 px-2"
            >
                <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
            <span className="text-[10px]">
                Last updated: {lastRefresh.toLocaleTimeString()}
            </span>
        </div>
    );
};

export default AutoRefresh;
