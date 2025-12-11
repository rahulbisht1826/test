import { Plus } from "lucide-react";
import { MenuItem } from "@/types/pos";
import { Button } from "@/components/ui/button";

interface MenuItemCardProps {
  item: MenuItem;
  onAdd: (item: MenuItem) => void;
}

export function MenuItemCard({ item, onAdd }: MenuItemCardProps) {
  return (
    <div className="group flex items-center justify-between rounded-lg border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-sm">
      <div>
        <h3 className="font-medium">{item.name}</h3>
        <p className="text-sm text-muted-foreground">{item.category}</p>
      </div>
      <div className="flex items-center gap-3">
        <span className="font-semibold text-primary">₹{item.price.toFixed(2)}</span>
        <Button
          size="icon"
          variant="outline"
          className="h-8 w-8 transition-all group-hover:bg-primary group-hover:text-primary-foreground"
          onClick={() => onAdd(item)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
