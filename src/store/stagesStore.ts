import { create } from 'zustand';

export interface Stage {
  id: string;
  title: string;
  order: number;
  isJobberStage?: boolean;
  isImmutable?: boolean; // New field to mark stages that cannot be modified
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
  { id: "new-deals", title: "New Lead", order: 1, isImmutable: true }, // Made immutable
  { id: "contacted", title: "Contacted", order: 2 },
  { id: "draft-quote", title: "Draft Quote", order: 3, isJobberStage: true },
  { id: "quote-awaiting-response", title: "Quote Awaiting Response", order: 4, isJobberStage: true },
  { id: "followup", title: "Followup", order: 5 }
];

export const useStagesStore = create<StagesState>((set, get) => ({
  stages: defaultStages,
  updateStages: (stages) => set({ stages }),
  
  updateStageTitle: (id, title) => set((state) => ({
    stages: state.stages.map(stage => {
      // Prevent updating immutable stages
      if (stage.isImmutable && stage.id === id) {
        console.warn(`Cannot update title of immutable stage: ${id}`);
        return stage;
      }
      return stage.id === id ? { ...stage, title } : stage;
    })
  })),
  
  reorderStages: (reorderedStages) => {
    // Ensure immutable stages maintain their position
    const stagesWithUpdatedOrder = reorderedStages.map((stage, index) => {
      if (stage.isImmutable && stage.id === "new-deals") {
        // Keep "New Lead" at position 1
        return { ...stage, order: 1 };
      }
      return { ...stage, order: index + 1 };
    });
    
    // Sort to ensure "New Lead" is always first
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
  
  deleteStage: (id) => set((state) => {
    // Prevent deletion of immutable stages
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
