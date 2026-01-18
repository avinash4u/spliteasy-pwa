import { Group } from "@/types/expense";
import { Avatar } from "./Avatar";
import { Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface GroupCardProps {
  group: Group;
  isSelected: boolean;
  onClick: () => void;
  totalAmount: number;
}

export function GroupCard({ group, isSelected, onClick, totalAmount }: GroupCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left p-4 rounded-lg transition-all duration-200",
        "hover:bg-sidebar-accent",
        isSelected
          ? "bg-sidebar-accent border-l-4 border-sidebar-primary"
          : "border-l-4 border-transparent"
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex -space-x-2">
          {group.members.slice(0, 3).map((member) => (
            <Avatar key={member.id} name={member.name} size="sm" />
          ))}
          {group.members.length > 3 && (
            <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center text-xs font-medium text-sidebar-foreground border-2 border-sidebar-background">
              +{group.members.length - 3}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sidebar-foreground truncate">
            {group.name}
          </h3>
          <div className="flex items-center gap-1 text-xs text-sidebar-foreground/60 mt-1">
            <Users className="w-3 h-3" />
            <span>{group.members.length} members</span>
          </div>
          {totalAmount > 0 && (
            <p className="text-xs text-sidebar-primary mt-1 font-medium">
              ₹{totalAmount.toLocaleString()} total
            </p>
          )}
        </div>
      </div>
    </button>
  );
}
