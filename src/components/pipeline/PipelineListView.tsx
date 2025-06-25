
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { Deal } from './SalesPipelineData';
import { useSortableTable } from '@/hooks/useSortableTable';
import DealTableRow from './DealTableRow';

interface PipelineListViewProps {
  deals: Deal[];
}

const PipelineListView: React.FC<PipelineListViewProps> = ({ deals }) => {
  const { sortedDeals, sortConfig, handleSort } = useSortableTable(deals);

  const SortButton: React.FC<{ field: string; children: React.ReactNode }> = ({ field, children }) => {
    const isActive = sortConfig.field === field;
    const direction = sortConfig.direction;

    return (
      <Button
        variant="ghost"
        onClick={() => handleSort(field as any)}
        className="h-auto p-0 font-medium hover:bg-transparent justify-start"
      >
        {children}
        <div className="ml-2 flex flex-col">
          <ChevronUp 
            className={`h-3 w-3 ${isActive && direction === 'asc' ? 'text-blue-600' : 'text-gray-400'}`} 
          />
          <ChevronDown 
            className={`h-3 w-3 -mt-1 ${isActive && direction === 'desc' ? 'text-blue-600' : 'text-gray-400'}`} 
          />
        </div>
      </Button>
    );
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">
              <SortButton field="name">Name</SortButton>
            </TableHead>
            <TableHead className="w-[120px]">
              Requests & Quotes
            </TableHead>
            <TableHead>
              <SortButton field="property">Property</SortButton>
            </TableHead>
            <TableHead className="w-[150px]">
              <SortButton field="status">Stage</SortButton>
            </TableHead>
            <TableHead className="w-[120px] text-right">
              <SortButton field="amount">Deal Value</SortButton>
            </TableHead>
            <TableHead className="w-[120px] text-right">
              <SortButton field="requested">Created</SortButton>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedDeals.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                No deals found
              </TableCell>
            </TableRow>
          ) : (
            sortedDeals.map((deal) => (
              <DealTableRow key={deal.id} deal={deal} />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default PipelineListView;
