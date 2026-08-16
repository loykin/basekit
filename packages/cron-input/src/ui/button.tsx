import { Button as ButtonPrimitive } from '@base-ui/react/button'
import { cn } from '@/lib/utils'

type ButtonVariant = 'default' | 'outline' | 'ghost'
type ButtonSize    = 'default' | 'sm'

function Button({
  className,
  variant = 'default',
  size = 'default',
  ...props
}: ButtonPrimitive.Props & { variant?: ButtonVariant; size?: ButtonSize }) {
  return (
    <ButtonPrimitive
      data-variant={variant}
      data-size={size}
      className={cn('cron-input-btn', className)}
      {...props}
    />
  )
}

export { Button }
