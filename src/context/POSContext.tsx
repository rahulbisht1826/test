import React, { createContext, useContext, useState, ReactNode } from "react";
import { MenuItem, Order, Staff, Table } from "@/types/pos";
import { menuItems as initialMenuItems, categories as initialCategories } from "@/data/menuItems";
import { initialTables } from "@/data/mockData";

interface POSContextType {
  menuItems: MenuItem[];
  setMenuItems: React.Dispatch<React.SetStateAction<MenuItem[]>>;
  categories: string[];
  setCategories: React.Dispatch<React.SetStateAction<string[]>>;
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  staff: Staff[];
  setStaff: React.Dispatch<React.SetStateAction<Staff[]>>;
  tables: Table[];
  setTables: React.Dispatch<React.SetStateAction<Table[]>>;
  addMenuItem: (item: Omit<MenuItem, "id">) => void;
  updateMenuItem: (id: string, item: Partial<MenuItem>) => void;
  deleteMenuItems: (ids: string[]) => void;
  addOrder: (order: Omit<Order, "id" | "createdAt">) => void;
  updateOrderStatus: (id: string, status: Order["status"]) => void;
  addStaff: (staff: Omit<Staff, "id" | "createdAt" | "assignedTableIds">) => void;
  assignStaffToTable: (staffId: string, tableId: string) => void;
  resetTables: (tableIds: string[]) => void;
}

const POSContext = createContext<POSContextType | undefined>(undefined);

export function POSProvider({ children }: { children: ReactNode }) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(initialMenuItems);
  const [categories, setCategories] = useState<string[]>(initialCategories);
  const [orders, setOrders] = useState<Order[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [tables, setTables] = useState<Table[]>(initialTables);

  const addMenuItem = (item: Omit<MenuItem, "id">) => {
    const newItem: MenuItem = {
      ...item,
      id: `menu-${Date.now()}`,
    };
    setMenuItems((prev) => [...prev, newItem]);
    if (!categories.includes(item.category)) {
      setCategories((prev) => [...prev, item.category]);
    }
  };

  const updateMenuItem = (id: string, item: Partial<MenuItem>) => {
    setMenuItems((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...item } : m))
    );
    if (item.category && !categories.includes(item.category)) {
      setCategories((prev) => [...prev, item.category]);
    }
  };

  const deleteMenuItems = (ids: string[]) => {
    setMenuItems((prev) => prev.filter((m) => !ids.includes(m.id)));
  };

  const addOrder = (order: Omit<Order, "id" | "createdAt">) => {
    const newOrder: Order = {
      ...order,
      id: `order-${Date.now()}`,
      createdAt: new Date(),
    };
    setOrders((prev) => [newOrder, ...prev]);
    
    // Update table status if not takeaway
    if (order.tableId) {
      setTables((prev) =>
        prev.map((t) =>
          t.id === order.tableId ? { ...t, status: "occupied", currentOrder: newOrder } : t
        )
      );
    }
  };

  const updateOrderStatus = (id: string, status: Order["status"]) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status } : o))
    );
    
    // If paid, reset table
    if (status === "paid") {
      const order = orders.find((o) => o.id === id);
      if (order?.tableId) {
        setTables((prev) =>
          prev.map((t) =>
            t.id === order.tableId
              ? { ...t, status: "available", currentOrder: undefined }
              : t
          )
        );
      }
    }
  };

  const addStaff = (staffData: Omit<Staff, "id" | "createdAt" | "assignedTableIds">) => {
    const newStaff: Staff = {
      ...staffData,
      id: `staff-${Date.now()}`,
      assignedTableIds: [],
      createdAt: new Date(),
    };
    setStaff((prev) => [...prev, newStaff]);
  };

  const assignStaffToTable = (staffId: string, tableId: string) => {
    setStaff((prev) =>
      prev.map((s) =>
        s.id === staffId
          ? { ...s, assignedTableIds: [...s.assignedTableIds, tableId] }
          : s
      )
    );
    setTables((prev) =>
      prev.map((t) =>
        t.id === tableId ? { ...t, assignedStaffId: staffId } : t
      )
    );
  };

  const resetTables = (tableIds: string[]) => {
    setTables((prev) =>
      prev.map((t) =>
        tableIds.includes(t.id)
          ? { ...t, status: "available", currentOrder: undefined }
          : t
      )
    );
  };

  return (
    <POSContext.Provider
      value={{
        menuItems,
        setMenuItems,
        categories,
        setCategories,
        orders,
        setOrders,
        staff,
        setStaff,
        tables,
        setTables,
        addMenuItem,
        updateMenuItem,
        deleteMenuItems,
        addOrder,
        updateOrderStatus,
        addStaff,
        assignStaffToTable,
        resetTables,
      }}
    >
      {children}
    </POSContext.Provider>
  );
}

export function usePOS() {
  const context = useContext(POSContext);
  if (context === undefined) {
    throw new Error("usePOS must be used within a POSProvider");
  }
  return context;
}
