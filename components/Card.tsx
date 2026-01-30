import * as React from "react"
import { 
  Card as ShadcnCard, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent,
  CardFooter,
  CardAction
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

type CardProps = {
  children?: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  size?: "default" | "sm";
} & Omit<React.HTMLAttributes<HTMLDivElement>, 'title'>;

export function Card({ 
  children, 
  className, 
  title, 
  description, 
  action,
  size,
  ...props 
}: CardProps) {
  return (
    <ShadcnCard 
      className={cn(
        "bg-card border-border text-card-foreground",
        className
      )} 
      size={size}
      {...props}
    >
      {(title || action) && (
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              {title && <CardTitle className="text-xl">{title}</CardTitle>}
              {description && <CardDescription className="mt-2">{description}</CardDescription>}
            </div>
            {action && <CardAction>{action}</CardAction>}
          </div>
        </CardHeader>
      )}
      <CardContent>
        {children}
      </CardContent>
    </ShadcnCard>
  )
}

// Re-export the original shadcn Card components for direct use
export { 
  ShadcnCard as BaseCard,
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent,
  CardFooter,
  CardAction
}
