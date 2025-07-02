
import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Check, X, Trash2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Stage } from '@/store/stagesStore';

interface StageCardProps {
  stage: Stage;
  onUpdateTitle: (id: string, title: string) => void;
  onUpdateTimeLimit: (id: string, enabled: boolean, days: number, hours: number) => void;
  onDelete: (id: string) => void;
  canDelete?: boolean;
}

const StageCard = ({
  stage,
  onUpdateTitle,
  onUpdateTimeLimit,
  onDelete,
  canDelete = true
}: StageCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(stage.title);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: stage.id
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  const handleSave = () => {
    onUpdateTitle(stage.id, editTitle);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditTitle(stage.title);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const handleDelete = () => {
    onDelete(stage.id);
  };

  const handleEditClick = () => {
    if (stage.isImmutable || stage.isJobberStage) {
      return;
    }
    setIsEditing(true);
  };

  const handleTimeLimitToggle = (enabled: boolean) => {
    onUpdateTimeLimit(stage.id, enabled, stage.timeLimitDays, stage.timeLimitHours);
  };

  const handleDaysChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const days = Math.max(0, parseInt(e.target.value) || 0);
    onUpdateTimeLimit(stage.id, stage.timeLimitEnabled, days, stage.timeLimitHours);
  };

  const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hours = Math.max(0, Math.min(23, parseInt(e.target.value) || 0));
    onUpdateTimeLimit(stage.id, stage.timeLimitEnabled, stage.timeLimitDays, hours);
  };

  const canEdit = !stage.isImmutable && !stage.isJobberStage;

  return (
    <Card 
      ref={setNodeRef} 
      style={style} 
      className={`relative h-64 ${isDragging ? 'opacity-50' : ''} ${stage.isJobberStage ? 'bg-gray-100 border-gray-300' : 'bg-white'} ${stage.isImmutable ? 'bg-gray-50 border-gray-300' : ''}`}
    >
      <CardContent className="p-4 h-full flex flex-col">
        <div className="flex items-start space-x-2 mb-4">
          <div 
            {...attributes} 
            {...listeners} 
            className={`cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 mt-1 ${stage.isImmutable ? 'cursor-not-allowed opacity-50' : ''}`}
          >
            <GripVertical className="h-4 w-4" />
          </div>
          
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <div className="space-y-2">
                <Input 
                  value={editTitle} 
                  onChange={e => setEditTitle(e.target.value)} 
                  onKeyDown={handleKeyDown} 
                  className="h-8 text-sm" 
                  autoFocus 
                />
                <div className="flex space-x-1">
                  <Button size="sm" variant="ghost" onClick={handleSave} className="h-6 w-6 p-0">
                    <Check className="h-3 w-3 text-green-600" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={handleCancel} className="h-6 w-6 p-0">
                    <X className="h-3 w-3 text-red-600" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div 
                    onClick={handleEditClick} 
                    className={`text-sm font-medium truncate flex-1 ${
                      !canEdit 
                        ? 'cursor-not-allowed text-gray-500' 
                        : 'cursor-pointer hover:bg-gray-50 px-2 py-1 rounded'
                    }`} 
                    title={stage.title}
                  >
                    {stage.title}
                  </div>
                  
                  <div className="flex items-center space-x-1 ml-2">
                    {(stage.isImmutable || stage.isJobberStage) && (
                      <Lock className="h-3 w-3 text-gray-400" />
                    )}
                    {canDelete && !stage.isImmutable && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-gray-400 hover:text-red-600">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Stage</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete the "{stage.title}" stage? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDelete}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Time Limit Controls */}
        <div className="flex-1 space-y-3">
          <div className="border-t border-gray-200 pt-3">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-medium text-gray-700">Time limit</label>
              <Switch
                checked={stage.timeLimitEnabled}
                onCheckedChange={handleTimeLimitToggle}
                className="scale-75"
              />
            </div>
            
            {stage.timeLimitEnabled && (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Days</label>
                    <Input
                      type="number"
                      min="0"
                      value={stage.timeLimitDays}
                      onChange={handleDaysChange}
                      className="h-7 text-xs"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Hours</label>
                    <Input
                      type="number"
                      min="0"
                      max="23"
                      value={stage.timeLimitHours}
                      onChange={handleHoursChange}
                      className="h-7 text-xs"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StageCard;
