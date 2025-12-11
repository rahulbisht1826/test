import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface RecentOrder {
  id: string;
  table: number;
  items: number;
  total: number;
  status: "pending" | "preparing" | "served" | "paid";
  time: string;
}

const statusStyles = {
  pending: "bg-warning/10 text-warning border-warning/20",
  preparing: "bg-primary/10 text-primary border-primary/20",
  served: "bg-success/10 text-success border-success/20",
  paid: "bg-muted text-muted-foreground border-muted",
};

const recentOrders: RecentOrder[] = [
  { id: "ORD-001", table: 5, items: 4, total: 78.50, status: "preparing", time: "2 min ago" },
  { id: "ORD-002", table: 2, items: 2, total: 45.00, status: "served", time: "15 min ago" },
  { id: "ORD-003", table: 8, items: 6, total: 124.99, status: "pending", time: "Just now" },
  { id: "ORD-004", table: 3, items: 3, total: 56.75, status: "paid", time: "30 min ago" },
  { id: "ORD-005", table: 7, items: 5, total: 98.25, status: "preparing", time: "5 min ago" },
];

export function RecentOrders() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Recent Orders</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentOrders.map((order) => (
            <div
              key={order.id}
              className="flex items-center justify-between rounded-lg border bg-card p-4 transition-all hover:bg-muted/50"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 font-semibold text-primary">
                  T{order.table}
                </div>
                <div>
                  <p className="font-medium">{order.id}</p>
                  <p className="text-sm text-muted-foreground">
                    {order.items} items • {order.time}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <p className="font-semibold">${order.total.toFixed(2)}</p>
                <Badge 
                  variant="outline" 
                  className={cn("capitalize", statusStyles[order.status])}
                >
                  {order.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
