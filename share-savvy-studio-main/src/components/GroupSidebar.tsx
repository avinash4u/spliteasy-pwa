import { Group } from "@/types/expense";
import { GroupCard } from "./GroupCard";
import { Button } from "./ui/button";
import { Plus, Wallet } from "lucide-react";

interface GroupSidebarProps {
  groups: Group[];
  selectedGroupId: string | null;
  onSelectGroup: (id: string) => void;
  onCreateGroup: () => void;
  getGroupTotal: (group: Group) => number;
}

export function GroupSidebar({
  groups,
  selectedGroupId,
  onSelectGroup,
  onCreateGroup,
  getGroupTotal,
}: GroupSidebarProps) {
  return (
    <aside className="w-80 gradient-hero flex flex-col h-screen">
      {/* Header */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-sidebar-primary/20">
            <Wallet className="w-6 h-6 text-sidebar-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-sidebar-foreground">
              SplitEase
            </h1>
            <p className="text-xs text-sidebar-foreground/60">
              Split expenses, not friendships
            </p>
          </div>
        </div>
      </div>

      {/* Groups List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-sidebar-foreground/60 uppercase tracking-wider">
            Your Groups
          </h2>
          <span className="text-xs text-sidebar-foreground/40 bg-sidebar-accent px-2 py-1 rounded-full">
            {groups.length}
          </span>
        </div>

        {groups.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sidebar-foreground/60 text-sm">
              No groups yet. Create one to get started!
            </p>
          </div>
        ) : (
          groups.map((group) => (
            <GroupCard
              key={group.id}
              group={group}
              isSelected={selectedGroupId === group.id}
              onClick={() => onSelectGroup(group.id)}
              totalAmount={getGroupTotal(group)}
            />
          ))
        )}
      </div>

      {/* Create Button */}
      <div className="p-4 border-t border-sidebar-border">
        <Button
          onClick={onCreateGroup}
          className="w-full gradient-primary border-0 text-primary-foreground shadow-glow"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create New Group
        </Button>
      </div>
    </aside>
  );
}
