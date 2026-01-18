import { Expense, Member } from "@/types/expense";
import { Avatar } from "./Avatar";
import { Receipt, Trash2, Users } from "lucide-react";
import { Button } from "./ui/button";
import { format } from "date-fns";

interface ExpenseItemProps {
  expense: Expense;
  members: Member[];
  onDelete: () => void;
}

export function ExpenseItem({ expense, members, onDelete }: ExpenseItemProps) {
  const paidByMember = members.find((m) => m.id === expense.paidBy);
  const splitMembers = members.filter((m) =>
    expense.splitBetween.includes(m.id)
  );
  const perPerson = expense.amount / expense.splitBetween.length;

  return (
    <div className="group p-4 bg-card rounded-xl shadow-card border border-border/50 hover:shadow-card-hover transition-shadow duration-200 animate-slide-in">
      <div className="flex items-start gap-4">
        <div className="p-2.5 rounded-xl bg-primary/10">
          <Receipt className="w-5 h-5 text-primary" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="font-semibold text-foreground">
                {expense.description}
              </h4>
              <p className="text-sm text-muted-foreground mt-0.5">
                {format(new Date(expense.createdAt), "MMM d, yyyy")}
              </p>
            </div>
            <div className="text-right">
              <p className="font-bold text-lg text-foreground">
                ₹{expense.amount.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">
                ₹{perPerson.toLocaleString()} each
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
            <div className="flex items-center gap-2">
              {paidByMember && (
                <>
                  <Avatar name={paidByMember.name} size="sm" />
                  <span className="text-sm text-foreground">
                    <span className="font-medium">{paidByMember.name}</span>
                    <span className="text-muted-foreground"> paid</span>
                  </span>
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>Split between {splitMembers.length}</span>
              </div>
              <div className="flex -space-x-1.5">
                {splitMembers.slice(0, 4).map((member) => (
                  <Avatar key={member.id} name={member.name} size="sm" />
                ))}
                {splitMembers.length > 4 && (
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground border-2 border-card">
                    +{splitMembers.length - 4}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
          onClick={onDelete}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
