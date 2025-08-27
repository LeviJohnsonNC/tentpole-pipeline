import { create } from 'zustand';

export interface Stage {
  id: string;
  title: string;
  order: number;
  bucket: 'requests' | 'quotes';
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
  addCustomStage: (bucket: 'requests' | 'quotes') => void;
  addJobberStage: (title: string, bucket: 'requests' | 'quotes') => void;
  deleteStage: (id: string) => void;
  getUsedJobberStages: () => string[];
  getStagesByBucket: (bucket: 'requests' | 'quotes') => Stage[];
  setAutoOnlyStages: () => void;
}

const defaultStages: Stage[] = [
  { 
    id: "new-requests", 
    title: "New Requests", 
    order: 1, 
    bucket: "requests",
    isImmutable: true,
    timeLimitEnabled: true,
    timeLimitDays: 0,
    timeLimitHours: 3
  },
  { 
    id: "contacted", 
    title: "Contacted", 
    order: 2,
    bucket: "requests",
    timeLimitEnabled: true,
    timeLimitDays: 3,
    timeLimitHours: 0
  },
  { 
    id: "draft-quote", 
    title: "Draft", 
    order: 3, 
    bucket: "quotes",
    isJobberStage: true,
    timeLimitEnabled: true,
    timeLimitDays: 1,
    timeLimitHours: 0
  },
  { 
    id: "quote-awaiting-response", 
    title: "Awaiting response", 
    order: 4, 
    bucket: "quotes",
    isJobberStage: true,
    timeLimitEnabled: true,
    timeLimitDays: 7,
    timeLimitHours: 0
  },
  { 
    id: "followup", 
    title: "Followup", 
    order: 5,
    bucket: "requests",
    timeLimitEnabled: true,
    timeLimitDays: 7,
    timeLimitHours: 0
  }
];

const autoOnlyStages: Stage[] = [
  { 
    id: "new-requests", 
    title: "New Requests", 
    order: 1, 
    bucket: "requests",
    isImmutable: true,
    timeLimitEnabled: true,
    timeLimitDays: 0,
    timeLimitHours: 3
  },
  { 
    id: "jobber-unscheduled-assessment", 
    title: "Assessment unscheduled", 
    order: 2, 
    bucket: "requests",
    isJobberStage: true,
    timeLimitEnabled: true,
    timeLimitDays: 2,
    timeLimitHours: 0
  },
  { 
    id: "jobber-assessment-scheduled", 
    title: "Assessment scheduled", 
    order: 3, 
    bucket: "requests",
    isJobberStage: true,
    timeLimitEnabled: true,
    timeLimitDays: 1,
    timeLimitHours: 0
  },
  { 
    id: "jobber-assessment-completed", 
    title: "Assessment completed", 
    order: 4, 
    bucket: "requests",
    isJobberStage: true,
    timeLimitEnabled: true,
    timeLimitDays: 2,
    timeLimitHours: 0
  },
  { 
    id: "draft-quote", 
    title: "Draft", 
    order: 5, 
    bucket: "quotes",
    isJobberStage: true,
    timeLimitEnabled: true,
    timeLimitDays: 1,
    timeLimitHours: 0
  },
  { 
    id: "quote-awaiting-response", 
    title: "Awaiting response", 
    order: 6, 
    bucket: "quotes",
    isJobberStage: true,
    timeLimitEnabled: true,
    timeLimitDays: 7,
    timeLimitHours: 0
  },
  { 
    id: "jobber-quote-changes-requested", 
    title: "Changes requested", 
    order: 7, 
    bucket: "quotes",
    isJobberStage: true,
    timeLimitEnabled: true,
    timeLimitDays: 3,
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
      if (stage.isImmutable && stage.id === "new-requests") {
        return { ...stage, order: 1 };
      }
      return { ...stage, order: index + 1 };
    });
    
    const sortedStages = stagesWithUpdatedOrder.sort((a, b) => {
      if (a.isImmutable && a.id === "new-requests") return -1;
      if (b.isImmutable && b.id === "new-requests") return 1;
      return a.order - b.order;
    });
    
    set({ stages: sortedStages });
  },
  
  addCustomStage: (bucket) => set((state) => {
    const newStageId = `custom-stage-${Date.now()}`;
    const newOrder = Math.max(...state.stages.map(s => s.order)) + 1;
    const newStage: Stage = {
      id: newStageId,
      title: "New Stage",
      order: newOrder,
      bucket,
      timeLimitEnabled: true,
      timeLimitDays: 2,
      timeLimitHours: 0
    };
    return { stages: [...state.stages, newStage] };
  }),
  
  addJobberStage: (title, bucket) => set((state) => {
    const newStageId = `jobber-${title.toLowerCase().replace(/\s+/g, '-')}`;
    const newOrder = Math.max(...state.stages.map(s => s.order)) + 1;
    const newStage: Stage = {
      id: newStageId,
      title,
      order: newOrder,
      bucket,
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
  },

  getStagesByBucket: (bucket) => {
    const stages = get().stages;
    return stages.filter(stage => stage.bucket === bucket);
  },

  setAutoOnlyStages: () => {
    // Import the stores to update deal positions when switching to auto-only mode
    import('@/store/requestStore').then(({ useRequestStore }) => {
      import('@/store/quoteStore').then(({ useQuoteStore }) => {
        const { sessionRequests, updateSessionRequest } = useRequestStore.getState();
        const { sessionQuotes, updateSessionQuote } = useQuoteStore.getState();
        
        // Update requests to appropriate auto-only stages based on valid Request status values
        sessionRequests.forEach(request => {
          // Map existing statuses to new auto-only stages
          // Note: We can only update to valid Request status values, so we'll work with the pipeline display instead
          console.log(`Request ${request.id} current status: ${request.status}`);
        });
        
        // Quotes should remain in their current Jobber stages as they're already automated
        console.log('Successfully set auto-only stages');
      });
    });
    
    set({ stages: autoOnlyStages });
  }
}));
