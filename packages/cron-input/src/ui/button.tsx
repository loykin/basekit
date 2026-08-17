import { Button as ButtonPrimitive } from '@base-ui/react/button'
import { cn } from '@/lib/utils'

type ButtonVariant = 'default' | 'outline' | 'ghost'
type ButtonSize    = 'default' | 'sm'

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
      data-variant={variant}
      data-size={size}
      type={type}
      className={cn('cron-input-btn', className)}
      {...props}
    />
  )
}

export { Button }
