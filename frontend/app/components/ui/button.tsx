import * as React from "react"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "outline" | "ghost" | "destructive" | "gradient"
  size?: "default" | "sm" | "lg" | "icon"
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, children, ...props }, ref) => {
    const baseClasses = "inline-flex items-center justify-center rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background transform hover:scale-[1.02] active:scale-[0.98]"
    
    const variants = {
      default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-xl",
      secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-md hover:shadow-lg",
      outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground hover:border-primary/50",
      ghost: "hover:bg-accent hover:text-accent-foreground",
      destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-lg hover:shadow-xl",
      gradient: "bg-gradient-to-r from-primary via-purple-500 to-cyan-500 text-white hover:from-primary/90 hover:via-purple-500/90 hover:to-cyan-500/90 shadow-lg hover:shadow-xl"
    }
    
    const sizes = {
      default: "h-10 py-2 px-4",
      sm: "h-9 px-3",
      lg: "h-12 px-8 text-base",
      icon: "h-10 w-10"
    }
    
    const combinedClassName = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className || ""}`
    
    // If asChild is true, we render the children directly with the className
    // This allows the Button to act as a styling wrapper for other components like Link
    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children, {
        className: `${children.props.className || ''} ${combinedClassName}`.trim(),
        ref,
        // Only pass props that are not specific to the button component
        ...Object.fromEntries(
          Object.entries(props).filter(([key]) => 
            !['variant', 'size', 'asChild'].includes(key)
          )
        )
      })
    }
    
    return (
      <button
        className={combinedClassName}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button }