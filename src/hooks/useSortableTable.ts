
import { useState, useMemo } from 'react';
import { Deal } from '@/components/pipeline/SalesPipelineData';

type SortField = 'title' | 'name' | 'property' | 'status' | 'amount' | 'requested';
type SortDirection = 'asc' | 'desc';

interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

export const useSortableTable = (deals: Deal[]) => {
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: 'requested',
    direction: 'desc'
  });

  const sortedDeals = useMemo(() => {
    return [...deals].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortConfig.field) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'name':
          aValue = a.client.toLowerCase();
          bValue = b.client.toLowerCase();
          break;
        case 'property':
          aValue = a.property.toLowerCase();
          bValue = b.property.toLowerCase();
          break;
        case 'status':
          aValue = a.status.toLowerCase();
          bValue = b.status.toLowerCase();
          break;
        case 'amount':
          aValue = a.amount || 0;
          bValue = b.amount || 0;
          break;
        case 'requested':
          aValue = new Date(a.requested);
          bValue = new Date(b.requested);
          break;
        default:
          return 0;
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [deals, sortConfig]);

  const handleSort = (field: SortField) => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  return {
    sortedDeals,
    sortConfig,
    handleSort
  };
};
