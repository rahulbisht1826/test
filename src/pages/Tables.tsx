import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TableCard } from "@/components/tables/TableCard";
import { usePOS } from "@/context/POSContext";
import { Table } from "@/types/pos";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RotateCcw, Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Tables = () => {
  const navigate = useNavigate();
  const { tables, staff, assignStaffToTable, resetTables, addTable, updateTable } = usePOS();
  const [selectedTables, setSelectedTables] = useState<string[]>([]);
  const [newTableNumber, setNewTableNumber] = useState<string>("");
  const [newTableCapacity, setNewTableCapacity] = useState<string>("4");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Edit State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [editNumber, setEditNumber] = useState("");
  const [editCapacity, setEditCapacity] = useState("");
  const [editStaffId, setEditStaffId] = useState<string>("unassigned");

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

  const handleAddTable = () => {
    if (!newTableNumber) {
      toast({
        title: "Error",
        description: "Please enter a table number",
        variant: "destructive",
      });
      return;
    }

    const number = parseInt(newTableNumber);
    if (tables.some(t => t.number === number)) {
      toast({
        title: "Error",
        description: "Table number already exists",
        variant: "destructive",
      });
      return;
    }

    addTable({
      number,
      capacity: parseInt(newTableCapacity) || 4,
    });

    setNewTableNumber("");
    setNewTableCapacity("4");
    setIsDialogOpen(false);

    toast({
      title: "Table Added",
      description: `Table ${number} has been created.`,
    });
  };

  const openEditDialog = (table: Table) => {
    setEditingTable(table);
    setEditNumber(table.number.toString());
    setEditCapacity(table.capacity.toString());
    setEditStaffId(table.assignedStaffId || "unassigned");
    setIsEditOpen(true);
  };

  const handleUpdateTable = () => {
    if (!editingTable || !editNumber) return;

    const number = parseInt(editNumber);

    // Check for duplicate number only if it changed
    if (number !== editingTable.number && tables.some(t => t.number === number)) {
      toast({ title: "Error", description: "Table number already exists", variant: "destructive" });
      return;
    }

    const updates: Partial<Table> = {
      number,
      capacity: parseInt(editCapacity) || 4,
      assignedStaffId: editStaffId === "unassigned" ? undefined : editStaffId
    };

    updateTable(editingTable.id, updates);

    // Also update staff assignment if changed
    if (editStaffId !== "unassigned" && editStaffId !== editingTable.assignedStaffId) {
      assignStaffToTable(editStaffId, editingTable.id);
    } else if (editStaffId === "unassigned" && editingTable.assignedStaffId) {
      // managed by updateTable logic hopefully
    }

    setIsEditOpen(false);
    setEditingTable(null);
    toast({ title: "Table Updated", description: "Table details have been saved." });
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
        <div className="flex items-center gap-4">
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
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Add Table
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Table</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="number" className="text-right">
                    Number
                  </Label>
                  <Input
                    id="number"
                    type="number"
                    value={newTableNumber}
                    onChange={(e) => setNewTableNumber(e.target.value)}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="capacity" className="text-right">
                    Capacity
                  </Label>
                  <Input
                    id="capacity"
                    type="number"
                    value={newTableCapacity}
                    onChange={(e) => setNewTableCapacity(e.target.value)}
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddTable}>Create Table</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Edit Dialog */}
          <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Table</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-number" className="text-right">
                    Number
                  </Label>
                  <Input
                    id="edit-number"
                    type="number"
                    value={editNumber}
                    onChange={(e) => setEditNumber(e.target.value)}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-capacity" className="text-right">
                    Capacity
                  </Label>
                  <Input
                    id="edit-capacity"
                    type="number"
                    value={editCapacity}
                    onChange={(e) => setEditCapacity(e.target.value)}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-staff" className="text-right">
                    Staff
                  </Label>
                  <div className="col-span-3">
                    <Select value={editStaffId} onValueChange={setEditStaffId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Assign Staff" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned">Unassigned</SelectItem>
                        {staff.map(s => (
                          <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                <Button onClick={handleUpdateTable}>Save Changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

        </div>
      </div>

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
                onEdit={openEditDialog}
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
