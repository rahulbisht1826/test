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
import { format } from "date-fns";

const Reports = () => {
    const { orders, staff, tables } = usePOS();

    // Calculate Total Revenue from paid orders
    const totalRevenue = useMemo(() => {
        return orders
            .filter(order => order.status === 'paid')
            .reduce((sum, order) => sum + order.total, 0);
    }, [orders]);

    // Calculate Total Orders
    const totalOrdersCount = orders.length;

    // Active Staff Count
    const activeStaffCount = staff.length;

    // Active Tables Count
    const activeTablesCount = tables.filter(t => t.status !== 'available').length;
    const totalTablesCount = tables.length;

    // Prepare Sales Data for Line Chart (Group by Date)
    const salesData = useMemo(() => {
        const salesMap = new Map<string, number>();

        orders.forEach(order => {
            if (order.status === 'paid') {
                const date = format(new Date(order.createdAt), 'MMM dd');
                salesMap.set(date, (salesMap.get(date) || 0) + order.total);
            }
        });

        const data = Array.from(salesMap.entries()).map(([name, sales]) => ({
            name,
            sales
        }));

        // Sort by date if needed, or simple reverse/slice for recent
        // For simplicity, just showing what we have, limited to last 7 entries if too many
        return data.slice(-7);
    }, [orders]);

    // Prepare Staff Performance Data for Bar Chart
    const staffData = useMemo(() => {
        const staffMap = new Map<string, { orders: number; sales: number }>();

        // Initialize with all staff
        staff.forEach(s => {
            staffMap.set(s.id, { orders: 0, sales: 0 });
        });

        // Aggregate orders
        orders.forEach(order => {
            // If order has a staffId, attribute it. 
            // Note: The Order interface has optional staffId? 
            // If not present, we can try to fallback to table's assigned staff if logic allows,
            // but for now let's use order.staffId if available.
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
        return staff.map(s => {
            const metrics = staffMap.get(s.id) || { orders: 0, sales: 0 };
            return {
                name: s.name,
                orders: metrics.orders,
                sales: metrics.sales
            };
        });
    }, [orders, staff]);

    const handleDownloadReport = () => {
        if (orders.length === 0) {
            alert("No orders to export.");
            return;
        }

        // CSV Header
        const headers = ["Order ID", "Date", "Time", "Status", "Table", "Total Amount", "Payment Method", "Customer Name", "Staff"];

        // CSV Rows
        const rows = orders.map(order => {
            const table = tables.find(t => t.id === order.tableId);
            const staffMember = staff.find(s => s.id === order.staffId);
            const date = new Date(order.createdAt);

            return [
                order.id,
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
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Reports & Analytics</h1>
                    <p className="text-muted-foreground">
                        View your business performance and staff metrics.
                    </p>
                </div>
                <Button onClick={handleDownloadReport} className="w-full md:w-auto">
                    <Download className="mr-2 h-4 w-4" />
                    Download Report
                </Button>
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
