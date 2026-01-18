import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar } from "./Avatar";
import { Receipt, IndianRupee } from "lucide-react";
import { Member, Expense } from "@/types/expense";
import { cn } from "@/lib/utils";

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: Member[];
  onAdd: (expense: Omit<Expense, "id" | "createdAt" | "groupId">) => void;
}

export function AddExpenseModal({
  isOpen,
  onClose,
  members,
  onAdd,
}: AddExpenseModalProps) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState<string>("");
  const [splitBetween, setSplitBetween] = useState<string[]>([]);

  const handleToggleMember = (memberId: string) => {
    setSplitBetween((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleSelectAll = () => {
    if (splitBetween.length === members.length) {
      setSplitBetween([]);
    } else {
      setSplitBetween(members.map((m) => m.id));
    }
  };

  const handleAdd = () => {
    if (description.trim() && amount && paidBy && splitBetween.length > 0) {
      onAdd({
        description: description.trim(),
        amount: parseFloat(amount),
        paidBy,
        splitBetween,
        splitType: "equal",
      });
      handleClose();
    }
  };

  const handleClose = () => {
    setDescription("");
    setAmount("");
    setPaidBy("");
    setSplitBetween([]);
    onClose();
  };

  const perPerson =
    splitBetween.length > 0 ? parseFloat(amount || "0") / splitBetween.length : 0;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-primary" />
            Add Expense
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="What was this expense for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                className="pl-9"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label>Paid by</Label>
            <div className="grid grid-cols-2 gap-2">
              {members.map((member) => (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => setPaidBy(member.id)}
                  className={cn(
                    "flex items-center gap-2 p-3 rounded-lg border-2 transition-all duration-200",
                    paidBy === member.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <Avatar name={member.name} size="sm" />
                  <span className="font-medium text-sm truncate">
                    {member.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Split between</Label>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={handleSelectAll}
              >
                {splitBetween.length === members.length
                  ? "Deselect All"
                  : "Select All"}
              </Button>
            </div>
            <div className="space-y-2">
              {members.map((member) => (
                <label
                  key={member.id}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 cursor-pointer",
                    splitBetween.includes(member.id)
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <Checkbox
                    checked={splitBetween.includes(member.id)}
                    onCheckedChange={() => handleToggleMember(member.id)}
                  />
                  <Avatar name={member.name} size="sm" />
                  <span className="flex-1 font-medium text-sm">
                    {member.name}
                  </span>
                  {splitBetween.includes(member.id) && perPerson > 0 && (
                    <span className="text-sm text-primary font-medium">
                      ₹{perPerson.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </span>
                  )}
                </label>
              ))}
            </div>
          </div>

          {amount && splitBetween.length > 0 && (
            <div className="p-4 bg-secondary rounded-xl">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Split equally among {splitBetween.length} people
                </span>
                <span className="font-bold text-primary">
                  ₹{perPerson.toLocaleString(undefined, { maximumFractionDigits: 2 })} each
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="outline" className="flex-1" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            className="flex-1"
            onClick={handleAdd}
            disabled={
              !description.trim() ||
              !amount ||
              !paidBy ||
              splitBetween.length === 0
            }
          >
            Add Expense
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
