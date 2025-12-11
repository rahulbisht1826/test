export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  image?: string;
}

export interface OrderItem {
  menuItem: MenuItem;
  quantity: number;
}

export interface CustomerDetails {
  name?: string;
  phone: string;
}

export interface Order {
  id: string;
  tableId: string | null; // null for takeaway
  items: OrderItem[];
  status: 'pending' | 'preparing' | 'served' | 'paid';
  createdAt: Date;
  total: number;
  customerDetails?: CustomerDetails;
  isTakeaway: boolean;
  staffId?: string;
}

export interface Staff {
  id: string;
  name: string;
  password: string;
  assignedTableIds: string[];
  createdAt: Date;
}

export interface Table {
  id: string;
  number: number;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved';
  currentOrder?: Order;
  assignedStaffId?: string;
}

export interface DailySales {
  date: string;
  revenue: number;
  orders: number;
}
