import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-[14px] border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all duration-150 outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-xs shadow-primary/20 hover:bg-primary/90 hover:shadow-md hover:shadow-primary/25",
        outline:
          "border-border/90 bg-card text-foreground shadow-2xs hover:bg-muted/80 hover:text-foreground hover:border-border dark:border-white/10 dark:bg-card dark:hover:bg-muted/50",
        secondary:
          "bg-secondary text-secondary-foreground shadow-2xs hover:bg-secondary/80",
        ghost:
          "hover:bg-muted/70 hover:text-foreground text-muted-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-white/5",
        destructive:
          "bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9.5 gap-2 px-3.5 text-sm",
        xs: "h-7 gap-1 rounded-[10px] px-2 text-xs [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1.5 rounded-[12px] px-2.5 text-xs [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-11 gap-2.5 rounded-[14px] px-5 text-sm font-semibold shadow-xs shadow-primary/20",
        icon: "size-9.5 rounded-[14px]",
        "icon-xs": "size-7 rounded-[10px] [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8 rounded-[12px] [&_svg:not([class*='size-'])]:size-3.5",
        "icon-lg": "size-11 rounded-[14px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  nativeButton,
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      nativeButton={nativeButton ?? !props.render}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
