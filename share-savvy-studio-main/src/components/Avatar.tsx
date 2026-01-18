import { cn } from "@/lib/utils";

interface AvatarProps {
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const getInitials = (name: string) => {
  const parts = name.split(" ");
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

const getColorFromName = (name: string) => {
  const colors = [
    "bg-primary",
    "bg-accent",
    "bg-success",
    "bg-warning",
    "from-primary to-accent",
    "from-accent to-success",
    "from-success to-primary",
  ];
  const index = name.charCodeAt(0) % colors.length;
  const color = colors[index];
  return color.includes("from-") ? `bg-gradient-to-br ${color}` : color;
};

const sizeClasses = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-12 h-12 text-base",
};

export function Avatar({ name, size = "md", className }: AvatarProps) {
  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-semibold text-primary-foreground shadow-sm",
        getColorFromName(name),
        sizeClasses[size],
        className
      )}
    >
      {getInitials(name)}
    </div>
  );
}
