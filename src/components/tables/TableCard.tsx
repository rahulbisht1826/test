import { Users, User } from "lucide-react";
import { Table } from "@/types/pos";
import { cn } from "@/lib/utils";

interface TableCardProps {
  table: Table;
  onClick: (table: Table) => void;
  assignedStaff?: string;
}

const statusStyles = {
  available: "border-success/30 bg-success/5 hover:border-success hover:bg-success/10",
  occupied: "border-primary/30 bg-primary/5 hover:border-primary hover:bg-primary/10",
  reserved: "border-warning/30 bg-warning/5 hover:border-warning hover:bg-warning/10",
};

const statusDotStyles = {
  available: "bg-success",
  occupied: "bg-primary animate-pulse",
  reserved: "bg-warning",
};

export function TableCard({ table, onClick, assignedStaff }: TableCardProps) {
  return (
    <button
      onClick={() => onClick(table)}
      className={cn(
        "group relative flex h-32 w-full flex-col items-center justify-center gap-2 rounded-xl border-2 transition-all duration-200 pl-6",
        statusStyles[table.status]
      )}
    >
      <div className={cn(
        "absolute right-3 top-3 h-3 w-3 rounded-full",
        statusDotStyles[table.status]
      )} />
      
      <span className="text-3xl font-bold">{table.number}</span>
      
      <div className="flex items-center gap-1 text-muted-foreground">
        <Users className="h-4 w-4" />
        <span className="text-sm">{table.capacity}</span>
      </div>
      
      <span className="text-xs font-medium capitalize text-muted-foreground">
        {table.status}
      </span>

      {assignedStaff && (
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-center gap-1 text-xs text-muted-foreground">
          <User className="h-3 w-3" />
          <span className="truncate">{assignedStaff}</span>
        </div>
      )}
    </button>
  );
}
