
import React, { useState } from "react";
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
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Search, Bell, MessageCircle, Settings, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Sidebar from "@/components/Sidebar";
import StageCard from "@/components/stages/StageCard";
import { useStagesStore } from "@/store/stagesStore";

const jobberStageOptions = [
  "Assessment Complete",
  "Draft Quote", 
  "Quote Awaiting Response",
  "Quote Changes Requested"
];

const EditStages = () => {
  const { stages, updateStageTitle, reorderStages, addCustomStage, addJobberStage } = useStagesStore();
  const [showJobberDropdown, setShowJobberDropdown] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = stages.findIndex((stage) => stage.id === active.id);
      const newIndex = stages.findIndex((stage) => stage.id === over.id);

      const reorderedStages = arrayMove(stages, oldIndex, newIndex);
      reorderStages(reorderedStages);
    }
  };

  const handleJobberStageSelect = (stageTitle: string) => {
    addJobberStage(stageTitle);
    setShowJobberDropdown(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex w-full">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-sm font-medium text-gray-600">GROW QA 1</div>
            </div>
            
            <div className="flex-1 max-w-md mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input 
                  placeholder="Search" 
                  className="pl-10 bg-gray-50 border-gray-200 focus:bg-white"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
                  /
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm" className="p-2">
                <MessageCircle className="h-4 w-4 text-gray-600" />
              </Button>
              <Button variant="ghost" size="sm" className="p-2 relative">
                <Bell className="h-4 w-4 text-gray-600" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 text-xs bg-red-500 text-white rounded-full flex items-center justify-center p-0">
                  20
                </Badge>
              </Button>
              <Button variant="ghost" size="sm" className="p-2">
                <Settings className="h-4 w-4 text-gray-600" />
              </Button>
            </div>
          </div>
        </header>
        
        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Edit Stages</h1>
            <p className="text-gray-600 mt-2">Customize your sales pipeline stages. Click on a stage name to edit it, or drag to reorder.</p>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="mb-6">
              <h2 className="text-lg font-medium text-gray-900 mb-2">Pipeline Stages</h2>
              <p className="text-sm text-gray-500">
                These stages represent your sales pipeline. You can rename them and reorder them to match your workflow.
              </p>
            </div>

            <div className="flex items-start space-x-4">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={stages.map(stage => stage.id)}
                  strategy={horizontalListSortingStrategy}
                >
                  <div className="flex space-x-4 flex-1">
                    {stages
                      .sort((a, b) => a.order - b.order)
                      .map((stage) => (
                        <div key={stage.id} className="flex-1 min-w-0">
                          <StageCard
                            stage={stage}
                            onUpdateTitle={updateStageTitle}
                          />
                        </div>
                      ))}
                  </div>
                </SortableContext>
              </DndContext>

              <div className="flex flex-col space-y-3 ml-6">
                <Button 
                  onClick={addCustomStage}
                  variant="outline" 
                  size="sm"
                  className="whitespace-nowrap"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Custom Stage
                </Button>
                
                <Popover open={showJobberDropdown} onOpenChange={setShowJobberDropdown}>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="whitespace-nowrap"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Jobber Stage
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 p-0">
                    <div className="p-2">
                      <div className="text-sm font-medium text-gray-900 mb-2 px-2">
                        Select a Jobber stage:
                      </div>
                      {jobberStageOptions.map((option) => (
                        <Button
                          key={option}
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start text-left"
                          onClick={() => handleJobberStageSelect(option)}
                        >
                          {option}
                        </Button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Changes are automatically saved and will be reflected in your sales pipeline.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default EditStages;
