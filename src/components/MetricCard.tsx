import React from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative';
  period: string;
  icon: React.ReactNode;
  variant: 'visits' | 'revenue' | 'orders' | 'users';
}

const cardVariants = {
  visits: 'bg-metric-visits text-white',
  revenue: 'bg-metric-revenue text-white',
  orders: 'bg-metric-orders text-white',
  users: 'bg-metric-users text-white',
};

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  changeType,
  period,
  icon,
  variant,
}) => {
  return (
    <Card className={cn(
      "p-6 border-0 transition-all duration-200 hover:scale-105 hover:shadow-lg",
      cardVariants[variant]
    )}>
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <p className="text-sm font-medium opacity-90 uppercase tracking-wide">
            {title}
          </p>
          <div className="space-y-1">
            <h3 className="text-3xl font-bold">
              {value}
            </h3>
            <div className="flex items-center gap-2 text-sm">
              <span className={cn(
                "font-medium",
                changeType === 'positive' ? "text-green-100" : "text-red-100"
              )}>
                {changeType === 'positive' ? '+' : ''}{change}
              </span>
              <span className="opacity-80">
                {period}
              </span>
            </div>
          </div>
        </div>
        <div className="opacity-80">
          {icon}
        </div>
      </div>
    </Card>
  );
};