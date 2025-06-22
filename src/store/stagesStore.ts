
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
  updateStageTitle: (id: string, title: string) => void;
  reorderStages: (reorderedStages: Stage[]) => void;
  addCustomStage: () => void;
  addJobberStage: (title: string) => void;
  deleteStage: (id: string) => void;
  getUsedJobberStages: () => string[];
}

const defaultStages: Stage[] = [
  { id: "new-deals", title: "New Deals", order: 1 },
  { id: "contacted", title: "Contacted", order: 2 },
  { id: "draft-quote", title: "Draft Quote", order: 3, isJobberStage: true },
  { id: "quote-awaiting-response", title: "Quote Awaiting Response", order: 4, isJobberStage: true },
  { id: "followup", title: "Followup", order: 5 }
];

export const useStagesStore = create<StagesState>((set, get) => ({
  stages: defaultStages,
  updateStages: (stages) => set({ stages }),
  
  updateStageTitle: (id, title) => set((state) => ({
    stages: state.stages.map(stage => 
      stage.id === id ? { ...stage, title } : stage
    )
  })),
  
  reorderStages: (reorderedStages) => {
    const stagesWithUpdatedOrder = reorderedStages.map((stage, index) => ({
      ...stage,
      order: index + 1
    }));
    set({ stages: stagesWithUpdatedOrder });
  },
  
  addCustomStage: () => set((state) => {
    const newStageId = `custom-stage-${Date.now()}`;
    const newOrder = Math.max(...state.stages.map(s => s.order)) + 1;
    const newStage: Stage = {
      id: newStageId,
      title: "New Stage",
      order: newOrder
    };
    return { stages: [...state.stages, newStage] };
  }),
  
  addJobberStage: (title) => set((state) => {
    const newStageId = `jobber-${title.toLowerCase().replace(/\s+/g, '-')}`;
    const newOrder = Math.max(...state.stages.map(s => s.order)) + 1;
    const newStage: Stage = {
      id: newStageId,
      title,
      order: newOrder,
      isJobberStage: true
    };
    return { stages: [...state.stages, newStage] };
  }),
  
  deleteStage: (id) => set((state) => ({
    stages: state.stages.filter(stage => stage.id !== id)
  })),
  
  getUsedJobberStages: () => {
    const stages = get().stages;
    return stages
      .filter(stage => stage.isJobberStage)
      .map(stage => stage.title);
  }
}));
