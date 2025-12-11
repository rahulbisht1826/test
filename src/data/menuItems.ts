import { MenuItem } from "@/types/pos";

export const menuItems: MenuItem[] = [
  // Starters
  { id: "1", name: "Garden Salad", price: 8.99, category: "Starters" },
  { id: "2", name: "Soup of the Day", price: 6.99, category: "Starters" },
  { id: "3", name: "Bruschetta", price: 9.99, category: "Starters" },
  { id: "4", name: "Garlic Bread", price: 5.99, category: "Starters" },
  
  // Main Course
  { id: "5", name: "Grilled Salmon", price: 24.99, category: "Main Course" },
  { id: "6", name: "Ribeye Steak", price: 32.99, category: "Main Course" },
  { id: "7", name: "Chicken Alfredo", price: 18.99, category: "Main Course" },
  { id: "8", name: "Vegetable Risotto", price: 16.99, category: "Main Course" },
  { id: "9", name: "Lamb Chops", price: 28.99, category: "Main Course" },
  { id: "10", name: "Fish & Chips", price: 15.99, category: "Main Course" },
  
  // Beverages
  { id: "11", name: "Fresh Orange Juice", price: 4.99, category: "Beverages" },
  { id: "12", name: "Cappuccino", price: 3.99, category: "Beverages" },
  { id: "13", name: "Sparkling Water", price: 2.99, category: "Beverages" },
  { id: "14", name: "House Wine (Glass)", price: 8.99, category: "Beverages" },
  { id: "15", name: "Craft Beer", price: 6.99, category: "Beverages" },
  
  // Desserts
  { id: "16", name: "Chocolate Cake", price: 7.99, category: "Desserts" },
  { id: "17", name: "Cheesecake", price: 8.99, category: "Desserts" },
  { id: "18", name: "Ice Cream Sundae", price: 6.99, category: "Desserts" },
  { id: "19", name: "Tiramisu", price: 9.99, category: "Desserts" },
];

export const categories = ["All", "Starters", "Main Course", "Beverages", "Desserts"];
