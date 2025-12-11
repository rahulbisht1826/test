import { Table, DailySales } from "@/types/pos";

export const initialTables: Table[] = [
  { id: "t1", number: 1, capacity: 2, status: "available" },
  { id: "t2", number: 2, capacity: 2, status: "occupied" },
  { id: "t3", number: 3, capacity: 4, status: "available" },
  { id: "t4", number: 4, capacity: 4, status: "reserved" },
  { id: "t5", number: 5, capacity: 6, status: "occupied" },
  { id: "t6", number: 6, capacity: 6, status: "available" },
  { id: "t7", number: 7, capacity: 8, status: "available" },
  { id: "t8", number: 8, capacity: 4, status: "occupied" },
  { id: "t9", number: 9, capacity: 2, status: "available" },
  { id: "t10", number: 10, capacity: 4, status: "available" },
  { id: "t11", number: 11, capacity: 6, status: "reserved" },
  { id: "t12", number: 12, capacity: 8, status: "available" },
];

export const mockSalesData: DailySales[] = [
  { date: "Mon", revenue: 2450, orders: 42 },
  { date: "Tue", revenue: 3200, orders: 55 },
  { date: "Wed", revenue: 2890, orders: 48 },
  { date: "Thu", revenue: 3560, orders: 62 },
  { date: "Fri", revenue: 4200, orders: 78 },
  { date: "Sat", revenue: 5100, orders: 95 },
  { date: "Sun", revenue: 4800, orders: 88 },
];

export const mockMonthlyData: DailySales[] = [
  { date: "Week 1", revenue: 15200, orders: 280 },
  { date: "Week 2", revenue: 18500, orders: 342 },
  { date: "Week 3", revenue: 16800, orders: 312 },
  { date: "Week 4", revenue: 21200, orders: 398 },
];
