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
import { Avatar } from "./Avatar";
import { Plus, X, Users } from "lucide-react";
import { Member } from "@/types/expense";

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, members: Omit<Member, "id">[]) => void;
}

export function CreateGroupModal({
  isOpen,
  onClose,
  onCreate,
}: CreateGroupModalProps) {
  const [groupName, setGroupName] = useState("");
  const [memberName, setMemberName] = useState("");
  const [memberEmail, setMemberEmail] = useState("");
  const [members, setMembers] = useState<Omit<Member, "id">[]>([]);

  const handleAddMember = () => {
    if (memberName.trim()) {
      setMembers([
        ...members,
        { name: memberName.trim(), email: memberEmail.trim() || undefined },
      ]);
      setMemberName("");
      setMemberEmail("");
    }
  };

  const handleRemoveMember = (index: number) => {
    setMembers(members.filter((_, i) => i !== index));
  };

  const handleCreate = () => {
    if (groupName.trim() && members.length >= 2) {
      onCreate(groupName.trim(), members);
      setGroupName("");
      setMembers([]);
      onClose();
    }
  };

  const handleClose = () => {
    setGroupName("");
    setMemberName("");
    setMemberEmail("");
    setMembers([]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Create New Group
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="groupName">Group Name</Label>
            <Input
              id="groupName"
              placeholder="e.g., Goa Trip, Apartment 42B..."
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
          </div>

          <div className="space-y-3">
            <Label>Add Members (minimum 2)</Label>
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

            {members.length > 0 && (
              <div className="space-y-2 mt-4">
                {members.map((member, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-secondary rounded-lg animate-scale-in"
                  >
                    <Avatar name={member.name} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {member.name}
                      </p>
                      {member.email && (
                        <p className="text-xs text-muted-foreground truncate">
                          {member.email}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => handleRemoveMember(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="outline" className="flex-1" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            className="flex-1"
            onClick={handleCreate}
            disabled={!groupName.trim() || members.length < 2}
          >
            Create Group
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
