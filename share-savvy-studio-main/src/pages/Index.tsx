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
    loading,
    syncWithAPI,
  } = useExpenseStore();

  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showManageMembers, setShowManageMembers] = useState(false);

  const balances = selectedGroup ? calculateBalances(selectedGroup) : [];

  const handleCreateGroup = async (name: string, members: { name: string; email?: string }[]) => {
    try {
      await createGroup(name, members);
      toast({
        title: "Group Created",
        description: `"${name}" has been created with ${members.length} members.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create group. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAddExpense = async (expense: Parameters<typeof addExpense>[1]) => {
    if (selectedGroupId) {
      try {
        await addExpense(selectedGroupId, expense);
        toast({
          title: "Expense Added",
          description: `₹${expense.amount.toLocaleString()} for "${expense.description}" has been added.`,
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to add expense. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleAddMember = async (member: { name: string; email?: string }) => {
    if (selectedGroupId) {
      try {
        await addMember(selectedGroupId, member);
        toast({
          title: "Member Added",
          description: `${member.name} has been added to group.`,
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to add member. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (selectedGroupId && selectedGroup) {
      const member = selectedGroup.members.find((m) => m.id === memberId);
      try {
        await removeMember(selectedGroupId, memberId);
        toast({
          title: "Member Removed",
          description: `${member?.name} has been removed from group.`,
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to remove member. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    if (selectedGroupId) {
      try {
        await deleteExpense(selectedGroupId, expenseId);
        toast({
          title: "Expense Deleted",
          description: "The expense has been removed.",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete expense. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleClearAllData = async () => {
    if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      try {
        await clearAllData();
        toast({
          title: "Data Cleared",
          description: "All groups and expenses have been removed.",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to clear data. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleSyncWithAPI = async () => {
    try {
      await syncWithAPI();
      toast({
        title: "Sync Complete",
        description: "Your data has been synchronized with the cloud.",
      });
    } catch (error) {
      toast({
        title: "Sync Failed",
        description: "Failed to sync with cloud. Using local data.",
        variant: "destructive",
      });
    }
  };

  // Show loading spinner while data is loading
  if (loading) {
    return (
      <div className="flex h-screen overflow-hidden">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your expense data...</p>
          </div>
        </div>
      </div>
    );
  }

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
          onSyncWithAPI={handleSyncWithAPI}
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
