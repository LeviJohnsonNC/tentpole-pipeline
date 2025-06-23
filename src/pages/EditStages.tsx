
import { useState, useEffect } from "react";
import { ArrowLeft, GripVertical, Trash2, Plus, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useStagesStore, Stage } from "@/store/stagesStore";
import { toast } from "sonner";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import StageCard from "@/components/stages/StageCard";
import Sidebar from "@/components/Sidebar";

const EditStages = () => {
  const navigate = useNavigate();
  const { stages, updateStageTitle, reorderStages, addCustomStage, deleteStage } = useStagesStore();
  const [localStages, setLocalStages] = useState<Stage[]>(stages);

  useEffect(() => {
    setLocalStages(stages);
  }, [stages]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = localStages.findIndex((stage) => stage.id === active.id);
      const newIndex = localStages.findIndex((stage) => stage.id === over.id);
      
      // Prevent moving immutable stages
      const activeStage = localStages[oldIndex];
      if (activeStage?.isImmutable) {
        toast.error("Cannot reorder locked stages");
        return;
      }
      
      // Prevent moving other stages to the first position if "New Lead" exists
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
    
    setLocalStages(prev => 
      prev.map(stage => 
        stage.id === id ? { ...stage, title } : stage
      )
    );
    updateStageTitle(id, title);
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

  return (
    <div className="min-h-screen bg-gray-50 flex w-full">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Pipeline</span>
              </Button>
            </div>
          </div>
        </header>
        
        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">Edit Pipeline Stages</h1>
              <p className="text-gray-600">
                Customize your sales pipeline by adding, removing, or reordering stages. 
                Locked stages cannot be modified and maintain their position.
              </p>
            </div>

            <div className="flex gap-6">
              {/* Stages Grid */}
              <div className="flex-1">
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={localStages.map(stage => stage.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {localStages
                        .sort((a, b) => a.order - b.order)
                        .map((stage) => (
                          <StageCard
                            key={stage.id}
                            stage={stage}
                            onUpdateTitle={handleTitleChange}
                            onDelete={handleDelete}
                            canDelete={!stage.isImmutable}
                          />
                        ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </div>

              {/* Action Buttons */}
              <div className="w-64 space-y-4">
                <Button
                  onClick={handleAddStage}
                  className="w-full h-16 border-dashed border-2 border-gray-300 bg-white text-gray-500 hover:text-gray-700 hover:border-gray-400 hover:bg-gray-50"
                  variant="outline"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add Custom Stage
                </Button>
              </div>
            </div>

            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">About Locked Stages</h3>
              <p className="text-sm text-blue-700">
                Locked stages (like "New Lead") are core to the pipeline workflow and cannot be renamed, moved, or deleted. 
                These stages ensure consistent deal flow and automatic business logic.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default EditStages;
