
import { create } from 'zustand';

export interface Stage {
  id: string;
  title: string;
  order: number;
}

interface StagesStore {
  stages: Stage[];
  updateStageTitle: (id: string, title: string) => void;
  reorderStages: (stages: Stage[]) => void;
}

const defaultStages: Stage[] = [
  { id: "new-deals", title: "New Deals", order: 0 },
  { id: "contacted", title: "Contacted", order: 1 },
  { id: "quote-sent", title: "Quote Sent", order: 2 },
  { id: "followup", title: "Followup", order: 3 }
];

export const useStagesStore = create<StagesStore>((set) => ({
  stages: defaultStages,
  updateStageTitle: (id, title) =>
    set((state) => ({
      stages: state.stages.map((stage) =>
        stage.id === id ? { ...stage, title } : stage
      ),
    })),
  reorderStages: (stages) =>
    set(() => ({
      stages: stages.map((stage, index) => ({ ...stage, order: index })),
    })),
}));
