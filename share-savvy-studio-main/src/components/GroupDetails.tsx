import { Group, Balance, Expense, Member } from "@/types/expense";
import { BalanceCard } from "./BalanceCard";
import { ExpenseItem } from "./ExpenseItem";
import { Avatar } from "./Avatar";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Plus,
  Settings,
  Receipt,
  Scale,
  TrendingUp,
  Users,
  Calendar,
} from "lucide-react";
import { format } from "date-fns";

interface GroupDetailsProps {
  group: Group;
  balances: Balance[];
  totalAmount: number;
  onAddExpense: () => void;
  onManageMembers: () => void;
  onDeleteExpense: (expenseId: string) => void;
}

export function GroupDetails({
  group,
  balances,
  totalAmount,
  onAddExpense,
  onManageMembers,
  onDeleteExpense,
}: GroupDetailsProps) {
  return (
    <div className="flex-1 bg-background overflow-y-auto">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="flex -space-x-2">
                {group.members.slice(0, 4).map((member) => (
                  <Avatar key={member.id} name={member.name} size="lg" />
                ))}
                {group.members.length > 4 && (
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-sm font-medium text-muted-foreground border-2 border-background">
                    +{group.members.length - 4}
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  {group.name}
                </h1>
                <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {group.members.length} members
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Created {format(new Date(group.createdAt), "MMM d, yyyy")}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={onManageMembers}>
                <Settings className="w-4 h-4 mr-2" />
                Manage
              </Button>
              <Button size="sm" onClick={onAddExpense}>
                <Plus className="w-4 h-4 mr-2" />
                Add Expense
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-card rounded-xl p-5 shadow-card border border-border/50 animate-in">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-primary/10">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Expenses</p>
                <p className="text-2xl font-bold text-foreground">
                  ₹{totalAmount.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl p-5 shadow-card border border-border/50 animate-in">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-accent/10">
                <Receipt className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Transactions</p>
                <p className="text-2xl font-bold text-foreground">
                  {group.expenses.length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl p-5 shadow-card border border-border/50 animate-in">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-success/10">
                <Scale className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Settlements</p>
                <p className="text-2xl font-bold text-foreground">
                  {balances.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="balances" className="space-y-6">
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="balances" className="flex items-center gap-2">
              <Scale className="w-4 h-4" />
              Balances
            </TabsTrigger>
            <TabsTrigger value="expenses" className="flex items-center gap-2">
              <Receipt className="w-4 h-4" />
              Expenses
            </TabsTrigger>
          </TabsList>

          <TabsContent value="balances" className="space-y-4">
            {balances.length === 0 ? (
              <div className="text-center py-12 bg-card rounded-xl border border-border/50">
                <Scale className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  All Settled Up!
                </h3>
                <p className="text-muted-foreground">
                  No pending balances in this group.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {balances.map((balance, index) => (
                  <BalanceCard
                    key={index}
                    balance={balance}
                    members={group.members}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="expenses" className="space-y-4">
            {group.expenses.length === 0 ? (
              <div className="text-center py-12 bg-card rounded-xl border border-border/50">
                <Receipt className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No Expenses Yet
                </h3>
                <p className="text-muted-foreground mb-4">
                  Add your first expense to get started.
                </p>
                <Button onClick={onAddExpense}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Expense
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {[...group.expenses]
                  .sort(
                    (a, b) =>
                      new Date(b.createdAt).getTime() -
                      new Date(a.createdAt).getTime()
                  )
                  .map((expense) => (
                    <ExpenseItem
                      key={expense.id}
                      expense={expense}
                      members={group.members}
                      onDelete={() => onDeleteExpense(expense.id)}
                    />
                  ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
