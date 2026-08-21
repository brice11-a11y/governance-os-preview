'use client'

import * as React from 'react'
import { Checkbox as CheckboxPrimitive } from '@base-ui/react/checkbox'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

function Checkbox({ className, ...props }: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      className={cn(
        'flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border border-outline-variant bg-white outline-none transition-colors data-[checked]:border-primary data-[checked]:bg-primary focus-visible:ring-2 focus-visible:ring-primary/30',
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator className="text-white">
        <Check className="h-3 w-3" strokeWidth={3} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
