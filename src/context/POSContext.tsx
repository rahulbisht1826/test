import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from "react";
import Peer, { DataConnection } from "peerjs";
import { MenuItem, Order, Staff, Table } from "@/types/pos";
import { toast } from "@/hooks/use-toast";
import { menuItems as INITIAL_MENU_ITEMS, categories as INITIAL_CATEGORIES } from "@/data/menuItems";
import { initialTables as INITIAL_TABLES } from "@/data/mockData";

interface ClockSettings {
  enabled: boolean;
  type: 'analog' | 'digital' | 'flip';
}

interface RestaurantSettings {
  name: string;
  address: string;
  phone: string;
  email: string;
  gstNo: string;
  logo: string;
  font: string;
  nameColor?: string;
  password?: string; // Settings Lock Password
  // Global Login Credentials
  adminUsername?: string;
  adminPassword?: string;
  // Security Recovery
  securityQuestion?: string;
  securityAnswer?: string;
  // Appearance
  themeColor?: string; // Hex color
  lastBillNumber?: number;
}

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
  clockSettings: ClockSettings;
  setClockSettings: React.Dispatch<React.SetStateAction<ClockSettings>>;
  settings: RestaurantSettings;
  setSettings: React.Dispatch<React.SetStateAction<RestaurantSettings>>;

  // PeerJS specific
  peerId: string;
  isHost: boolean;
  connections: DataConnection[];
  isConnected: boolean; // Added missing property
  hostSession: () => Promise<string>;
  joinSession: (hostId: string) => Promise<void>;
  leaveSession: () => void;
  disconnectPeers: (peerIds: string[]) => void;
  sendMessage: (recipients: string[], message: string) => void;
  transferData: (targetPeerId: string) => void;

  addMenuItem: (item: Omit<MenuItem, "id">) => void;
  updateMenuItem: (id: string, item: Partial<MenuItem>) => void;
  deleteMenuItems: (ids: string[]) => void;
  addOrder: (order: Omit<Order, "id" | "createdAt">) => void;
  updateOrderStatus: (id: string, status: Order["status"]) => void;
  updateOrderDetails: (order: Order) => void;
  deleteOrder: (id: string) => void;
  deleteOrders: (ids: string[]) => void;
  addStaff: (staff: Omit<Staff, "id" | "createdAt" | "assignedTableIds">) => void;
  assignStaffToTable: (staffId: string, tableId: string) => void;
  addTable: (table: Omit<Table, "id" | "status" | "currentOrder" | "assignedStaffId">) => void;
  updateTable: (id: string, updates: Partial<Table>) => void;
  resetTables: (tableIds: string[]) => void;
  clearAllOrders: () => void;
  messages: any[];
  deleteMessages: (ids: string[]) => void;
}

const POSContext = createContext<POSContextType | undefined>(undefined);

// Initial default data
const DEFAULT_SETTINGS: RestaurantSettings = {
  name: "Grand Hotel Restaurant",
  address: "123 Main Street, City",
  phone: "+1 (555) 123-4567",
  email: "info@grandhotel.com",
  gstNo: "GST123456789",
  logo: "",
  font: "Inter",
  nameColor: "#ef4444",
  password: "123", // Default Settings Lock
  adminUsername: "admin",
  adminPassword: "admin",
  securityQuestion: "",
  securityAnswer: "",
  themeColor: "#f97316", // Default Orange
  lastBillNumber: 0
};

