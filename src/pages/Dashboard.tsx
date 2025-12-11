import { DollarSign, ShoppingCart, Users, TrendingUp } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { RecentOrders } from "@/components/dashboard/RecentOrders";

const Dashboard = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's what's happening today.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Today's Revenue"
          value="₹4,250"
          icon={DollarSign}
          variant="primary"
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Total Orders"
          value="68"
          icon={ShoppingCart}
          variant="success"
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="Active Tables"
          value="8/12"
          subtitle="5 occupied, 3 reserved"
          icon={Users}
          variant="warning"
        />
        <StatCard
          title="Avg. Order Value"
          value="₹62.50"
          icon={TrendingUp}
          trend={{ value: 5, isPositive: true }}
        />
      </div>

      <RecentOrders />
    </div>
  );
};

export default Dashboard;
