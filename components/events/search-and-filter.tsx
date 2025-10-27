'use client'

import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search } from 'lucide-react'

interface SearchAndFilterProps {
  search: string
  sportType: string
  onSearchChange: (value: string) => void
  onSportTypeChange: (value: string) => void
}

export function SearchAndFilter({
  search,
  sportType,
  onSearchChange,
  onSportTypeChange,
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
  ]

  return (
    <div className="flex gap-4">
      {/* Search */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#717182]" />
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

