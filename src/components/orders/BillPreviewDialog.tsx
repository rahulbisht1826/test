import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { OrderItem, CustomerDetails } from "@/types/pos";

interface BillPreviewDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    orderItems: OrderItem[];
    subtotal: number;
    tax: number;
    total: number;
    customerDetails: CustomerDetails | null;
    tableNumber?: string | number;
    isTakeaway?: boolean;
    billNumber?: number;
}

export function BillPreviewDialog({
    open,
    onOpenChange,
    orderItems,
    subtotal,
    tax,
    total,
    customerDetails,
    tableNumber,
    isTakeaway,
    billNumber,
}: BillPreviewDialogProps) {
    const date = new Date().toLocaleString();

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-sm max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Bill Preview</DialogTitle>
                </DialogHeader>

                <div className="bg-white text-black p-4 font-mono text-xs shadow-sm border mt-2">
                    <div className="text-center space-y-1 mb-4">
                        <h3 className="font-bold text-lg">Grand Hotel Restaurant</h3>
                        <p>123 Main Street, City</p>
                        <p>Tel: +1 (555) 123-4567</p>
                    </div>

                    <div className="border-b border-dashed border-black my-2" />

                    <div className="space-y-1 mb-2">
                        <div className="flex justify-between">
                            <span>Date:</span>
                            <span>{date}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Table:</span>
                            <span>{isTakeaway ? "Takeaway" : tableNumber || "N/A"}</span>
                        </div>
                        {billNumber && (
                            <div className="flex justify-between">
                                <span>Bill No:</span>
                                <span>#{billNumber}</span>
                            </div>
                        )}
                        {customerDetails && (
                            <>
                                <div className="flex justify-between">
                                    <span>Customer:</span>
                                    <span>{customerDetails.name || "Guest"}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Phone:</span>
                                    <span>{customerDetails.phone}</span>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="border-b border-dashed border-black my-2" />

                    <div className="space-y-2 mb-2">
                        <div className="flex font-bold">
                            <span className="flex-1">Item</span>
                            <span className="w-8 text-center">Qty</span>
                            <span className="w-16 text-right">Price</span>
                        </div>
                        {orderItems.map((item, index) => (
                            <div key={index} className="flex">
                                <span className="flex-1 truncate pr-2">{item.menuItem.name}</span>
                                <span className="w-8 text-center">{item.quantity}</span>
                                <span className="w-16 text-right">
                                    {(item.menuItem.price * item.quantity).toFixed(2)}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="border-b border-dashed border-black my-2" />

                    <div className="space-y-1">
                        <div className="flex justify-between">
                            <span>Subtotal:</span>
                            <span>{subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Tax (10%):</span>
                            <span>{tax.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-sm mt-2">
                            <span>Total:</span>
                            <span>{total.toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="border-b border-dashed border-black my-4" />

                    <div className="text-center space-y-1">
                        <p className="font-bold">Thank You!</p>
                        <p>Please visit again</p>
                    </div>
                </div>

                <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
                    <Button onClick={() => window.print()}>Print</Button>
                </div>

            </DialogContent>
        </Dialog>
    );
}
