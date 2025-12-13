import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    BarChart,
    Bar,
} from "recharts";
import { usePOS } from "@/context/POSContext";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Download, FileDown } from "lucide-react";
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
import { useState } from "react";

const Reports = () => {
    const { orders, staff, tables } = usePOS();
    const [dateFilter, setDateFilter] = useState("lifetime");
    const [customDate, setCustomDate] = useState<Date | undefined>(new Date());

    const filteredOrders = useMemo(() => {
        if (dateFilter === "lifetime") return orders;

        if (dateFilter === "custom" && customDate) {
            return orders.filter(order => isSameDay(new Date(order.createdAt), customDate));
        }

        const days = parseInt(dateFilter);
        if (!isNaN(days)) {
            const startDate = subDays(new Date(), days);
            return orders.filter(order => new Date(order.createdAt) >= startDate);
        }

        return orders;
    }, [orders, dateFilter, customDate]);

    // Calculate Total Revenue from paid orders
    const totalRevenue = useMemo(() => {
        return filteredOrders
            .filter(order => order.status === 'paid')
            .reduce((sum, order) => sum + order.total, 0);
    }, [filteredOrders]);

    // Calculate Total Orders
    const totalOrdersCount = filteredOrders.length;

    // Active Staff Count
    const activeStaffCount = staff.length;

    // Active Tables Count
    const activeTablesCount = tables.filter(t => t.status !== 'available').length;
    const totalTablesCount = tables.length;

    // Prepare Sales Data for Line Chart (Group by Date)
    const salesData = useMemo(() => {
        let data: { name: string; sales: number }[] = [];

        if (filteredOrders.length > 0) {
            const salesMap = new Map<string, number>();
            filteredOrders.forEach(order => {
                if (order.status === 'paid') {
                    const date = format(new Date(order.createdAt), 'MMM dd');
                    salesMap.set(date, (salesMap.get(date) || 0) + order.total);
                }
            });
            data = Array.from(salesMap.entries()).map(([name, sales]) => ({
                name,
                sales
            }));
        }

        // Use mock data if no real sales data
        if (data.length === 0) {
            return [
                { name: 'Mon', sales: 4000 },
                { name: 'Tue', sales: 3000 },
                { name: 'Wed', sales: 2000 },
                { name: 'Thu', sales: 2780 },
                { name: 'Fri', sales: 1890 },
                { name: 'Sat', sales: 2390 },
                { name: 'Sun', sales: 3490 },
            ];
        }

        return data.slice(-7);
    }, [filteredOrders]);

    // Prepare Staff Performance Data for Bar Chart
    const staffData = useMemo(() => {
        let data: { name: string; orders: number; sales: number }[] = [];

        if (staff.length > 0 && filteredOrders.length > 0) {
            const staffMap = new Map<string, { orders: number; sales: number }>();
            // Initialize with all staff
            staff.forEach(s => {
                staffMap.set(s.id, { orders: 0, sales: 0 });
            });

            // Aggregate orders
            filteredOrders.forEach(order => {
                if (order.staffId && staffMap.has(order.staffId)) {
                    const current = staffMap.get(order.staffId)!;
                    if (order.status === 'paid') {
                        current.sales += order.total;
                    }
                    current.orders += 1;
                    staffMap.set(order.staffId, current);
                }
            });

            // Map back to array with Names
            data = staff.map(s => {
                const metrics = staffMap.get(s.id) || { orders: 0, sales: 0 };
                return {
                    name: s.name,
                    orders: metrics.orders,
                    sales: metrics.sales
                };
            });
        }

        // Filter out staff with no activity for cleaner chart, BUT if all empty, show mock
        const activeStaff = data.filter(d => d.orders > 0 || d.sales > 0);

        if (activeStaff.length === 0) {
            return [
                { name: 'Alice', orders: 12, sales: 1200 },
                { name: 'Bob', orders: 19, sales: 2100 },
                { name: 'Charlie', orders: 8, sales: 800 },
                { name: 'Diana', orders: 15, sales: 1600 },
            ];
        }

        return activeStaff;
    }, [filteredOrders, staff]);

    const handleDownloadReport = () => {
        if (filteredOrders.length === 0) {
            alert("No orders to export.");
            return;
        }

        // CSV Header
        const headers = ["Order ID", "Bill No", "Date", "Time", "Status", "Table", "Total Amount", "Payment Method", "Customer Name", "Staff"];

        // CSV Rows
        const rows = filteredOrders.map(order => {
            const table = tables.find(t => t.id === order.tableId);
            const staffMember = staff.find(s => s.id === order.staffId);
            const date = new Date(order.createdAt);

            return [
                order.id,
                order.billNumber || "-",
                format(date, 'yyyy-MM-dd'),
                format(date, 'HH:mm:ss'),
                order.status,
                table ? `Table ${table.number}` : "Takeaway",
                order.total.toFixed(2),
                order.customerDetails?.paymentMethod || "-",
                order.customerDetails?.name || "Guest",
                staffMember ? staffMember.name : "-"
            ].map(field => `"${field}"`).join(","); // Quote fields to handle commas in data
        });

        const csvContent = [headers.join(","), ...rows].join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);

        link.setAttribute("href", url);
        link.setAttribute("download", `sales_report_${format(new Date(), 'yyyy-MM-dd')}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6 p-6 pb-20 md:pb-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Reports & Analytics</h1>
                    <p className="text-muted-foreground">
                        View your business performance and staff metrics.
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                    <Select value={dateFilter} onValueChange={setDateFilter}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select Period" />
                        </SelectTrigger>
                        <SelectContent side="bottom" align="end" className="bg-popover text-popover-foreground z-50">
                            <SelectItem value="30">Last 30 Days</SelectItem>
                            <SelectItem value="90">Last 90 Days</SelectItem>
                            <SelectItem value="365">Last 365 Days</SelectItem>
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
                                        "w-[240px] justify-start text-left font-normal",
                                        !customDate && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {customDate ? format(customDate, "PPP") : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 z-50 pointer-events-auto" align="end">
                                <Calendar
                                    mode="single"
                                    selected={customDate}
                                    onSelect={setCustomDate}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    )}

                    <Button onClick={handleDownloadReport}>
                        <Download className="mr-2 h-4 w-4" />
                        Download Report
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹{totalRevenue.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">
                            Lifetime revenue
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalOrdersCount}</div>
                        <p className="text-xs text-muted-foreground">
                            Lifetime orders
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Staff</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeStaffCount}</div>
                        <p className="text-xs text-muted-foreground">
                            Registered staff members
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Tables</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeTablesCount}/{totalTablesCount}</div>
                        <p className="text-xs text-muted-foreground">
                            Currently occupied
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Sales Growth</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            {salesData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={salesData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Line
                                            type="monotone"
                                            dataKey="sales"
                                            stroke="#8884d8"
                                            activeDot={{ r: 8 }}
                                            name="Revenue (₹)"
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex h-full items-center justify-center text-muted-foreground">
                                    No sales data available yet
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Staff Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            {staffData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={staffData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="orders" fill="#82ca9d" name="Orders Completed" />
                                        <Bar dataKey="sales" fill="#8884d8" name="Total Sales (₹)" />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex h-full items-center justify-center text-muted-foreground">
                                    No staff data available
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Reports;
