
import React, { useState, useEffect } from "react";
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
import { Search, Bell, MessageCircle, Settings, Plus, X } from "lucide-react";
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
import { useNavigate, useLocation } from "react-router-dom";

const jobberStageOptions = [
  "Assessment Complete",
  "Draft Quote", 
  "Quote Awaiting Response",
  "Quote Changes Requested"
];

const EditStages = () => {
  const { stages, updateStageTitle, reorderStages, addCustomStage, addJobberStage, deleteStage, getUsedJobberStages } = useStagesStore();
  const [showJobberDropdown, setShowJobberDropdown] = useState(false);
  const [referrerTab, setReferrerTab] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if we have state from navigation that tells us which tab was active
    if (location.state && location.state.fromTab) {
      setReferrerTab(location.state.fromTab);
    }
  }, [location.state]);

  const usedJobberStages = getUsedJobberStages();
  const availableJobberStages = jobberStageOptions.filter(option => !usedJobberStages.includes(option));

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

  const handleDeleteStage = (id: string) => {
    deleteStage(id);
  };

  const handleClose = () => {
    try {
      // If we know which tab the user came from, navigate accordingly
      if (referrerTab === 'sales-pipeline') {
        navigate('/', { state: { activeTab: 'sales-pipeline' } });
      } else if (referrerTab === 'all-requests') {
        navigate('/', { state: { activeTab: 'all-requests' } });
      } else {
        // Try to go back, with fallback to home
        if (window.history.length > 1) {
          navigate(-1);
        } else {
          navigate('/');
        }
      }
    } catch (error) {
      console.error('Navigation error:', error);
      // Fallback to home page
      navigate('/');
    }
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
                            onDelete={handleDeleteStage}
                            canDelete={stages.length > 1}
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
                      disabled={availableJobberStages.length === 0}
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
                      {availableJobberStages.length > 0 ? (
                        availableJobberStages.map((option) => (
                          <Button
                            key={option}
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start text-left"
                            onClick={() => handleJobberStageSelect(option)}
                          >
                            {option}
                          </Button>
                        ))
                      ) : (
                        <div className="px-2 py-3 text-sm text-gray-500">
                          All Jobber stages have been added
                        </div>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-200 flex items-center justify-between">
              <p className="text-xs text-gray-500">
                Changes are automatically saved and will be reflected in your sales pipeline.
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-4 w-4 mr-2" />
                Close
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default EditStages;
