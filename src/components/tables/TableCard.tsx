import { Users, User, Pencil } from "lucide-react";
import { Table } from "@/types/pos";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface TableCardProps {
  table: Table;
  onClick: (table: Table) => void;
  onEdit?: (table: Table) => void;
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

export function TableCard({ table, onClick, onEdit, assignedStaff }: TableCardProps) {
  return (
    <div className="group relative">
      <button
        onClick={() => onClick(table)}
        className={cn(
          "relative flex h-32 w-full flex-col items-center justify-center gap-2 rounded-xl border-2 transition-all duration-200 pl-6",
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

        {table.status === 'occupied' && table.currentOrder && table.currentOrder.items.length > 0 ? (
          <div className="flex flex-col items-center gap-0.5 w-full px-2 mt-1">
            {table.currentOrder.items.slice(0, 2).map((item, idx) => (
              <span key={idx} className="text-[10px] text-muted-foreground leading-tight truncate w-full text-center">
                {item.quantity}x {item.menuItem.name}
              </span>
            ))}
            {table.currentOrder.items.length > 2 && (
              <span className="text-[10px] text-primary leading-tight">
                +{table.currentOrder.items.length - 2} more...
              </span>
            )}
          </div>
        ) : (
          <span className="text-xs font-medium capitalize text-muted-foreground">
            {table.status}
          </span>
        )}

        {assignedStaff && (
          <div className="absolute bottom-2 left-2 right-2 flex items-center justify-center gap-1 text-xs text-muted-foreground">
            <User className="h-3 w-3" />
            <span className="truncate">{assignedStaff}</span>
          </div>
        )}
      </button>

      {onEdit && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 z-10 h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100 bg-background/50 hover:bg-background"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(table);
          }}
        >
          <Pencil className="h-3 w-3 text-muted-foreground" />
          <span className="sr-only">Edit Table</span>
        </Button>
      )}
    </div>
  );
}
