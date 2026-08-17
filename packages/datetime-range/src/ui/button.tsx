import { Button as ButtonPrimitive } from '@base-ui/react/button'
import { cn } from '@/lib/utils'

type ButtonVariant = 'default' | 'outline' | 'secondary' | 'ghost' | 'destructive' | 'link'
type ButtonSize = 'default' | 'xs' | 'sm' | 'lg' | 'icon' | 'icon-xs' | 'icon-sm' | 'icon-lg'

function buttonVariants({
  variant = 'default',
  size = 'default',
  className,
}: {
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string
} = {}) {
  return cn('datetime-range-btn', className, variant && `datetime-range-btn--${variant}`, size && `datetime-range-btn--${size}`)
}

function Button({
  className,
  variant = 'default',
  size = 'default',
  // @base-ui/react's own Button/useButton() already defaults type="button" internally on
  // every path this wraps, so this default is redundant today — kept anyway as a fallback
  // that doesn't depend on that undocumented (type isn't part of the public prop types)
  // upstream behavior continuing to hold across base-ui versions.
  type = 'button',
  ...props
}: ButtonPrimitive.Props & { variant?: ButtonVariant; size?: ButtonSize }) {
  return (
    <ButtonPrimitive
      data-slot="button"
      data-variant={variant}
      data-size={size}
      type={type}
      className={buttonVariants({ variant, size, className: typeof className === 'string' ? className : undefined })}
      {...props}
    />
  )
}

export { Button, buttonVariants }
