
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
  addCustomStage: () => void;
  addJobberStage: (title: string) => void;
}

const defaultStages: Stage[] = [
  { id: "new-deals", title: "New Deals", order: 0 },
  { id: "contacted", title: "Contacted", order: 1 },
  { id: "quote-sent", title: "Quote Sent", order: 2 },
  { id: "followup", title: "Followup", order: 3 }
];

const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};

export const useStagesStore = create<StagesStore>((set, get) => ({
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
  addCustomStage: () =>
    set((state) => {
      const maxOrder = Math.max(...state.stages.map(s => s.order));
      const newStage: Stage = {
        id: generateId(),
        title: "",
        order: maxOrder + 1
      };
      return {
        stages: [...state.stages, newStage]
      };
    }),
  addJobberStage: (title) =>
    set((state) => {
      const maxOrder = Math.max(...state.stages.map(s => s.order));
      const newStage: Stage = {
        id: generateId(),
        title,
        order: maxOrder + 1
      };
      return {
        stages: [...state.stages, newStage]
      };
    }),
}));
