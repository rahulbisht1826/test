import { useState } from "react";
import { Plus, User, Key, IdCard } from "lucide-react";
import { Staff, Table } from "@/types/pos";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

interface StaffManagementProps {
  staff: Staff[];
  tables: Table[];
  onAddStaff: (staff: Omit<Staff, "id" | "createdAt" | "assignedTableIds">) => void;
  onAssignTable: (staffId: string, tableId: string) => void;
}

export function StaffManagement({
  staff,
  tables,
  onAddStaff,
  onAssignTable,
}: StaffManagementProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState("");
  const [selectedTableId, setSelectedTableId] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    id: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleAddStaff = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.id.trim()) newErrors.id = "Staff ID is required";
    if (!formData.password.trim()) newErrors.password = "Password is required";
    if (formData.password.length < 4) newErrors.password = "Password must be at least 4 characters";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onAddStaff({
      name: formData.name.trim(),
      password: formData.password,
    });

    toast({
      title: "Staff added",
      description: `${formData.name} has been added successfully`,
    });

    setShowAddDialog(false);
    setFormData({ name: "", id: "", password: "" });
    setErrors({});
  };

  const handleAssignTable = () => {
    if (!selectedStaffId || !selectedTableId) {
      toast({
        title: "Error",
        description: "Please select both staff and table",
        variant: "destructive",
      });
      return;
    }

    onAssignTable(selectedStaffId, selectedTableId);
    toast({
      title: "Table assigned",
      description: "Staff has been assigned to the table",
    });

    setShowAssignDialog(false);
    setSelectedStaffId("");
    setSelectedTableId("");
  };

  const unassignedTables = tables.filter((t) => !t.assignedStaffId);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Staff Management
          </span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setShowAssignDialog(true)}>
              Assign Table
            </Button>
            <Button size="sm" onClick={() => setShowAddDialog(true)}>
              <Plus className="mr-1 h-4 w-4" />
              Add Staff
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {staff.length === 0 ? (
          <div className="flex h-20 flex-col items-center justify-center text-muted-foreground">
            <p>No staff members yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {staff.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between rounded-lg border bg-muted/30 p-3"
              >
                <div>
                  <p className="font-medium">{s.name}</p>
                  <p className="text-sm text-muted-foreground">ID: {s.id}</p>
                </div>
                <div className="flex gap-1 flex-wrap justify-end">
                  {s.assignedTableIds.length === 0 ? (
                    <Badge variant="secondary">No tables</Badge>
                  ) : (
                    s.assignedTableIds.map((tableId) => {
                      const table = tables.find((t) => t.id === tableId);
                      return (
                        <Badge key={tableId} variant="outline">
                          Table {table?.number}
                        </Badge>
                      );
                    })
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Staff</DialogTitle>
            <DialogDescription>
              Enter the details for the new staff member
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="staffName">
                <User className="inline mr-2 h-4 w-4" />
                Name
              </Label>
              <Input
                id="staffName"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  setErrors({ ...errors, name: "" });
                }}
                placeholder="Enter staff name"
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="staffId">
                <IdCard className="inline mr-2 h-4 w-4" />
                Staff ID
              </Label>
              <Input
                id="staffId"
                value={formData.id}
                onChange={(e) => {
                  setFormData({ ...formData, id: e.target.value });
                  setErrors({ ...errors, id: "" });
                }}
                placeholder="Enter unique staff ID"
              />
              {errors.id && <p className="text-sm text-destructive">{errors.id}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="staffPassword">
                <Key className="inline mr-2 h-4 w-4" />
                Password
              </Label>
              <Input
                id="staffPassword"
                type="password"
                value={formData.password}
                onChange={(e) => {
                  setFormData({ ...formData, password: e.target.value });
                  setErrors({ ...errors, password: "" });
                }}
                placeholder="Enter password"
              />
              {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddStaff}>Add Staff</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Table to Staff</DialogTitle>
            <DialogDescription>
              Select a staff member and a table to assign
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Staff Member</Label>
              <Select value={selectedStaffId} onValueChange={setSelectedStaffId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select staff" />
                </SelectTrigger>
                <SelectContent>
                  {staff.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Table</Label>
              <Select value={selectedTableId} onValueChange={setSelectedTableId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select table" />
                </SelectTrigger>
                <SelectContent>
                  {unassignedTables.length === 0 ? (
                    <SelectItem value="none" disabled>
                      All tables are assigned
                    </SelectItem>
                  ) : (
                    unassignedTables.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        Table {t.number}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAssignDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAssignTable} disabled={unassignedTables.length === 0}>
              Assign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
