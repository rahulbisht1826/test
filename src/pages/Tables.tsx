import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TableCard } from "@/components/tables/TableCard";
import { StaffManagement } from "@/components/staff/StaffManagement";
import { usePOS } from "@/context/POSContext";
import { Table } from "@/types/pos";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RotateCcw } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const Tables = () => {
  const navigate = useNavigate();
  const { tables, staff, addStaff, assignStaffToTable, resetTables } = usePOS();
  const [selectedTables, setSelectedTables] = useState<string[]>([]);

  const handleTableClick = (table: Table) => {
    navigate(`/orders?table=${table.id}`);
  };

  const handleSelectTable = (tableId: string) => {
    setSelectedTables((prev) =>
      prev.includes(tableId)
        ? prev.filter((id) => id !== tableId)
        : [...prev, tableId]
    );
  };

  const handleResetSelected = () => {
    // Filter out tables with assigned staff
    const tablesToReset = selectedTables.filter((id) => {
      const table = tables.find((t) => t.id === id);
      return table && !table.assignedStaffId;
    });

    if (tablesToReset.length === 0) {
      toast({
        title: "Cannot reset",
        description: "Selected tables have assigned staff",
        variant: "destructive",
      });
      return;
    }

    resetTables(tablesToReset);
    setSelectedTables([]);
    toast({
      title: "Tables reset",
      description: `${tablesToReset.length} table(s) have been reset`,
    });
  };

  const availableCount = tables.filter((t) => t.status === "available").length;
  const occupiedCount = tables.filter((t) => t.status === "occupied").length;
  const reservedCount = tables.filter((t) => t.status === "reserved").length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tables</h1>
          <p className="text-muted-foreground">
            Select a table to take an order
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="bg-success/10 text-success border-success/20">
            {availableCount} Available
          </Badge>
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
            {occupiedCount} Occupied
          </Badge>
          <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
            {reservedCount} Reserved
          </Badge>
        </div>
      </div>

      {/* Staff Management Section */}
      <StaffManagement
        staff={staff}
        tables={tables}
        onAddStaff={addStaff}
        onAssignTable={assignStaffToTable}
      />

      {/* Table Selection Controls */}
      {selectedTables.length > 0 && (
        <div className="flex items-center gap-4 p-4 rounded-lg border bg-muted/30">
          <span className="text-sm font-medium">
            {selectedTables.length} table(s) selected
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetSelected}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset Selected
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedTables([])}
          >
            Clear Selection
          </Button>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {tables.map((table) => {
          const assignedStaff = staff.find((s) => s.id === table.assignedStaffId);
          return (
            <div key={table.id} className="relative">
              <div className="absolute top-2 left-2 z-10">
                <Checkbox
                  checked={selectedTables.includes(table.id)}
                  onCheckedChange={() => handleSelectTable(table.id)}
                  className="bg-background"
                />
              </div>
              <TableCard
                table={table}
                onClick={handleTableClick}
                assignedStaff={assignedStaff?.name}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Tables;
