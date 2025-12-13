
import { useState } from "react";
import { Mail, Trash2, CheckSquare, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { usePOS } from "@/context/POSContext";
import { format } from "date-fns";

export function Inbox() {
    const { messages, deleteMessages } = usePOS();
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isOpen, setIsOpen] = useState(false);

    const toggleSelect = (id: string, checked: boolean) => {
        if (checked) {
            setSelectedIds(prev => [...prev, id]);
        } else {
            setSelectedIds(prev => prev.filter(i => i !== id));
        }
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === messages.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(messages.map(m => m.id));
        }
    };

    const handleDelete = () => {
        deleteMessages(selectedIds);
        setSelectedIds([]);
    };

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Mail className="h-5 w-5" />
                    {messages.length > 0 && (
                        <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                <div className="flex items-center justify-between p-4 border-b">
                    <h4 className="font-semibold leading-none">Inbox ({messages.length})</h4>
                    <div className="flex gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={toggleSelectAll}
                            title="Select All"
                        >
                            {messages.length > 0 && selectedIds.length === messages.length ? (
                                <CheckSquare className="h-4 w-4" />
                            ) : (
                                <Square className="h-4 w-4" />
                            )}
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            className="h-8 w-8 p-0"
                            disabled={selectedIds.length === 0}
                            onClick={handleDelete}
                            title="Delete Selected"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
                <ScrollArea className="h-[300px]">
                    {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-4">
                            <Mail className="h-8 w-8 mb-2 opacity-50" />
                            <p className="text-sm">No new messages</p>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {messages.map((msg) => (
                                <div key={msg.id} className="p-4 hover:bg-muted/50 transition-colors flex gap-3 items-start">
                                    <Checkbox
                                        id={`msg-${msg.id}`}
                                        checked={selectedIds.includes(msg.id)}
                                        onCheckedChange={(checked) => toggleSelect(msg.id, checked as boolean)}
                                        className="mt-1"
                                    />
                                    <div className="space-y-1 flex-1 min-w-0">
                                        <div className="flex justify-between items-start gap-2">
                                            <label
                                                htmlFor={`msg-${msg.id}`}
                                                className="font-medium text-sm leading-none cursor-pointer"
                                            >
                                                {msg.senderName || "Unknown"}
                                            </label>
                                            <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                                {msg.timestamp ? format(new Date(msg.timestamp), 'HH:mm') : ''}
                                            </span>
                                        </div>
                                        <p className="text-sm text-muted-foreground break-words leading-snug">
                                            {msg.message}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </PopoverContent>
        </Popover>
    );
}
