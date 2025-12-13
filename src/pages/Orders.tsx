import { useState, useMemo, useEffect } from "react";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Search, ShoppingBag, Minus, Plus, Trash2, Receipt, Send, Eye } from "lucide-react";
import { MenuItemCard } from "@/components/orders/MenuItemCard";
import { CustomerDetailsDialog } from "@/components/orders/CustomerDetailsDialog";
import { RecentOrdersList } from "@/components/orders/RecentOrdersList";
import { BillPreviewDialog } from "@/components/orders/BillPreviewDialog";
import { usePOS } from "@/context/POSContext";
import { Order, MenuItem, OrderItem, CustomerDetails } from "@/types/pos";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { format, subDays, isSameDay } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const Orders = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const tableId = searchParams.get("table");
  const isTakeaway = searchParams.get("takeaway") === "true";

  const { menuItems, categories, tables, orders, addOrder, updateOrderStatus, updateOrderDetails, deleteOrder, deleteOrders, settings } = usePOS();

  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);

  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showBillDialog, setShowBillDialog] = useState(false);
  const [showCustomerDialog, setShowCustomerDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [customerDetails, setCustomerDetails] = useState<CustomerDetails | null>(null);

  // Filters
  const [dateFilter, setDateFilter] = useState("lifetime");
  const [customDate, setCustomDate] = useState<Date | undefined>(new Date());
  const [orderSearchQuery, setOrderSearchQuery] = useState("");

  const filteredOrders = useMemo(() => {
    let filtered = orders;

    // Date Filtering
    if (dateFilter !== "lifetime") {
      if (dateFilter === "custom" && customDate) {
        filtered = filtered.filter(order => isSameDay(new Date(order.createdAt), customDate));
      } else if (dateFilter === "today") {
        filtered = filtered.filter(order => isSameDay(new Date(order.createdAt), new Date()));
      } else {
        const days = parseInt(dateFilter);
        if (!isNaN(days)) {
          const startDate = subDays(new Date(), days);
          filtered = filtered.filter(order => new Date(order.createdAt) >= startDate);
        }
      }
    }

    // Search Filtering
    if (orderSearchQuery) {
      const query = orderSearchQuery.toLowerCase();
      filtered = filtered.filter(order => {
        const billMatch = order.billNumber?.toString().includes(query);
        const tableMatch = order.tableId?.toLowerCase().includes(query);
        const customerMatch = order.customerDetails?.name?.toLowerCase().includes(query);
        const phoneMatch = order.customerDetails?.phone?.toLowerCase().includes(query);
        return billMatch || tableMatch || customerMatch || phoneMatch;
      });
    }

    return filtered;
  }, [orders, dateFilter, customDate, orderSearchQuery]);

  const table = tables.find((t) => t.id === tableId);

  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesSearch = item.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === "All" || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [menuItems, searchQuery, selectedCategory]);

  useEffect(() => {
    if (location.state && location.state.editOrder) {
      const orderToEdit = location.state.editOrder as Order;
      setOrderItems(orderToEdit.items);
      if (orderToEdit.customerDetails) {
        setCustomerDetails(orderToEdit.customerDetails);
      }
      setEditingOrderId(orderToEdit.id);

      // Clear state
      window.history.replaceState({}, document.title);

      toast({
        title: "Order Loaded",
        description: "Order loaded for editing.",
      });
    }
  }, [location.state]);

  const handleEditOrder = (order: Order) => {
    setOrderItems(order.items);
    if (order.customerDetails) {
      setCustomerDetails(order.customerDetails);
    }
    setEditingOrderId(order.id);
    toast({
      title: "Editing Order",
      description: "Order loaded for editing.",
    });
    // Ensure we are in a view where we can see the cart
    if (!tableId && !isTakeaway) {
      if (order.tableId) {
        navigate(`/orders?table=${order.tableId}`);
      } else {
        navigate(`/orders?takeaway=true`);
      }
    }
  };

  const handleAddItem = (item: MenuItem) => {
    setOrderItems((prev) => {
      const existingItem = prev.find((i) => i.menuItem.id === item.id);
      if (existingItem) {
        return prev.map((i) =>
          i.menuItem.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { menuItem: item, quantity: 1 }];
    });
    toast({
      title: "Item added",
      description: `${item.name} added to order`,
    });
  };

  const handleUpdateQuantity = (itemId: string, delta: number) => {
    setOrderItems((prev) =>
      prev
        .map((item) =>
          item.menuItem.id === itemId
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const handleRemoveItem = (itemId: string) => {
    setOrderItems((prev) => prev.filter((item) => item.menuItem.id !== itemId));
  };

  const handleGenerateBill = () => {
    setShowBillDialog(true);
  };

  const handleSendToOrderList = () => {
    setShowCustomerDialog(true);
  };

  const handleCustomerDetailsSubmit = (details: CustomerDetails, status: Order["status"]) => {
    setCustomerDetails(details);
    setShowCustomerDialog(false);

    if (editingOrderId) {
      const orderToUpdate = orders.find(o => o.id === editingOrderId);
      if (orderToUpdate) {
        updateOrderDetails({
          ...orderToUpdate,
          items: orderItems,
          total: total,
          status: status,
          customerDetails: details,
          // Preserve other fields
        });
        toast({
          title: "Order Updated",
          description: "Order details have been updated successfully.",
        });
      }
      setEditingOrderId(null);
    } else {
      // Create the order
      addOrder({
        tableId: isTakeaway ? null : tableId,
        items: orderItems,
        status: status,
        total: total,
        customerDetails: details,
        isTakeaway: isTakeaway,
      });
      toast({
        title: "Order sent!",
        description: `Order has been added to the list`,
      });
    }

    setOrderItems([]);
    setCustomerDetails(null);
    if (!isTakeaway && tableId) {
      navigate("/tables");
    } else if (isTakeaway) {
      // stay or clear? stay is fine.
    }
  };

  const handleConfirmBill = () => {
    if (editingOrderId) {
      const orderToUpdate = orders.find(o => o.id === editingOrderId);
      if (orderToUpdate) {
        updateOrderDetails({
          ...orderToUpdate,
          items: orderItems,
          status: "paid",
          total: total,
          customerDetails: customerDetails || undefined,
        });
      }
      setEditingOrderId(null);
    } else {
      addOrder({
        tableId: isTakeaway ? null : tableId,
        items: orderItems,
        status: "paid",
        total: total,
        customerDetails: customerDetails || undefined,
        isTakeaway: isTakeaway,
      });
    }

    toast({
      title: "Bill Generated!",
      description: isTakeaway
        ? "Takeaway bill has been generated successfully."
        : `Bill for Table ${table?.number} has been generated successfully.`,
    });
    setShowBillDialog(false);
    setOrderItems([]);
    setCustomerDetails(null);
    if (!isTakeaway) {
      navigate("/tables");
    }
  };

  const subtotal = orderItems.reduce(
    (sum, item) => sum + item.menuItem.price * item.quantity,
    0
  );
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  const displayBillNumber = editingOrderId
    ? orders.find(o => o.id === editingOrderId)?.billNumber
    : (settings.lastBillNumber || 0) + 1;

  const pageTitle = isTakeaway ? "Takeaway Order" : table ? `Table ${table.number} Order` : "Orders";
  const showOrderForm = isTakeaway || table;

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(isTakeaway ? "/menu" : "/tables")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{pageTitle}</h1>
          <p className="text-muted-foreground">
            {showOrderForm ? "Add items from the menu to create an order" : "View and manage orders"}
          </p>
        </div>
      </div>

      {!showOrderForm ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Select a table or start takeaway order</h2>
            <div className="flex gap-2">
              <Button onClick={() => navigate("/tables")}>Go to Tables</Button>
              <Button variant="outline" onClick={() => navigate("/orders?takeaway=true")}>
                <ShoppingBag className="mr-2 h-4 w-4" />
                Takeaway Order
              </Button>
            </div>

            <div className="flex flex-col gap-4 p-4 border rounded-lg bg-card">
              <h3 className="font-semibold">Filter Orders</h3>
              <div className="flex flex-col gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search by Bill #, Table, Name..."
                    value={orderSearchQuery}
                    onChange={(e) => setOrderSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <div className="flex gap-2">
                  <Select value={dateFilter} onValueChange={setDateFilter}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="7">Last 7 Days</SelectItem>
                      <SelectItem value="30">Last 30 Days</SelectItem>
                      <SelectItem value="lifetime">Lifetime</SelectItem>
                      <SelectItem value="custom">Custom Date</SelectItem>
                    </SelectContent>
                  </Select>

                  {dateFilter === 'custom' && (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "flex-1 justify-start text-left font-normal",
                            !customDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {customDate ? format(customDate, "MMM dd") : <span>Date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="end">
                        <Calendar
                          mode="single"
                          selected={customDate}
                          onSelect={setCustomDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                </div>
              </div>
            </div>
          </div>
          <RecentOrdersList
            orders={filteredOrders}
            onUpdateStatus={updateOrderStatus}
            onDelete={deleteOrder}
            onDeleteMultiple={deleteOrders}
            onEdit={handleEditOrder}
          />
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search menu items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
              <TabsList className="flex-wrap h-auto gap-1">
                {categories.map((category) => (
                  <TabsTrigger key={category} value={category} className="text-sm">
                    {category}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            <div className="grid gap-3 sm:grid-cols-2">
              {filteredItems.map((item) => (
                <MenuItemCard key={item.id} item={item} onAdd={handleAddItem} />
              ))}
            </div>

            {/* Recent Orders Section */}
            <div className="mt-8">
              <RecentOrdersList
                orders={orders}
                onUpdateStatus={updateOrderStatus}
                onDelete={deleteOrder}
                onDeleteMultiple={deleteOrders}
                onEdit={handleEditOrder}
              />
            </div>
          </div>

          <div className="lg:sticky lg:top-24 lg:h-fit space-y-4">
            {/* Order Summary Card */}
            <Card className="flex h-full flex-col">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5 text-primary" />
                  {isTakeaway ? "Takeaway" : `Table ${table?.number}`} Order
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-auto">
                {orderItems.length === 0 ? (
                  <div className="flex h-40 flex-col items-center justify-center text-muted-foreground">
                    <Receipt className="mb-2 h-10 w-10 opacity-50" />
                    <p>No items added yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orderItems.map((item) => (
                      <div
                        key={item.menuItem.id}
                        className="flex items-center justify-between gap-2 rounded-lg bg-muted/50 p-3"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{item.menuItem.name}</p>
                          <p className="text-sm text-muted-foreground">
                            ₹{item.menuItem.price.toFixed(2)} each
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-7 w-7"
                              onClick={() => handleUpdateQuantity(item.menuItem.id, -1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center font-medium">
                              {item.quantity}
                            </span>
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-7 w-7"
                              onClick={() => handleUpdateQuantity(item.menuItem.id, 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-destructive hover:bg-destructive/10"
                            onClick={() => handleRemoveItem(item.menuItem.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
              {orderItems.length > 0 && (
                <CardFooter className="flex-col gap-4 border-t pt-4">
                  <div className="w-full space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>₹{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tax (10%)</span>
                      <span>₹{tax.toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-primary">₹{total.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="w-full flex gap-2">
                    <Button className="flex-1" variant={editingOrderId ? "secondary" : "outline"} onClick={handleSendToOrderList}>
                      <Send className="mr-2 h-4 w-4" />
                      {editingOrderId ? "Update Order" : "Send to Order List"}
                    </Button>
                    <Button className="flex-1" onClick={handleGenerateBill}>
                      Generate Bill
                    </Button>
                  </div>
                </CardFooter>
              )}
            </Card>
          </div>
        </div>
      )}

      {/* Customer Details Dialog */}
      <CustomerDetailsDialog
        open={showCustomerDialog}
        onOpenChange={setShowCustomerDialog}
        onSubmit={handleCustomerDetailsSubmit}
      />

      {/* Bill Dialog */}
      <Dialog open={showBillDialog} onOpenChange={setShowBillDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              Bill Summary - {isTakeaway ? "Takeaway" : `Table ${table?.number}`}
              {displayBillNumber && <span className="ml-2 text-muted-foreground">#{displayBillNumber}</span>}
            </DialogTitle>
            <DialogDescription>
              Review the bill before confirming
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {customerDetails && (
              <div className="rounded-lg border bg-muted/30 p-3 text-sm">
                <p className="font-medium">Customer Details</p>
                {customerDetails.name && <p>Name: {customerDetails.name}</p>}
                <p>Phone: {customerDetails.phone}</p>
              </div>
            )}
            <div className="rounded-lg border bg-muted/30 p-4">
              <div className="space-y-2 text-sm">
                {orderItems.map((item) => (
                  <div
                    key={item.menuItem.id}
                    className="flex justify-between"
                  >
                    <span>
                      {item.menuItem.name} x{item.quantity}
                    </span>
                    <span>
                      ₹{(item.menuItem.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4 border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax (10%)</span>
                  <span>₹{tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">₹{total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <div className="flex gap-2 w-full">
              <Button variant="outline" className="flex-1" onClick={() => setShowPreviewDialog(true)}>
                <Eye className="mr-2 h-4 w-4" /> Preview
              </Button>
              <div className="flex-1 flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowBillDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleConfirmBill}>Confirm & Print</Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bill Preview Dialog */}
      <BillPreviewDialog
        open={showPreviewDialog}
        onOpenChange={setShowPreviewDialog}
        orderItems={orderItems}
        subtotal={subtotal}
        tax={tax}
        total={total}
        customerDetails={customerDetails}
        tableNumber={table?.number}
        isTakeaway={isTakeaway}
        billNumber={displayBillNumber}
      />
    </div>
  );
};

export default Orders;
