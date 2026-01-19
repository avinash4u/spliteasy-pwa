import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { GroupSidebar } from "@/components/GroupSidebar";
import { GroupDetails } from "@/components/GroupDetails";
import { WelcomeScreen } from "@/components/WelcomeScreen";
import { CreateGroupModal } from "@/components/CreateGroupModal";
import { AddExpenseModal } from "@/components/AddExpenseModal";
import { ManageMembersModal } from "@/components/ManageMembersModal";
import { useExpenseStore } from "@/hooks/useExpenseStore";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User } from "lucide-react";

const Index = () => {
  const { toast } = useToast();
  const { userProfile, signOut } = useAuth();
  const {
    groups,
    selectedGroup,
    selectedGroupId,
    selectedGroupExpenses,
    selectedGroupMembers,
    setSelectedGroupId,
    createGroup,
    addMember,
    removeMember,
    addExpense,
    deleteExpense,
    calculateBalances,
    getGroupTotal,
    loading,
    error,
    clearError,
  } = useExpenseStore();

  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showManageMembers, setShowManageMembers] = useState(false);

  const balances = selectedGroup ? calculateBalances(selectedGroup.id) : [];

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

  const handleAddExpense = async (expense: any) => {
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
      const member = selectedGroupMembers.find((m) => m.id === memberId);
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

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed Out",
        description: "You have been signed out successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your expense data...</p>
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
        getGroupTotal={(group) => getGroupTotal(group.id)}
      />
      
      <div className="flex-1 flex flex-col">
        {/* Header with user info */}
        <div className="border-b bg-white p-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold">
            {selectedGroup ? selectedGroup.name : "SplitEasy"}
          </h1>
          
          {userProfile && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={userProfile.photoURL} alt={userProfile.name} />
                    <AvatarFallback>
                      {userProfile.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    {userProfile.name && (
                      <p className="font-medium">{userProfile.name}</p>
                    )}
                    {userProfile.email && (
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {userProfile.email}
                      </p>
                    )}
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-auto">
          {selectedGroup ? (
            <GroupDetails
              group={selectedGroup}
              expenses={selectedGroupExpenses}
              members={selectedGroupMembers}
              balances={balances}
              totalAmount={getGroupTotal(selectedGroup.id)}
              onAddExpense={() => setShowAddExpense(true)}
              onManageMembers={() => setShowManageMembers(true)}
              onDeleteExpense={handleDeleteExpense}
            />
          ) : (
            <WelcomeScreen
              hasGroups={groups.length > 0}
              onCreateGroup={() => setShowCreateGroup(true)}
              onClearData={() => {}} // No clear data needed with Firestore
            />
          )}
        </div>
      </div>

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
            onAdd={handleAddExpense}
            members={selectedGroupMembers}
          />
          <ManageMembersModal
            isOpen={showManageMembers}
            onClose={() => setShowManageMembers(false)}
            members={selectedGroupMembers}
            onAddMember={handleAddMember}
            onRemoveMember={handleRemoveMember}
          />
        </>
      )}
    </div>
  );
};

export default Index;
