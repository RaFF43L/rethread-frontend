import { Smile } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-20 px-4",
        "animate-in fade-in slide-in-from-bottom-4 duration-700",
        className
      )}
    >
      <div className="mb-6 animate-in zoom-in duration-500 delay-200">
        {icon || (
          <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center">
            <Smile className="w-10 h-10 text-muted-foreground" />
          </div>
        )}
      </div>
      
      <h3 className="text-xl font-semibold text-foreground mb-2 text-center animate-in fade-in duration-500 delay-300">
        {title}
      </h3>
      
      {description && (
        <p className="text-muted-foreground text-center max-w-md mb-6 animate-in fade-in duration-500 delay-400">
          {description}
        </p>
      )}
      
      {action && (
        <div className="animate-in fade-in duration-500 delay-500">
          {action}
        </div>
      )}
    </div>
  );
}
