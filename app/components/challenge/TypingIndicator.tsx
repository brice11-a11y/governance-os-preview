'use client'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'

export function TypingIndicator() {
  return (
    <div className="flex gap-2.5 self-start">
      <Avatar size="sm">
        <AvatarFallback>AI</AvatarFallback>
      </Avatar>
      <Card size="sm" className="py-2">
        <CardContent className="flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:0ms]" />
          <span className="size-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:150ms]" />
          <span className="size-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:300ms]" />
        </CardContent>
      </Card>
    </div>
  )
}
