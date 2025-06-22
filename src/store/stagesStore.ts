
import { create } from 'zustand';

export interface Stage {
  id: string;
  title: string;
  order: number;
  isJobberStage?: boolean;
}

interface StagesState {
  stages: Stage[];
  updateStages: (stages: Stage[]) => void;
}

const defaultStages: Stage[] = [
  { id: "new-deals", title: "New Deals", order: 1 },
  { id: "contacted", title: "Contacted", order: 2 },
  { id: "draft-quote", title: "Draft Quote", order: 3, isJobberStage: true },
  { id: "quote-awaiting-response", title: "Quote Awaiting Response", order: 4, isJobberStage: true },
  { id: "followup", title: "Followup", order: 5 }
];

export const useStagesStore = create<StagesState>((set) => ({
  stages: defaultStages,
  updateStages: (stages) => set({ stages }),
}));
