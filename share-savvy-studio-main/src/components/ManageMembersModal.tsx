import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "./Avatar";
import { Plus, UserMinus, Users } from "lucide-react";
import { Member } from "@/types/expense";

interface ManageMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: Member[];
  onAddMember: (member: Omit<Member, "id">) => void;
  onRemoveMember: (memberId: string) => void;
}

export function ManageMembersModal({
  isOpen,
  onClose,
  members,
  onAddMember,
  onRemoveMember,
}: ManageMembersModalProps) {
  const [memberName, setMemberName] = useState("");
  const [memberEmail, setMemberEmail] = useState("");

  const handleAddMember = () => {
    if (memberName.trim()) {
      onAddMember({
        name: memberName.trim(),
        email: memberEmail.trim() || undefined,
      });
      setMemberName("");
      setMemberEmail("");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Manage Members
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">Add New Member</p>
            <div className="flex gap-2">
              <div className="flex-1 space-y-2">
                <Input
                  placeholder="Name"
                  value={memberName}
                  onChange={(e) => setMemberName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddMember()}
                />
                <Input
                  placeholder="Email (optional)"
                  type="email"
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddMember()}
                />
              </div>
              <Button
                type="button"
                size="icon"
                className="h-auto"
                onClick={handleAddMember}
                disabled={!memberName.trim()}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">
              Current Members ({members.length})
            </p>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-3 p-3 bg-secondary rounded-lg"
                >
                  <Avatar name={member.name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{member.name}</p>
                    {member.email && (
                      <p className="text-xs text-muted-foreground truncate">
                        {member.email}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => onRemoveMember(member.id)}
                    disabled={members.length <= 2}
                  >
                    <UserMinus className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
            {members.length <= 2 && (
              <p className="text-xs text-muted-foreground text-center">
                Groups must have at least 2 members
              </p>
            )}
          </div>
        </div>

        <Button variant="outline" onClick={onClose} className="w-full">
          Done
        </Button>
      </DialogContent>
    </Dialog>
  );
}