// Helper: Hex to HSL conversion
const hexToHSL = (hex: string) => {
  let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return null;
  let r = parseInt(result[1], 16);
  let g = parseInt(result[2], 16);
  let b = parseInt(result[3], 16);
  r /= 255; g /= 255; b /= 255;
  let max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max == min) {
    h = s = 0; // achromatic
  } else {
    let d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    if (h) h /= 6; // TypeScript safety check, though max!=min implies h is set
  }
  // H is 0-1, S is 0-1, L is 0-1.
  // CSS wants: H (0-360) S% L%
  return `${Math.round((h || 0) * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

export function POSProvider({ children }: { children: ReactNode }) {
  // Load initial data from localStorage
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    const saved = localStorage.getItem("pos_menuItems");
    const parsed = saved ? JSON.parse(saved) : null;
    return (parsed && parsed.length > 0) ? parsed : INITIAL_MENU_ITEMS;
  });
  const [categories, setCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem("pos_categories");
    const parsed = saved ? JSON.parse(saved) : null;
    return (parsed && parsed.length > 0) ? parsed : INITIAL_CATEGORIES;
  });
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem("pos_orders");
    return saved ? JSON.parse(saved) : [];
  });
  const [staff, setStaff] = useState<Staff[]>(() => {
    const saved = localStorage.getItem("pos_staff");
    return saved ? JSON.parse(saved) : [];
  });
  const [tables, setTables] = useState<Table[]>(() => {
    const saved = localStorage.getItem("pos_tables");
    const parsed = saved ? JSON.parse(saved) : null;
    return (parsed && parsed.length > 0) ? parsed : INITIAL_TABLES;
  });

  // Message Persistence
  const [messages, setMessages] = useState<any[]>(() => {
    const saved = localStorage.getItem("pos_messages");
    return saved ? JSON.parse(saved) : [];
  });
  useEffect(() => localStorage.setItem("pos_messages", JSON.stringify(messages)), [messages]);

  const [clockSettings, setClockSettings] = useState<ClockSettings>(() => {
    const saved = localStorage.getItem("pos_clockSettings");
    return saved ? JSON.parse(saved) : { enabled: false, type: 'digital' };
  });
  const [settings, setSettings] = useState<RestaurantSettings>(() => {
    const saved = localStorage.getItem("pos_settings");
    return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
  });

  // Apply Theme Color
  useEffect(() => {
    const color = settings.themeColor || "#f97316";
    const hsl = hexToHSL(color);
    if (hsl) {
      document.documentElement.style.setProperty('--primary', hsl);
      document.documentElement.style.setProperty('--ring', hsl);
      document.documentElement.style.setProperty('--sidebar-primary', hsl);
    }
  }, [settings.themeColor]);

  // PeerJS State
  const [peerId, setPeerId] = useState<string>(() => localStorage.getItem("pos_peer_id") || "");
  const [isHost, setIsHost] = useState<boolean>(() => localStorage.getItem("pos_is_host") === "true");
  const [connections, setConnections] = useState<DataConnection[]>([]);
  const peerRef = useRef<Peer | null>(null);

  // We use this ref to ensure we don't double-init or init when unnecessary
  const isInitializingRef = useRef(false);

  // Persistence Effects
  useEffect(() => localStorage.setItem("pos_menuItems", JSON.stringify(menuItems)), [menuItems]);
  useEffect(() => localStorage.setItem("pos_categories", JSON.stringify(categories)), [categories]);
  useEffect(() => localStorage.setItem("pos_orders", JSON.stringify(orders)), [orders]);
  useEffect(() => localStorage.setItem("pos_staff", JSON.stringify(staff)), [staff]);
  useEffect(() => localStorage.setItem("pos_tables", JSON.stringify(tables)), [tables]);
  useEffect(() => localStorage.setItem("pos_clockSettings", JSON.stringify(clockSettings)), [clockSettings]);
  useEffect(() => localStorage.setItem("pos_settings", JSON.stringify(settings)), [settings]);

  useEffect(() => {
    if (peerId) localStorage.setItem("pos_peer_id", peerId);
  }, [peerId]);

  useEffect(() => {
    localStorage.setItem("pos_is_host", String(isHost));
  }, [isHost]);

  // Ref for current state to be able to send it in callbacks
  const stateRef = useRef({ menuItems, categories, orders, staff, tables, clockSettings, settings });
  useEffect(() => {
    stateRef.current = { menuItems, categories, orders, staff, tables, clockSettings, settings };
  }, [menuItems, categories, orders, staff, tables, clockSettings, settings]);


  const broadcast = (type: string, payload: any) => {
    connections.forEach(conn => {
      if (conn.open) {
        conn.send({ type, payload });
      }
    });
  };

  const sendMessage = (recipients: string[], message: string) => {
    const payload = {
      message,
      timestamp: new Date().toISOString(),
      sender: peerId,
      senderName: settings.adminUsername || "Admin"
    };

    if (recipients.length === 0 || recipients.includes("all")) {
      broadcast("MESSAGE", payload);
    } else {
      connections.forEach(conn => {
        if (recipients.includes(conn.peer) && conn.open) {
          conn.send({ type: "MESSAGE", payload });
        }
      });
    }
    // Show toast for self
    toast({ title: "Message Sent", description: `Sent to ${recipients.includes("all") ? "everyone" : recipients.length + " device(s)"}` });
  };

  const transferData = (targetPeerId: string) => {
    const conn = connections.find(c => c.peer === targetPeerId);
    if (conn && conn.open) {
      conn.send({ type: "SYNC_ALL", payload: stateRef.current });
      toast({ title: "Data Transferred", description: `Full data sync sent to ${targetPeerId}` });
    } else {
      toast({ title: "Transfer Failed", description: "Device not connected.", variant: "destructive" });
    }
  };

  const handleIncomingData = (data: any) => {
    if (data.type === "SYNC_ALL") {
      setMenuItems((data.payload.menuItems && data.payload.menuItems.length > 0) ? data.payload.menuItems : INITIAL_MENU_ITEMS);
      setCategories((data.payload.categories && data.payload.categories.length > 0) ? data.payload.categories : INITIAL_CATEGORIES);
      setOrders(data.payload.orders || []);
      setStaff(data.payload.staff || []);
      setTables((data.payload.tables && data.payload.tables.length > 0) ? data.payload.tables : INITIAL_TABLES);
      setClockSettings(data.payload.clockSettings);
      setSettings(data.payload.settings);
      toast({ title: "Connected", description: "Data synchronized." });
    } else if (data.type === "UPDATE_MENU_ITEMS") {
      setMenuItems(data.payload);
    } else if (data.type === "UPDATE_CATEGORIES") {
      setCategories(data.payload);
    } else if (data.type === "UPDATE_ORDERS") {
      setOrders(data.payload);
    } else if (data.type === "UPDATE_STAFF") {
      setStaff(data.payload);
    } else if (data.type === "UPDATE_TABLES") {
      setTables(data.payload);
    } else if (data.type === "UPDATE_CLOCK_SETTINGS") {
      setClockSettings(data.payload);
    } else if (data.type === "UPDATE_SETTINGS") {
      setSettings(data.payload);
    } else if (data.type === "MESSAGE") {
      const newMessage = {
        id: `msg-${Date.now()}-${Math.random()}`,
        ...data.payload,
        read: false
      };
      setMessages(prev => [newMessage, ...prev]);

      toast({
        title: `Message from ${data.payload.senderName || data.payload.sender || "Peer"}`,
        description: data.payload.message,
        duration: 5000,
      });
    }
  };

  const setupPeerEvents = (peer: Peer) => {
    peer.on("connection", (conn) => {
      console.log("New connection:", conn.peer);

      conn.on("open", () => {
        setConnections(prev => {
          // Avoid duplicates
          if (prev.find(c => c.peer === conn.peer)) return prev;
          return [...prev, conn];
        });

        // If we are host, send initial data sync
        // Clients connecting to us expect data.
        conn.send({ type: "SYNC_ALL", payload: stateRef.current });
      });

      conn.on("data", (data) => {
        handleIncomingData(data);
        // Relay? For now, no relay needed if star topology and everyone connects to Host.
        // But if a Client sends an update (e.g. new order), Host receives it 
        // AND needs to broadcast it to OTHER clients.
        // The sender already updated their local state.

        // IMPORTANT: If we are Host, we must rebroadcast updates to *other* clients
        // The sender (conn) doesn't need it back.
        if (isHost) {
          connections.forEach(c => {
            if (c.peer !== conn.peer && c.open) {
              c.send(data);
            }
          });
        }
      });

      conn.on("close", () => {
        setConnections(prev => prev.filter(c => c.peer !== conn.peer));
      });

      conn.on("error", (err) => {
        console.error("Connection error:", err);
      });
    });
  };

  // Initialization & Restore Logic
  useEffect(() => {
    // Don't init multiple times
    if (peerRef.current || isInitializingRef.current) return;

    const storedPeerId = localStorage.getItem("pos_peer_id");
    const storedIsHost = localStorage.getItem("pos_is_host") === "true";
    const storedHostId = localStorage.getItem("pos_target_host_id");

    // If we have a stored ID, try to reuse it. 
    // If we don't, we wait for user to click Host/Join.
    // Actually, to make "Reconnect" work, we need to spin up the Peer if we were previously active.

    if (storedPeerId && (storedIsHost || storedHostId)) {
      isInitializingRef.current = true;

      const peer = new Peer(storedPeerId);
      peerRef.current = peer;

      peer.on("open", (id) => {
        console.log("Restored Peer ID:", id);
        setPeerId(id);
        setIsHost(storedIsHost);
        setupPeerEvents(peer);

        if (!storedIsHost && storedHostId) {
          // Reconnect to host
          console.log("Auto-reconnecting to host:", storedHostId);
          const conn = peer.connect(storedHostId);
          setupConnectionEvents(conn);
        }
        isInitializingRef.current = false;
      });

      peer.on("error", (err: any) => {
        console.error("Peer error during restore:", err);
        isInitializingRef.current = false;
        if (err.type === 'unavailable-id') {
          // ID taken, maybe we should clear it?
          console.log("Stored Peer ID taken. Clearing.");
          localStorage.removeItem("pos_peer_id");
          setPeerId("");
        }
      });
    }

    return () => {
      // Cleanup?
    };
  }, []);

  const setupConnectionEvents = (conn: DataConnection) => {
    const onOpen = () => {
      setConnections([conn]);
      toast({ title: "Connected", description: "Successfully connected to server" });
    };

    if (conn.open) {
      onOpen();
    } else {
      conn.on("open", onOpen);
    }

    conn.on("data", (data) => handleIncomingData(data));
    conn.on("close", () => {
      setConnections([]);
      toast({ title: "Disconnected", description: "Host disconnected" });
    });
    conn.on("error", (err) => {
      console.error("Connection error:", err);
      toast({ title: "Connection Error", description: err.message, variant: "destructive" });
    });
  };

  // PeerJS Configuration - using multiple free STUN servers for better reliability
  const PEER_CONFIG = {
    debug: 2,
    secure: true,
    config: {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:global.stun.twilio.com:3478' }
      ]
    }
  };

  const hostSession = async () => {
    return new Promise<string>((resolve, reject) => {
      const initializePeer = (id?: string, retryCount = 0) => {
        if (peerRef.current && !peerRef.current.disconnected && !peerRef.current.destroyed) {
          if (peerRef.current.open) {
            setIsHost(true);
            resolve(peerRef.current.id);
            return;
          }
        }

        if (peerRef.current) {
          try { peerRef.current.destroy(); } catch (e) { console.warn(e); }
          peerRef.current = null;
        }

        const peer = id ? new Peer(id, PEER_CONFIG) : new Peer(PEER_CONFIG);
        peerRef.current = peer;

        peer.on("open", (newId) => {
          setPeerId(newId);
          setIsHost(true);
          setupPeerEvents(peer);
          resolve(newId);
        });

        // Add temporary error listener for initialization
        const initError = (err: any) => {
          console.error("Peer init error:", err);
          if (err.type === "unavailable-id") {
            if (retryCount < 5) {
              console.log(`ID taken, retrying in ${1000 * (retryCount + 1)}ms... (Attempt ${retryCount + 1}/5)`);
              peer.destroy();
              peerRef.current = null;
              setTimeout(() => initializePeer(id, retryCount + 1), 1000 * (retryCount + 1));
            } else {
              console.log("ID permanently unavailable, generating new one...");
              peer.destroy();
              peerRef.current = null;
              initializePeer(undefined);
            }
          } else {
            reject(err);
          }
        };
        peer.on("error", initError);
        // Remove error listener on success to avoid leaks? Open implies success
        peer.on("open", () => peer.off("error", initError));
      };

      const storedId = localStorage.getItem("pos_peer_id");
      initializePeer(storedId || undefined);
    });
  };

  const joinSession = async (hostId: string) => {
    const cleanHostId = hostId.trim();
    if (!cleanHostId) throw new Error("Server ID is empty");
    if (cleanHostId === peerId) throw new Error("Cannot connect to yourself");

    // Force cleanup of existing peer if it's in a bad state
    let peer = peerRef.current;
    if (peer && (!peer.open || peer.disconnected || peer.destroyed)) {
      try { peer.destroy(); } catch (e) { console.warn(e); }
      peer = null;
      peerRef.current = null;
    }

    try {
      if (!peer) {
        // Create new peer if none exists
        peer = new Peer(PEER_CONFIG);
        peerRef.current = peer;
      }
    } catch (e: any) {
      throw new Error("Failed to initialize network: " + e.message);
    }

    return new Promise<void>((resolve, reject) => {
      const connectToHost = () => {
        setIsHost(false);
        localStorage.setItem("pos_target_host_id", cleanHostId);

        // Close existing connections
        connections.forEach(c => c.close());
        setConnections([]);

        const conn = peer!.connect(cleanHostId, {
          reliable: true,
          serialization: 'json',
          metadata: { name: settings.adminUsername || "Unknown Device" }
        });

        const timeoutId = setTimeout(() => {
          if (conn && !conn.open) {
            conn.close();
            reject(new Error("Connection timed out. Verify Server ID is correct and Host is Online."));
          }
        }, 15000);

        conn.on("open", () => {
          clearTimeout(timeoutId);
          setupConnectionEvents(conn);
          resolve();
        });

        conn.on("error", (err) => {
          clearTimeout(timeoutId);
          reject(err);
        });

        // Handle peer error specific to this connection attempt
        const peerErrorListener = (err: any) => {
          if (err.type === 'peer-unavailable') {
            clearTimeout(timeoutId);
            reject(new Error("Server ID not found. Check the ID and try again."));
          }
        };

        peer!.on('error', peerErrorListener);
        // Remove listener after some time or on success to prevent leaks
        conn.on("open", () => peer!.off('error', peerErrorListener));
        setTimeout(() => peer!.off('error', peerErrorListener), 5000);
      };

      if (peer!.open) {
        connectToHost();
      } else {
        peer!.on("open", (id) => {
          setPeerId(id);
          connectToHost();
        });
        peer!.on("error", (err) => {
          // General peer error
          reject(new Error("Peer Network Error: " + err.type));
        });
      }
    });
  };

  const leaveSession = () => {
    // Close all connections
    connections.forEach(c => c.close());
    setConnections([]);
    setIsHost(false);
    localStorage.removeItem("pos_is_host");
    localStorage.removeItem("pos_target_host_id");

    // We keep the peer open and ID same, just clear connections
    toast({ title: "Session Ended", description: "Disconnected from all devices." });
  };

  const disconnectPeers = (peerIds: string[]) => {
    const toClose = connections.filter(c => peerIds.includes(c.peer));
    toClose.forEach(c => c.close());
    setConnections(prev => prev.filter(c => !peerIds.includes(c.peer)));
    toast({ title: "Disconnected", description: `Removed ${toClose.length} device(s).` });
  };


  // Action Helper Wrappers
  const updateAndBroadcast = (type: string, data: any, setter: any) => {
    setter(data);
    broadcast(type, data);
  };

  const addMenuItem = (item: Omit<MenuItem, "id">) => {
    const newItem: MenuItem = { ...item, id: `menu-${Date.now()}` };
    const newItems = [...menuItems, newItem];
    updateAndBroadcast("UPDATE_MENU_ITEMS", newItems, setMenuItems);

    if (!categories.includes(item.category)) {
      const newCategories = [...categories, item.category];
      updateAndBroadcast("UPDATE_CATEGORIES", newCategories, setCategories);
    }
  };

  const updateMenuItem = (id: string, item: Partial<MenuItem>) => {
    const newItems = menuItems.map((m) => (m.id === id ? { ...m, ...item } : m));
    updateAndBroadcast("UPDATE_MENU_ITEMS", newItems, setMenuItems);

    if (item.category && !categories.includes(item.category)) {
      const newCategories = [...categories, item.category];
      updateAndBroadcast("UPDATE_CATEGORIES", newCategories, setCategories);
    }
  };

  const deleteMenuItems = (ids: string[]) => {
    const newItems = menuItems.filter((m) => !ids.includes(m.id));
    updateAndBroadcast("UPDATE_MENU_ITEMS", newItems, setMenuItems);
  };

  const addOrder = (order: Omit<Order, "id" | "createdAt">) => {
    let assignedStaffId: string | undefined;
    if (order.tableId) {
      const table = tables.find(t => t.id === order.tableId);
      assignedStaffId = table?.assignedStaffId;
    }

    const newOrder: Order = {
      ...order,
      id: `order-${Date.now()}`,
      createdAt: new Date(),
      staffId: assignedStaffId,
      billNumber: (settings.lastBillNumber || 0) + 1,
    };

    // Update lastBillNumber setting
    const newSettings = { ...settings, lastBillNumber: newOrder.billNumber };
    updateAndBroadcast("UPDATE_SETTINGS", newSettings, setSettings);

    const newOrders = [newOrder, ...orders];
    updateAndBroadcast("UPDATE_ORDERS", newOrders, setOrders);

    if (order.tableId) {
      const newTables = tables.map((t) => {
        if (t.id !== order.tableId) return t;
        if (order.status === 'paid') {
          return { ...t, status: "available", currentOrder: undefined } as Table;
        }
        return { ...t, status: "occupied", currentOrder: newOrder } as Table;
      });
      updateAndBroadcast("UPDATE_TABLES", newTables, setTables);
    }
  };

  const updateOrderStatus = (id: string, status: Order["status"]) => {
    const newOrders = orders.map((o) => (o.id === id ? { ...o, status } : o));
    updateAndBroadcast("UPDATE_ORDERS", newOrders, setOrders);

    if (status === "paid") {
      const order = orders.find((o) => o.id === id);
      if (order?.tableId) {
        const newTables = tables.map((t) =>
          t.id === order.tableId
            ? { ...t, status: "available", currentOrder: undefined } as Table
            : t
        );
        updateAndBroadcast("UPDATE_TABLES", newTables, setTables);
      }
    }
  };

  const updateOrderDetails = (updatedOrder: Order) => {
    const newOrders = orders.map((o) => (o.id === updatedOrder.id ? updatedOrder : o));
    updateAndBroadcast("UPDATE_ORDERS", newOrders, setOrders);
  };

  const deleteOrder = (id: string) => {
    const newOrders = orders.filter((o) => o.id !== id);
    updateAndBroadcast("UPDATE_ORDERS", newOrders, setOrders);
  };

  const deleteOrders = (ids: string[]) => {
    const newOrders = orders.filter((o) => !ids.includes(o.id));
    updateAndBroadcast("UPDATE_ORDERS", newOrders, setOrders);
  };

  const addStaff = (staffData: Omit<Staff, "id" | "createdAt" | "assignedTableIds">) => {
    const newStaff: Staff = {
      ...staffData,
      id: `staff-${Date.now()}`,
      assignedTableIds: [],
      createdAt: new Date(),
    };
    const newStaffList = [...staff, newStaff];
    updateAndBroadcast("UPDATE_STAFF", newStaffList, setStaff);
  };

  const assignStaffToTable = (staffId: string, tableId: string) => {
    const newStaffList = staff.map((s) =>
      s.id === staffId
        ? { ...s, assignedTableIds: [...s.assignedTableIds, tableId] }
        : s
    );
    updateAndBroadcast("UPDATE_STAFF", newStaffList, setStaff);

    const newTables = tables.map((t) =>
      t.id === tableId ? { ...t, assignedStaffId: staffId } : t
    );
    updateAndBroadcast("UPDATE_TABLES", newTables, setTables);
  };

  const addTable = (tableData: Omit<Table, "id" | "status" | "currentOrder" | "assignedStaffId">) => {
    const newTable: Table = {
      ...tableData,
      id: `table-${Date.now()}`,
      status: "available",
      currentOrder: undefined,
      assignedStaffId: undefined,
    };
    const newTables = [...tables, newTable];
    updateAndBroadcast("UPDATE_TABLES", newTables, setTables);
  };

  const updateTable = (id: string, updates: Partial<Table>) => {
    const newTables = tables.map((t) => (t.id === id ? { ...t, ...updates } : t));
    updateAndBroadcast("UPDATE_TABLES", newTables, setTables);
  };

  const resetTables = (tableIds: string[]) => {
    const newTables = tables.map((t) =>
      tableIds.includes(t.id)
        ? { ...t, status: "available", currentOrder: undefined } as Table
        : t
    );
    updateAndBroadcast("UPDATE_TABLES", newTables, setTables);
  };

  const clearAllOrders = () => {
    updateAndBroadcast("UPDATE_ORDERS", [], setOrders);
    const newTables = tables.map((t) => ({ ...t, status: "available", currentOrder: undefined } as Table));
    updateAndBroadcast("UPDATE_TABLES", newTables, setTables);
  };

  const deleteMessages = (ids: string[]) => {
    setMessages(prev => prev.filter(m => !ids.includes(m.id)));
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
        clockSettings,
        setClockSettings,
        settings,
        setSettings,
        peerId,
        isHost,
        connections,
        hostSession,
        joinSession,
        leaveSession,
        disconnectPeers,
        sendMessage,
        transferData,
        isConnected: connections.length > 0,
        addMenuItem,
        updateMenuItem,
        deleteMenuItems,
        addOrder,
        updateOrderStatus,
        updateOrderDetails,
        deleteOrder,
        deleteOrders,
        addStaff,
        assignStaffToTable,
        addTable,
        updateTable,
        resetTables,
        clearAllOrders,
        messages,
        deleteMessages
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
