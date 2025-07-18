
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ManualMovement {
  fromStage: string;
  toStage: string;
  timestamp: string;
}

interface ManualMovementStore {
  manuallyMovedDeals: Map<string, ManualMovement>;
  addManualMovement: (dealId: string, fromStage: string, toStage: string) => void;
  isManuallyMoved: (dealId: string) => boolean;
  getManualMovement: (dealId: string) => ManualMovement | undefined;
  clearManualMovement: (dealId: string) => void;
  clearAllManualMovements: () => void;
}

export const useManualMovementStore = create<ManualMovementStore>()(
  persist(
    (set, get) => ({
      manuallyMovedDeals: new Map(),

      addManualMovement: (dealId: string, fromStage: string, toStage: string) => {
        console.log(`📝 MANUAL MOVEMENT: Tracking deal ${dealId} moved from ${fromStage} to ${toStage}`);
        set((state) => {
          const newMap = new Map(state.manuallyMovedDeals);
          newMap.set(dealId, {
            fromStage,
            toStage,
            timestamp: new Date().toISOString()
          });
          return { manuallyMovedDeals: newMap };
        });
      },

      isManuallyMoved: (dealId: string) => {
        const isManual = get().manuallyMovedDeals.has(dealId);
        console.log(`🔍 MANUAL CHECK: Deal ${dealId} is manually moved: ${isManual}`);
        return isManual;
      },

      getManualMovement: (dealId: string) => {
        return get().manuallyMovedDeals.get(dealId);
      },

      clearManualMovement: (dealId: string) => {
        console.log(`🧹 MANUAL CLEAR: Clearing manual movement for deal ${dealId}`);
        set((state) => {
          const newMap = new Map(state.manuallyMovedDeals);
          newMap.delete(dealId);
          return { manuallyMovedDeals: newMap };
        });
      },

      clearAllManualMovements: () => {
        console.log(`🧹 MANUAL CLEAR ALL: Clearing all manual movements`);
        set({ manuallyMovedDeals: new Map() });
      }
    }),
    {
      name: 'manual-movement-store',
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          const parsed = JSON.parse(str);
          return {
            ...parsed,
            state: {
              ...parsed.state,
              manuallyMovedDeals: new Map(parsed.state.manuallyMovedDeals || [])
            }
          };
        },
        setItem: (name, value) => {
          const str = JSON.stringify({
            ...value,
            state: {
              ...value.state,
              manuallyMovedDeals: Array.from(value.state.manuallyMovedDeals.entries())
            }
          });
          localStorage.setItem(name, str);
        },
        removeItem: (name) => localStorage.removeItem(name)
      }
    }
  )
);
