'use client'

import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { Search } from 'lucide-react'

interface SearchAndFilterProps {
  search: string
  sportType: string
  onSearchChange: (value: string) => void
  onSportTypeChange: (value: string) => void
  isLoading?: boolean
}

export function SearchAndFilter({
  search,
  sportType,
  onSearchChange,
  onSportTypeChange,
  isLoading = false,
}: SearchAndFilterProps) {
  const sports = [
    { value: 'all', label: 'All Sports' },
    { value: 'soccer', label: 'Soccer' },
    { value: 'basketball', label: 'Basketball' },
    { value: 'tennis', label: 'Tennis' },
    { value: 'football', label: 'Football' },
    { value: 'baseball', label: 'Baseball' },
    { value: 'volleyball', label: 'Volleyball' },
    { value: 'hockey', label: 'Hockey' },
    { value: 'cricket', label: 'Cricket' },
    { value: 'rugby', label: 'Rugby' },
    { value: 'golf', label: 'Golf' },
    { value: 'other', label: 'Other' },
  ]

  return (
    <div className="flex gap-4">
      {/* Search */}
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#717182]" />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Spinner className="size-4 text-[#717182]" />
          </div>
        )}
        <Input
          type="text"
          placeholder="Search events by name..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 h-9 bg-[#f3f3f5] border-0"
          />
      </div>

      {/* Filter */}
      <Select value={sportType} onValueChange={onSportTypeChange}>
        <SelectTrigger className="w-[200px] h-9 bg-[#f3f3f5] border-0">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {sports.map((sport) => (
            <SelectItem key={sport.value} value={sport.value}>
              {sport.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

