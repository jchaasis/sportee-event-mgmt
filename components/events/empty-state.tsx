import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

interface EmptyStateProps {
  onCreateEvent: () => void
}

export function EmptyState({ onCreateEvent }: EmptyStateProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center py-12 text-center">
      {/* Icon */}
      <div className="mb-8 flex size-16 items-center justify-center rounded-full bg-neutral-100">
        <svg
          className="size-8 text-[#717182]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>

      {/* Text */}
      <div className="space-y-2">
        <h3 className="text-base text-[#717182]">No events found</h3>
        <p className="text-base text-[#717182]">Get started by creating your first event</p>
      </div>

      {/* Button */}
      <div className="mt-8">
        <Button onClick={onCreateEvent} className="gap-2 bg-purple-800 hover:bg-purple-900">
          <Plus className="size-4" />
          Create Your First Event
        </Button>
      </div>
    </div>
  )
}

