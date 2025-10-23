import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const data = [
  { year: '2017', sales: 15, revenue: 10 },
  { year: '2018', sales: 12, revenue: 8 },
  { year: '2019', sales: 25, revenue: 20 },
  { year: '2020', sales: 18, revenue: 15 },
  { year: '2021', sales: 32, revenue: 28 },
  { year: '2022', sales: 28, revenue: 30 },
  { year: '2023', sales: 45, revenue: 42 },
];

export const YearlyChart: React.FC = () => {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold text-card-foreground">
          Yearly Sales Report
        </CardTitle>
        <div className="flex items-center gap-2">
          <button className="p-1 hover:bg-muted rounded">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <button className="p-1 hover:bg-muted rounded">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
          <button className="p-1 hover:bg-muted rounded">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="year" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6b7280' }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6b7280' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
              />
              <Line 
                type="monotone" 
                dataKey="sales" 
                stroke="hsl(var(--chart-primary))" 
                strokeWidth={3}
                dot={{ fill: 'hsl(var(--chart-primary))', strokeWidth: 2, r: 4 }}
                name="Sales"
              />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="hsl(var(--chart-secondary))" 
                strokeWidth={3}
                dot={{ fill: 'hsl(var(--chart-secondary))', strokeWidth: 2, r: 4 }}
                name="Revenue"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* Bottom Stats */}
        <div className="flex justify-center gap-8 mt-6 pt-4 border-t border-border">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1">Quarter 1</p>
            <p className="text-lg font-semibold">$56.2k</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1">Quarter 2</p>
            <p className="text-lg font-semibold">$42.5k</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1">All Time</p>
            <p className="text-lg font-semibold">$102.03k</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};