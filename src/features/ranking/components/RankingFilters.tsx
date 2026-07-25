import { Search } from 'lucide-react';
import { Input, Select } from '@/components/ui';
import type { SelectOption } from '@/components/ui';

interface RankingFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  city: string;
  onCityChange: (value: string) => void;
  club: string;
  onClubChange: (value: string) => void;
  cities: string[];
  clubs: string[];
}

export function RankingFilters({
  search,
  onSearchChange,
  city,
  onCityChange,
  club,
  onClubChange,
  cities,
  clubs,
}: RankingFiltersProps) {
  const cityOptions: SelectOption[] = [
    { value: '', label: 'Todas as cidades' },
    ...cities.map((c) => ({ value: c, label: c })),
  ];

  const clubOptions: SelectOption[] = [
    { value: '', label: 'Todos os clubes' },
    ...clubs.map((c) => ({ value: c, label: c })),
  ];

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:gap-4">
      <div className="flex-1">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted sm:left-3 sm:h-4 sm:w-4" />
          <Input
            placeholder="Buscar..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8 text-[10px] sm:pl-9 sm:text-sm"
          />
        </div>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
        <div className="w-full sm:w-48">
          <Select
            options={cityOptions}
            value={city}
            onChange={(e) => onCityChange(e.target.value)}
            placeholder="Cidade"
          />
        </div>
        <div className="w-full sm:w-48">
          <Select
            options={clubOptions}
            value={club}
            onChange={(e) => onClubChange(e.target.value)}
            placeholder="Clube"
          />
        </div>
      </div>
    </div>
  );
}
