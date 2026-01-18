import { Button } from "./ui/button";
import { Wallet, Users, Receipt, ArrowRight } from "lucide-react";

interface WelcomeScreenProps {
  onCreateGroup: () => void;
  hasGroups: boolean;
  onClearData?: () => void;
}

export function WelcomeScreen({ onCreateGroup, hasGroups, onClearData }: WelcomeScreenProps) {
  return (
    <div className="flex-1 flex items-center justify-center bg-background p-8">
      <div className="max-w-lg text-center animate-in">
        <div className="mb-8 relative">
          <div className="w-24 h-24 mx-auto rounded-2xl gradient-primary flex items-center justify-center shadow-glow">
            <Wallet className="w-12 h-12 text-primary-foreground" />
          </div>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-success text-success-foreground rounded-full text-xs font-semibold shadow-lg">
            Free & Easy
          </div>
        </div>

        <h1 className="text-4xl font-bold text-foreground mb-4">
          {hasGroups ? "Select a Group" : "Welcome to SplitEase"}
        </h1>
        <p className="text-lg text-muted-foreground mb-8">
          {hasGroups
            ? "Choose a group from the sidebar to view balances and expenses, or create a new one."
            : "The simplest way to split expenses with friends, roommates, and colleagues. No more awkward money conversations!"}
        </p>

        {!hasGroups && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="p-4 bg-card rounded-xl border border-border/50 shadow-card">
              <div className="w-10 h-10 mx-auto mb-3 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-sm text-foreground">
                Create Groups
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                For trips, apartments, teams
              </p>
            </div>
            <div className="p-4 bg-card rounded-xl border border-border/50 shadow-card">
              <div className="w-10 h-10 mx-auto mb-3 rounded-lg bg-accent/10 flex items-center justify-center">
                <Receipt className="w-5 h-5 text-accent" />
              </div>
              <h3 className="font-semibold text-sm text-foreground">
                Track Expenses
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Auto-split between members
              </p>
            </div>
            <div className="p-4 bg-card rounded-xl border border-border/50 shadow-card">
              <div className="w-10 h-10 mx-auto mb-3 rounded-lg bg-success/10 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-success" />
              </div>
              <h3 className="font-semibold text-sm text-foreground">
                Settle Up
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                See who owes whom
              </p>
            </div>
          </div>
        )}

        <Button size="lg" onClick={onCreateGroup} className="group mb-2">
          {hasGroups ? "Create Another Group" : "Get Started"}
          <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
        </Button>

        {onClearData && hasGroups && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onClearData}
            className="text-red-600 hover:text-red-700 border-red-300"
          >
            Clear All Data
          </Button>
        )}
      </div>
    </div>
  );
}
