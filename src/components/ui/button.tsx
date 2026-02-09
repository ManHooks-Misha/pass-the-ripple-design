import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-bold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md hover:shadow-lg hover:brightness-110 [&>*]:text-white",
        destructive:
          "bg-gradient-to-r from-red-500 to-red-600 text-white hover:brightness-110 [&>*]:text-white",
        outline:
          "border-2 border-purple-500 bg-white text-purple-600 shadow-sm hover:bg-purple-50 [&>*]:text-purple-600",
        secondary:
          "bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:brightness-110 shadow-md [&>*]:text-white",
        ghost: "hover:bg-purple-100 text-gray-700 [&>*]:text-gray-700",
        link: "text-purple-600 underline-offset-4 hover:underline [&>*]:text-purple-600",
        hero: "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg hover:shadow-xl hover:scale-105 [&>*]:text-white",
        glow: "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg hover:brightness-110 [&>*]:text-white",
        gradient: "bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold hover:shadow-lg hover:brightness-110 [&>*]:text-white",
        magical: "bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 text-white font-bold shadow-lg hover:brightness-110 hover:scale-105 [&>*]:text-white",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        xl: "h-12 rounded-lg px-10 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
