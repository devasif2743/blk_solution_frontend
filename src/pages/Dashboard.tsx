import React from 'react';
import { MetricCard } from '@/components/MetricCard';
import { WeeklyChart } from '@/components/WeeklyChart';
import { YearlyChart } from '@/components/YearlyChart';
import { Eye, IndianRupee, ShoppingCart, Users } from 'lucide-react';

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Welcome! (In Progress)</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Daily Visits"
          value="8,652"
          change="2.97%"
          changeType="positive"
          period="Since last month"
          icon={<Eye className="h-8 w-8" />}
          variant="visits"
        />
        <MetricCard
          title="Revenue"
          value="9,254.62"
          change="18.25%"
          changeType="positive"
          period="Since last month"
          icon={<IndianRupee className="h-8 w-8" />}
          variant="revenue"
        />
        <MetricCard
          title="Orders"
          value="753"
          change="-5.75%"
          changeType="negative"
          period="Since last month"
          icon={<ShoppingCart className="h-8 w-8" />}
          variant="orders"
        />
        <MetricCard
          title="Users"
          value="63,154"
          change="8.21%"
          changeType="positive"
          period="Since last month"
          icon={<Users className="h-8 w-8" />}
          variant="users"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <WeeklyChart />
        <YearlyChart />
      </div>
    </div>
  );
};

export default Dashboard;