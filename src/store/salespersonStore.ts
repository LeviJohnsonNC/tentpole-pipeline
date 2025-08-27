import { create } from 'zustand';

export interface Salesperson {
  id: string;
  name: string;
  initials: string;
  color: string;
  avatarUrl?: string;
}

interface SalespersonStore {
  salespeople: Salesperson[];
  getSalespersonByName: (name: string) => Salesperson | undefined;
  getSalespersonById: (id: string) => Salesperson | undefined;
}

const salespeople: Salesperson[] = [
  { id: 'sp-1', name: 'Mike Johnson', initials: 'MJ', color: 'hsl(210, 100%, 50%)' },
  { id: 'sp-2', name: 'Lisa Chen', initials: 'LC', color: 'hsl(340, 100%, 50%)' },
  { id: 'sp-3', name: 'John Smith', initials: 'JS', color: 'hsl(120, 100%, 40%)' },
  { id: 'sp-4', name: 'Sarah Wilson', initials: 'SW', color: 'hsl(280, 100%, 50%)' },
  { id: 'sp-5', name: 'David Rodriguez', initials: 'DR', color: 'hsl(30, 100%, 50%)' },
  { id: 'sp-6', name: 'Emily Zhang', initials: 'EZ', color: 'hsl(180, 100%, 40%)' },
  { id: 'sp-7', name: 'Alex Thompson', initials: 'AT', color: 'hsl(260, 100%, 50%)' },
  { id: 'sp-8', name: 'Maria Santos', initials: 'MS', color: 'hsl(350, 100%, 50%)' },
  { id: 'sp-9', name: 'Chris Anderson', initials: 'CA', color: 'hsl(60, 100%, 45%)' },
  { id: 'sp-10', name: 'Jordan Kim', initials: 'JK', color: 'hsl(300, 100%, 50%)' },
];

export const useSalespersonStore = create<SalespersonStore>(() => ({
  salespeople,
  getSalespersonByName: (name: string) => salespeople.find(s => s.name === name),
  getSalespersonById: (id: string) => salespeople.find(s => s.id === id),
}));