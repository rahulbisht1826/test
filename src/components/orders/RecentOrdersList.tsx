import { Clock, Edit, Package, Trash2, CheckSquare } from "lucide-react";
import { useState } from "react";
import { Order } from "@/types/pos";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RecentOrdersListProps {
  orders: Order[];
  onUpdateStatus: (orderId: string, status: Order["status"]) => void;
  onDelete?: (orderId: string) => void;
  onDeleteMultiple?: (orderIds: string[]) => void;
  onEdit?: (order: Order) => void;
}

const statusColors: Record<Order["status"], string> = {
  pending: "bg-warning/10 text-warning border-warning/20",
  preparing: "bg-primary/10 text-primary border-primary/20",
  served: "bg-success/10 text-success border-success/20",
  paid: "bg-muted text-muted-foreground border-muted",
};

export function RecentOrdersList({ orders, onUpdateStatus, onDelete, onDeleteMultiple, onEdit }: RecentOrdersListProps) {
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);

  const toggleSelection = (orderId: string) => {
    setSelectedOrders((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedOrders(orders.map((o) => o.id));
    } else {
      setSelectedOrders([]);
    }
  };

  const handleDeleteSelected = () => {
    if (onDeleteMultiple) {
      onDeleteMultiple(selectedOrders);
      setSelectedOrders([]);
    }
  };

  if (orders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Recent Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-32 flex-col items-center justify-center text-muted-foreground">
            <Clock className="mb-2 h-8 w-8 opacity-50" />
            <p>No orders yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5 text-primary" />
          Recent Orders ({orders.length})
        </CardTitle>
        {selectedOrders.length > 0 && (
          <Button variant="destructive" size="sm" onClick={handleDeleteSelected}>
            Delete Selected ({selectedOrders.length})
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-3 max-h-[400px] overflow-auto">
        {orders.length > 0 && (
          <div className="flex items-center gap-2 mb-2 px-2">
            <Checkbox
              checked={selectedOrders.length === orders.length}
              onCheckedChange={(checked) => handleSelectAll(checked as boolean)}
            />
            <span className="text-sm text-muted-foreground">Select All</span>
          </div>
        )}
        {orders.map((order) => (
          <div
            key={order.id}
            className="rounded-lg border bg-card p-3 space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selectedOrders.includes(order.id)}
                  onCheckedChange={() => toggleSelection(order.id)}
                />
                <span className="font-semibold">
                  {order.isTakeaway ? "Takeaway" : `Table ${order.tableId?.replace("t", "")}`}
                  {order.billNumber && <span className="ml-2 text-muted-foreground"># {order.billNumber}</span>}
                </span>
                <Badge variant="outline" className={statusColors[order.status]}>
                  {order.status}
                </Badge>
              </div>
              <span className="text-sm text-muted-foreground">
                {new Date(order.createdAt).toLocaleTimeString()}
              </span>
            </div>

            {order.customerDetails && (
              <div className="text-sm text-muted-foreground">
                {order.customerDetails.name && <span>{order.customerDetails.name} • </span>}
                <span>{order.customerDetails.phone}</span>
              </div>
            )}

            <div className="text-sm space-y-1">
              {order.items.slice(0, 3).map((item) => (
                <div key={item.menuItem.id} className="flex justify-between">
                  <span>
                    {item.menuItem.name} x{item.quantity}
                  </span>
                  <span>₹{(item.menuItem.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              {order.items.length > 3 && (
                <p className="text-muted-foreground">
                  +{order.items.length - 3} more items
                </p>
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t">
              <span className="font-bold text-primary">
                ₹{order.total.toFixed(2)}
              </span>
              <div className="flex items-center gap-2">
                {onEdit && (
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(order)}>
                    <Edit className="h-4 w-4 text-muted-foreground" />
                  </Button>
                )}
                {onDelete && (
                  <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-destructive" onClick={() => onDelete(order.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
                <Select
                  value={order.status}
                  onValueChange={(value) => onUpdateStatus(order.id, value as Order["status"])}
                >
                  <SelectTrigger className="w-[120px] h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="preparing">Preparing</SelectItem>
                    <SelectItem value="served">Served</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
