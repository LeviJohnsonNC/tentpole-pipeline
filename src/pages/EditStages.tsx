
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
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Sidebar from "@/components/Sidebar";

interface SortableStageProps {
  stage: Stage;
  onTitleChange: (id: string, title: string) => void;
  onDelete: (id: string) => void;
}

const SortableStage = ({ stage, onTitleChange, onDelete }: SortableStageProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: stage.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white border border-gray-200 rounded-lg p-4 ${
        isDragging ? 'opacity-50' : ''
      } ${stage.isImmutable ? 'bg-gray-50' : ''}`}
    >
      <div className="flex items-center space-x-3">
        <div
          {...attributes}
          {...listeners}
          className={`cursor-move text-gray-400 hover:text-gray-600 ${
            stage.isImmutable ? 'cursor-not-allowed opacity-50' : ''
          }`}
        >
          <GripVertical className="h-5 w-5" />
        </div>
        
        {stage.isImmutable && (
          <Lock className="h-4 w-4 text-gray-400" />
        )}
        
        <div className="flex-1">
          <Input
            value={stage.title}
            onChange={(e) => onTitleChange(stage.id, e.target.value)}
            className={`border-none px-0 font-medium focus-visible:ring-0 focus-visible:ring-offset-0 ${
              stage.isImmutable ? 'bg-gray-50 cursor-not-allowed' : ''
            }`}
            disabled={stage.isImmutable}
            placeholder="Stage name"
          />
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(stage.id)}
          className={`text-gray-400 hover:text-red-600 ${
            stage.isImmutable ? 'cursor-not-allowed opacity-50' : ''
          }`}
          disabled={stage.isImmutable}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      
      {stage.isJobberStage && (
        <div className="mt-2">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Jobber Stage
          </span>
        </div>
      )}
      
      {stage.isImmutable && (
        <div className="mt-2">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
            <Lock className="h-3 w-3 mr-1" />
            Locked Stage
          </span>
        </div>
      )}
    </div>
  );
};

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
          <div className="max-w-2xl mx-auto">
            <div className="mb-8">
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">Edit Pipeline Stages</h1>
              <p className="text-gray-600">
                Customize your sales pipeline by adding, removing, or reordering stages. 
                Locked stages cannot be modified and maintain their position.
              </p>
            </div>

            <div className="space-y-4">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={localStages.map(stage => stage.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {localStages
                    .sort((a, b) => a.order - b.order)
                    .map((stage) => (
                      <SortableStage
                        key={stage.id}
                        stage={stage}
                        onTitleChange={handleTitleChange}
                        onDelete={handleDelete}
                      />
                    ))}
                </SortableContext>
              </DndContext>
              
              <Button
                variant="outline"
                onClick={handleAddStage}
                className="w-full border-dashed border-2 h-16 text-gray-500 hover:text-gray-700 hover:border-gray-400"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add New Stage
              </Button>
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
