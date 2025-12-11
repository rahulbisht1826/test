import { RecentOrdersList } from "@/components/orders/RecentOrdersList";
import { usePOS } from "@/context/POSContext";
import { useNavigate } from "react-router-dom";
import { Order } from "@/types/pos";

export function RecentOrders() {
  const { orders, updateOrderStatus, deleteOrder, deleteOrders } = usePOS();
  const navigate = useNavigate();

  const handleEditOrder = (order: Order) => {
    navigate("/orders", { state: { editOrder: order } });
  };

  // Show only last 5 orders
  const recentOrders = orders.slice(0, 5);

  return (
    <div className="pt-6">
      {/* Reusing the list component for consistency */}
      <RecentOrdersList
        orders={recentOrders}
        onUpdateStatus={updateOrderStatus}
        onDelete={deleteOrder}
        onDeleteMultiple={deleteOrders}
        onEdit={handleEditOrder}
      />
    </div>
  );
}
