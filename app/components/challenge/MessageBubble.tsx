'use client'

import type { Message } from '@/types'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

function renderMarkdown(text: string) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code class="bg-muted text-foreground px-1.5 py-0.5 rounded text-[0.85em] font-mono">$1</code>')
    .replace(/^> (.+)$/gm, '<blockquote class="border-l-2 border-border pl-3 text-muted-foreground italic my-1">$1</blockquote>')
    .replace(/\n/g, '<br />')
}

interface MessageBubbleProps {
  message: Message
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isAssistant = message.role === 'assistant'

  return (
    <div className={cn('flex gap-2.5 max-w-[80%]', isAssistant ? 'self-start' : 'self-end flex-row-reverse')}>
      {isAssistant && (
        <Avatar size="sm">
          <AvatarFallback>AI</AvatarFallback>
        </Avatar>
      )}
      <Card
        size="sm"
        className={cn(
          'py-2.5',
          isAssistant ? 'bg-card' : 'bg-primary text-primary-foreground ring-0',
        )}
      >
        <CardContent
          className="text-sm leading-relaxed"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(message.content) }}
        />
      </Card>
    </div>
  )
}
