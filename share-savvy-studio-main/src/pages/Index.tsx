import { useState } from "react";
import { useExpenseStore } from "@/hooks/useExpenseStore";
import { GroupSidebar } from "@/components/GroupSidebar";
import { GroupDetails } from "@/components/GroupDetails";
import { WelcomeScreen } from "@/components/WelcomeScreen";
import { CreateGroupModal } from "@/components/CreateGroupModal";
import { AddExpenseModal } from "@/components/AddExpenseModal";
import { ManageMembersModal } from "@/components/ManageMembersModal";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const { toast } = useToast();
  const {
    groups,
    selectedGroup,
    selectedGroupId,
    setSelectedGroupId,
    createGroup,
    addMember,
    removeMember,
    addExpense,
    deleteExpense,
    calculateBalances,
    getGroupTotal,
    clearAllData,
  } = useExpenseStore();

  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showManageMembers, setShowManageMembers] = useState(false);

  const balances = selectedGroup ? calculateBalances(selectedGroup) : [];

  const handleCreateGroup = (name: string, members: { name: string; email?: string }[]) => {
    createGroup(name, members);
    toast({
      title: "Group Created",
      description: `"${name}" has been created with ${members.length} members.`,
    });
  };

  const handleAddExpense = (expense: Parameters<typeof addExpense>[1]) => {
    if (selectedGroupId) {
      addExpense(selectedGroupId, expense);
      toast({
        title: "Expense Added",
        description: `₹${expense.amount.toLocaleString()} for "${expense.description}" has been added.`,
      });
    }
  };

  const handleAddMember = (member: { name: string; email?: string }) => {
    if (selectedGroupId) {
      addMember(selectedGroupId, member);
      toast({
        title: "Member Added",
        description: `${member.name} has been added to group.`,
      });
    }
  };

  const handleRemoveMember = (memberId: string) => {
    if (selectedGroupId && selectedGroup) {
      const member = selectedGroup.members.find((m) => m.id === memberId);
      removeMember(selectedGroupId, memberId);
      toast({
        title: "Member Removed",
        description: `${member?.name} has been removed from group.`,
      });
    }
  };

  const handleDeleteExpense = (expenseId: string) => {
    if (selectedGroupId) {
      deleteExpense(selectedGroupId, expenseId);
      toast({
        title: "Expense Deleted",
        description: "The expense has been removed.",
      });
    }
  };

  const handleClearAllData = () => {
    if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      clearAllData();
      toast({
        title: "Data Cleared",
        description: "All groups and expenses have been removed.",
      });
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <GroupSidebar
        groups={groups}
        selectedGroupId={selectedGroupId}
        onSelectGroup={setSelectedGroupId}
        onCreateGroup={() => setShowCreateGroup(true)}
        getGroupTotal={getGroupTotal}
      />

      {selectedGroup ? (
        <GroupDetails
          group={selectedGroup}
          balances={balances}
          totalAmount={getGroupTotal(selectedGroup)}
          onAddExpense={() => setShowAddExpense(true)}
          onManageMembers={() => setShowManageMembers(true)}
          onDeleteExpense={handleDeleteExpense}
        />
      ) : (
        <WelcomeScreen
          hasGroups={groups.length > 0}
          onCreateGroup={() => setShowCreateGroup(true)}
          onClearData={handleClearAllData}
        />
      )}

      <CreateGroupModal
        isOpen={showCreateGroup}
        onClose={() => setShowCreateGroup(false)}
        onCreate={handleCreateGroup}
      />

      {selectedGroup && (
        <>
          <AddExpenseModal
            isOpen={showAddExpense}
            onClose={() => setShowAddExpense(false)}
            members={selectedGroup.members}
            onAdd={handleAddExpense}
          />

          <ManageMembersModal
            isOpen={showManageMembers}
            onClose={() => setShowManageMembers(false)}
            members={selectedGroup.members}
            onAddMember={handleAddMember}
            onRemoveMember={handleRemoveMember}
          />
        </>
      )}
    </div>
  );
};

export default Index;
