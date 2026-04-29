import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"

import { cn } from "@/lib/utils"
import { getAvatarInitials } from "@/lib/utils"

const AvatarRoot = React.forwardRef<
  React.ComponentRef<typeof AvatarPrimitive.Root>,
  React.ComponentProps<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    data-slot="avatar"
    className={cn(
      "relative flex size-8 shrink-0 overflow-hidden rounded-full",
      className
    )}
    {...props}
  />
))
AvatarRoot.displayName = AvatarPrimitive.Root.displayName

const AvatarImage = React.forwardRef<
  React.ComponentRef<typeof AvatarPrimitive.Image>,
  React.ComponentProps<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    data-slot="avatar-image"
    className={cn("aspect-square size-full", className)}
    {...props}
  />
))
AvatarImage.displayName = AvatarPrimitive.Image.displayName

const AvatarFallback = React.forwardRef<
  React.ComponentRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentProps<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    data-slot="avatar-fallback"
    className={cn(
      "flex size-full items-center justify-center rounded-full bg-muted text-sm font-medium",
      className
    )}
    {...props}
  />
))
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

// ============================================================
// Convenience wrapper
// ============================================================
interface AvatarProps {
  src?: string | null
  alt?: string
  name?: string
  size?: "xs" | "sm" | "md" | "lg" | "xl"
  className?: string
}

const sizeMap = {
  xs: "size-6 text-[10px]",
  sm: "size-8 text-xs",
  md: "size-10 text-sm",
  lg: "size-12 text-base",
  xl: "size-16 text-lg",
}

function Avatar({ src, alt, name, size = "md", className }: AvatarProps) {
  const initials = name ? getAvatarInitials(name) : "?"
  return (
    <AvatarRoot className={cn(sizeMap[size], className)}>
      {src && <AvatarImage src={src} alt={alt ?? name ?? "Avatar"} />}
      <AvatarFallback delayMs={600}>{initials}</AvatarFallback>
    </AvatarRoot>
  )
}

export { Avatar, AvatarRoot, AvatarImage, AvatarFallback }
