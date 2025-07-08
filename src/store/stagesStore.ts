
import { create } from 'zustand';

export interface Stage {
  id: string;
  title: string;
  order: number;
  isJobberStage?: boolean;
  isImmutable?: boolean;
  timeLimitEnabled: boolean;
  timeLimitDays: number;
  timeLimitHours: number;
}

interface StagesState {
  stages: Stage[];
  updateStages: (stages: Stage[]) => void;
  updateStageTitle: (id: string, title: string) => void;
  updateStageTimeLimit: (id: string, enabled: boolean, days: number, hours: number) => void;
  reorderStages: (reorderedStages: Stage[]) => void;
  addCustomStage: () => void;
  addJobberStage: (title: string) => void;
  deleteStage: (id: string) => void;
  getUsedJobberStages: () => string[];
}

const defaultStages: Stage[] = [
  { 
    id: "new-deals", 
    title: "New Opportunities", 
    order: 1, 
    isImmutable: true,
    timeLimitEnabled: true,
    timeLimitDays: 0,
    timeLimitHours: 3
  },
  { 
    id: "contacted", 
    title: "Contacted", 
    order: 2,
    timeLimitEnabled: true,
    timeLimitDays: 3,
    timeLimitHours: 0
  },
  { 
    id: "draft-quote", 
    title: "Draft Quote", 
    order: 3, 
    isJobberStage: true,
    timeLimitEnabled: true,
    timeLimitDays: 1,
    timeLimitHours: 0
  },
  { 
    id: "quote-awaiting-response", 
    title: "Quote Awaiting Response", 
    order: 4, 
    isJobberStage: true,
    timeLimitEnabled: true,
    timeLimitDays: 7,
    timeLimitHours: 0
  },
  { 
    id: "followup", 
    title: "Followup", 
    order: 5,
    timeLimitEnabled: true,
    timeLimitDays: 7,
    timeLimitHours: 0
  }
];

export const useStagesStore = create<StagesState>((set, get) => ({
  stages: defaultStages,
  updateStages: (stages) => set({ stages }),
  
  updateStageTitle: (id, title) => set((state) => ({
    stages: state.stages.map(stage => {
      if (stage.isImmutable && stage.id === id) {
        console.warn(`Cannot update title of immutable stage: ${id}`);
        return stage;
      }
      return stage.id === id ? { ...stage, title } : stage;
    })
  })),

  updateStageTimeLimit: (id, enabled, days, hours) => set((state) => ({
    stages: state.stages.map(stage => 
      stage.id === id 
        ? { ...stage, timeLimitEnabled: enabled, timeLimitDays: days, timeLimitHours: hours }
        : stage
    )
  })),
  
  reorderStages: (reorderedStages) => {
    const stagesWithUpdatedOrder = reorderedStages.map((stage, index) => {
      if (stage.isImmutable && stage.id === "new-deals") {
        return { ...stage, order: 1 };
      }
      return { ...stage, order: index + 1 };
    });
    
    const sortedStages = stagesWithUpdatedOrder.sort((a, b) => {
      if (a.isImmutable && a.id === "new-deals") return -1;
      if (b.isImmutable && b.id === "new-deals") return 1;
      return a.order - b.order;
    });
    
    set({ stages: sortedStages });
  },
  
  addCustomStage: () => set((state) => {
    const newStageId = `custom-stage-${Date.now()}`;
    const newOrder = Math.max(...state.stages.map(s => s.order)) + 1;
    const newStage: Stage = {
      id: newStageId,
      title: "New Stage",
      order: newOrder,
      timeLimitEnabled: true,
      timeLimitDays: 2,
      timeLimitHours: 0
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
      isJobberStage: true,
      timeLimitEnabled: true,
      timeLimitDays: 2,
      timeLimitHours: 0
    };
    return { stages: [...state.stages, newStage] };
  }),
  
  deleteStage: (id) => set((state) => {
    const stageToDelete = state.stages.find(stage => stage.id === id);
    if (stageToDelete?.isImmutable) {
      console.warn(`Cannot delete immutable stage: ${id}`);
      return state;
    }
    return {
      stages: state.stages.filter(stage => stage.id !== id)
    };
  }),
  
  getUsedJobberStages: () => {
    const stages = get().stages;
    return stages
      .filter(stage => stage.isJobberStage)
      .map(stage => stage.title);
  }
}));
