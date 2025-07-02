
import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useStagesStore, Stage } from "@/store/stagesStore";
import { toast } from "sonner";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import StageCard from "@/components/stages/StageCard";
import Sidebar from "@/components/Sidebar";
import JobberStageSelector from "@/components/stages/JobberStageSelector";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useResponsiveColumns } from "@/hooks/useResponsiveColumns";

const EditStages = () => {
  const navigate = useNavigate();
  const {
    stages,
    updateStageTitle,
    updateStageTimeLimit,
    reorderStages,
    addCustomStage,
    addJobberStage,
    deleteStage
  } = useStagesStore();
  const [localStages, setLocalStages] = useState<Stage[]>(stages);
  const [showJobberSelector, setShowJobberSelector] = useState(false);

  // Responsive columns setup - updated for taller cards
  const containerRef = useRef<HTMLDivElement>(null);
  const { columnWidth, shouldUseHorizontalScroll } = useResponsiveColumns({
    containerRef,
    columnCount: stages.length,
    minColumnWidth: 200,
    maxColumnWidth: 320,
    columnGap: 16,
    padding: 48
  });

  useEffect(() => {
    setLocalStages(stages);
  }, [stages]);

  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, {
    coordinateGetter: sortableKeyboardCoordinates
  }));

  const handleDragEnd = (event: DragEndEvent) => {
    const {
      active,
      over
    } = event;
    if (over && active.id !== over.id) {
      const oldIndex = localStages.findIndex(stage => stage.id === active.id);
      const newIndex = localStages.findIndex(stage => stage.id === over.id);

      const activeStage = localStages[oldIndex];
      if (activeStage?.isImmutable) {
        toast.error("Cannot reorder locked stages");
        return;
      }

      const hasImmutableFirst = localStages.some(stage => stage.isImmutable && stage.id === "new-deals");
      if (hasImmutableFirst && newIndex === 0) {
        toast.error("Cannot move stages before the locked 'New Lead' stage");
        return;
      }
      const newStages = arrayMove(localStages, oldIndex, newIndex);
      setLocalStages(newStages);
      reorderStages(newStages);
    }
  };

  const handleTitleChange = (id: string, title: string) => {
    const stage = localStages.find(s => s.id === id);
    if (stage?.isImmutable) {
      toast.error("Cannot edit locked stage titles");
      return;
    }
    setLocalStages(prev => prev.map(stage => stage.id === id ? {
      ...stage,
      title
    } : stage));
    updateStageTitle(id, title);
  };

  const handleTimeLimitChange = (id: string, enabled: boolean, days: number, hours: number) => {
    setLocalStages(prev => prev.map(stage => 
      stage.id === id 
        ? { ...stage, timeLimitEnabled: enabled, timeLimitDays: days, timeLimitHours: hours }
        : stage
    ));
    updateStageTimeLimit(id, enabled, days, hours);
  };

  const handleDelete = (id: string) => {
    const stage = localStages.find(s => s.id === id);
    if (stage?.isImmutable) {
      toast.error("Cannot delete locked stages");
      return;
    }
    deleteStage(id);
    toast.success("Stage deleted successfully");
  };

  const handleAddStage = () => {
    addCustomStage();
    toast.success("New stage added");
  };

  const handleAddJobberStage = (stageName: string) => {
    addJobberStage(stageName);
    setShowJobberSelector(false);
    toast.success("Jobber stage added");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex w-full">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => navigate('/sales')} className="flex items-center space-x-2">
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Pipeline</span>
              </Button>
            </div>
          </div>
        </header>
        
        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="max-w-full mx-auto">
            <div className="mb-8">
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">Edit Pipeline Stages</h1>
              <p className="text-gray-600">
                Customize your sales pipeline by adding, removing, or reordering stages. 
                Set time limits to track deal progress and identify bottlenecks.
              </p>
            </div>

            {/* Stages - Dynamic Layout with Responsive Columns */}
            <div ref={containerRef} className="w-full mb-6">
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={localStages.map(stage => stage.id)} strategy={horizontalListSortingStrategy}>
                  {shouldUseHorizontalScroll ? (
                    <ScrollArea className="w-full">
                      <div className="flex gap-4 min-w-max pb-4">
                        {localStages.sort((a, b) => a.order - b.order).map(stage => (
                          <div key={stage.id} style={{ width: `${columnWidth}px` }} className="flex-shrink-0">
                            <StageCard 
                              stage={stage} 
                              onUpdateTitle={handleTitleChange}
                              onUpdateTimeLimit={handleTimeLimitChange}
                              onDelete={handleDelete} 
                              canDelete={!stage.isImmutable} 
                            />
                          </div>
                        ))}
                      </div>
                      <ScrollBar orientation="horizontal" />
                    </ScrollArea>
                  ) : (
                    <div 
                      className="grid gap-4 pb-4 transition-all duration-300 ease-out"
                      style={{
                        gridTemplateColumns: `repeat(${localStages.length}, ${columnWidth}px)`,
                        justifyContent: 'center'
                      }}
                    >
                      {localStages.sort((a, b) => a.order - b.order).map(stage => (
                        <StageCard 
                          key={stage.id}
                          stage={stage} 
                          onUpdateTitle={handleTitleChange}
                          onUpdateTimeLimit={handleTimeLimitChange}
                          onDelete={handleDelete} 
                          canDelete={!stage.isImmutable} 
                        />
                      ))}
                    </div>
                  )}
                </SortableContext>
              </DndContext>
            </div>

            {/* Action Buttons - Below Cards */}
            <div className="flex gap-4 justify-center">
              <Button 
                onClick={handleAddStage} 
                className="h-12 px-6 border-dashed border-2 border-gray-300 bg-white text-gray-600 hover:text-gray-800 hover:border-gray-400 hover:bg-gray-50" 
                variant="outline"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Custom Stage
              </Button>
              
              <Button 
                onClick={() => setShowJobberSelector(true)} 
                className="h-12 px-6 border-dashed border-2 border-gray-400 bg-gray-100 text-gray-700 hover:text-gray-900 hover:border-gray-500 hover:bg-gray-200" 
                variant="outline"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Jobber Stage
              </Button>
            </div>
          </div>
        </main>
      </div>

      {showJobberSelector && (
        <JobberStageSelector 
          onSelect={handleAddJobberStage} 
          onClose={() => setShowJobberSelector(false)} 
        />
      )}
    </div>
  );
};

export default EditStages;
