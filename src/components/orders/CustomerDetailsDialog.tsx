import { useState } from "react";
import { User, Phone, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { CustomerDetails } from "@/types/pos";

interface CustomerDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (details: CustomerDetails) => void;
}

export function CustomerDetailsDialog({
  open,
  onOpenChange,
  onSubmit,
}: CustomerDetailsDialogProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"Cash" | "Card" | "UPI">("Cash");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!phone.trim()) {
      setError("Phone number is required");
      return;
    }

    // Basic phone validation
    const phoneRegex = /^[0-9]{10,15}$/;
    if (!phoneRegex.test(phone.replace(/[- ]/g, ""))) {
      setError("Please enter a valid phone number");
      return;
    }

    onSubmit({
      name: name.trim() || undefined,
      phone: phone.trim(),
      paymentMethod
    });
    setName("");
    setPhone("");
    setPaymentMethod("Cash");
    setError("");
  };

  const handleClose = () => {
    setName("");
    setPhone("");
    setPaymentMethod("Cash");
    setError("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Customer Details</DialogTitle>
          <DialogDescription>
            Enter customer information for the order
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="customerName">
              <User className="inline mr-2 h-4 w-4" />
              Name (Optional)
            </Label>
            <Input
              id="customerName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter customer name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="customerPhone">
              <Phone className="inline mr-2 h-4 w-4" />
              Phone Number *
            </Label>
            <Input
              id="customerPhone"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                setError("");
              }}
              placeholder="Enter phone number"
              type="tel"
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <div className="space-y-2">
            <Label>
              <CreditCard className="inline mr-2 h-4 w-4" />
              Payment Method
            </Label>
            <Select
              value={paymentMethod}
              onValueChange={(value: "Cash" | "Card" | "UPI") => setPaymentMethod(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Cash">Cash</SelectItem>
                <SelectItem value="Card">Card</SelectItem>
                <SelectItem value="UPI">UPI</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Confirm & Send Order</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
