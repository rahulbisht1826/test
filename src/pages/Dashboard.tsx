import { DollarSign, ShoppingCart, Users, TrendingUp } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { RecentOrders } from "@/components/dashboard/RecentOrders";
import { usePOS } from "@/context/POSContext";
import { DashboardClock } from "@/components/dashboard/DashboardClock";

const Dashboard = () => {
  const { orders, tables, clockSettings } = usePOS();

  // Calculate stats
  const todaysOrders = orders; // Assuming orders context contains today's orders or recent ones
  const totalOrders = todaysOrders.length;

  const totalRevenue = todaysOrders.reduce((acc, order) => {
    // Only count paid or non-cancelled orders if needed. 
    // For now, let's sum total of all valid orders or just paid ones.
    // Let's assume 'paid' status for revenue, or maybe 'served' + 'paid'.
    // A common simple dashboard shows total value of orders created today.
    return acc + (order.total || 0);
  }, 0);

  const activeTables = tables.filter(t => t.status === "occupied").length;
  const reservedTables = tables.filter(t => t.status === "reserved").length;
  const totalTablesCount = tables.length;

  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's what's happening today.
        </p>
      </div>

      {clockSettings.enabled && (
        <div className="flex justify-start mb-6">
          <DashboardClock type={clockSettings.type} />
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Today's Revenue"
          value={`₹${totalRevenue.toFixed(2)}`}
          icon={DollarSign}
          variant="primary"
        // trend={{ value: 12, isPositive: true }} // Trends would require historical data
        />
        <StatCard
          title="Total Orders"
          value={totalOrders.toString()}
          icon={ShoppingCart}
          variant="success"
        // trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="Active Tables"
          value={`${activeTables}/${totalTablesCount}`}
          subtitle={`${activeTables} occupied, ${reservedTables} reserved`}
          icon={Users}
          variant="warning"
        />
        <StatCard
          title="Avg. Order Value"
          value={`₹${avgOrderValue.toFixed(2)}`}
          icon={TrendingUp}
        // trend={{ value: 5, isPositive: true }}
        />
      </div>

      <RecentOrders />
    </div>
  );
};

export default Dashboard;
