import { Balance, Member } from "@/types/expense";
import { Avatar } from "./Avatar";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface BalanceCardProps {
  balance: Balance;
  members: Member[];
}

export function BalanceCard({ balance, members }: BalanceCardProps) {
  const fromMember = members.find((m) => m.id === balance.from);
  const toMember = members.find((m) => m.id === balance.to);

  if (!fromMember || !toMember) return null;

  return (
    <div className="flex items-center gap-3 p-4 bg-card rounded-xl shadow-card border border-border/50 animate-scale-in">
      <Avatar name={fromMember.name} size="md" />
      
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground truncate">{fromMember.name}</p>
        <p className="text-sm text-muted-foreground">owes</p>
      </div>

      <div className="flex items-center gap-2">
        <div
          className={cn(
            "px-3 py-1.5 rounded-full font-bold text-sm",
            "bg-destructive-muted text-destructive"
          )}
        >
          ₹{balance.amount.toLocaleString()}
        </div>
        <ArrowRight className="w-4 h-4 text-muted-foreground" />
      </div>

      <div className="flex-1 min-w-0 text-right">
        <p className="font-medium text-foreground truncate">{toMember.name}</p>
        <p className="text-sm text-success">gets back</p>
      </div>
      
      <Avatar name={toMember.name} size="md" />
    </div>
  );
}
