import { useState } from "react";
import { TrendingUp, DollarSign, ShoppingCart, Calendar } from "lucide-react";
import { SalesChart } from "@/components/reports/SalesChart";
import { OrdersChart } from "@/components/reports/OrdersChart";
import { StatCard } from "@/components/dashboard/StatCard";
import { mockSalesData, mockMonthlyData } from "@/data/mockData";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Reports = () => {
  const [period, setPeriod] = useState("weekly");

  const weeklyRevenue = mockSalesData.reduce((sum, d) => sum + d.revenue, 0);
  const weeklyOrders = mockSalesData.reduce((sum, d) => sum + d.orders, 0);
  const avgOrderValue = weeklyRevenue / weeklyOrders;

  const monthlyRevenue = mockMonthlyData.reduce((sum, d) => sum + d.revenue, 0);
  const monthlyOrders = mockMonthlyData.reduce((sum, d) => sum + d.orders, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground">
          Track your business performance and growth
        </p>
      </div>

      <Tabs value={period} onValueChange={setPeriod}>
        <TabsList>
          <TabsTrigger value="weekly">This Week</TabsTrigger>
          <TabsTrigger value="monthly">This Month</TabsTrigger>
        </TabsList>

        <TabsContent value="weekly" className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Weekly Revenue"
              value={`₹₹{weeklyRevenue.toLocaleString()}`}
              icon={DollarSign}
              variant="primary"
              trend={{ value: 15, isPositive: true }}
            />
            <StatCard
              title="Total Orders"
              value={weeklyOrders}
              icon={ShoppingCart}
              variant="success"
              trend={{ value: 8, isPositive: true }}
            />
            <StatCard
              title="Avg. Order Value"
              value={`₹₹{avgOrderValue.toFixed(2)}`}
              icon={TrendingUp}
              trend={{ value: 5, isPositive: true }}
            />
            <StatCard
              title="Best Day"
              value="Saturday"
              subtitle="₹5,100 in sales"
              icon={Calendar}
              variant="warning"
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <SalesChart data={mockSalesData} title="Weekly Revenue" />
            <OrdersChart data={mockSalesData} title="Weekly Orders" />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Top Selling Items This Week</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: "Ribeye Steak", orders: 45, revenue: 1484.55 },
                  { name: "Grilled Salmon", orders: 38, revenue: 949.62 },
                  { name: "Chicken Alfredo", orders: 32, revenue: 607.68 },
                  { name: "House Wine (Glass)", orders: 85, revenue: 764.15 },
                  { name: "Chocolate Cake", orders: 28, revenue: 223.72 },
                ].map((item, index) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.orders} orders
                        </p>
                      </div>
                    </div>
                    <p className="font-semibold text-primary">
                      ₹{item.revenue.toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monthly" className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Monthly Revenue"
              value={`₹₹{monthlyRevenue.toLocaleString()}`}
              icon={DollarSign}
              variant="primary"
              trend={{ value: 22, isPositive: true }}
            />
            <StatCard
              title="Total Orders"
              value={monthlyOrders}
              icon={ShoppingCart}
              variant="success"
              trend={{ value: 18, isPositive: true }}
            />
            <StatCard
              title="Avg. Order Value"
              value={`₹₹{(monthlyRevenue / monthlyOrders).toFixed(2)}`}
              icon={TrendingUp}
              trend={{ value: 3, isPositive: true }}
            />
            <StatCard
              title="Best Week"
              value="Week 4"
              subtitle="₹21,200 in sales"
              icon={Calendar}
              variant="warning"
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <SalesChart data={mockMonthlyData} title="Monthly Revenue" />
            <OrdersChart data={mockMonthlyData} title="Monthly Orders" />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;
