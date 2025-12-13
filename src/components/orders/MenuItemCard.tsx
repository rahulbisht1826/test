import { Plus, Image as ImageIcon } from "lucide-react";
import { MenuItem } from "@/types/pos";
import { Button } from "@/components/ui/button";

interface MenuItemCardProps {
  item: MenuItem;
  onAdd: (item: MenuItem) => void;
}

export function MenuItemCard({ item, onAdd }: MenuItemCardProps) {
  return (
    <div className={`group flex items-start gap-3 rounded-lg border bg-card p-3 transition-all hover:border-primary/30 hover:shadow-sm ${item.available === false ? "opacity-60 grayscale" : ""}`}>
      {item.image && (
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-muted flex items-center justify-center">
          <ImageIcon className="h-6 w-6 text-muted-foreground absolute" />
          <img
            src={item.image}
            alt={item.name}
            className="h-full w-full object-cover relative z-10"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      )}
      <div className="flex-1 flex flex-col justify-between min-h-[4rem]">
        <div>
          <h3 className="font-medium leading-tight">{item.name}</h3>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.category}</p>
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="font-semibold text-primary">₹{item.price.toFixed(2)}</span>
          {item.available === false ? (
            <span className="text-xs font-bold text-destructive border border-destructive px-2 py-1 rounded">
              Out of Stock
            </span>
          ) : (
            <Button
              size="icon"
              variant="outline"
              className="h-7 w-7 transition-all group-hover:bg-primary group-hover:text-primary-foreground"
              onClick={() => onAdd(item)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
