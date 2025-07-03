
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Edit2, Save, X } from 'lucide-react';
import { DealData } from '@/hooks/useDealData';
import { format } from 'date-fns';

interface NextStepSectionProps {
  dealData: DealData;
}

const NextStepSection = ({ dealData }: NextStepSectionProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [nextStep, setNextStep] = useState('Follow up on quote status');
  const [dueDate, setDueDate] = useState<Date>();
  const [tempNextStep, setTempNextStep] = useState(nextStep);
  const [tempDueDate, setTempDueDate] = useState<Date | undefined>(dueDate);

  const handleEdit = () => {
    setTempNextStep(nextStep);
    setTempDueDate(dueDate);
    setIsEditing(true);
  };

  const handleSave = () => {
    setNextStep(tempNextStep);
    setDueDate(tempDueDate);
    setIsEditing(false);
    // TODO: Save to backend/store
  };

  const handleCancel = () => {
    setTempNextStep(nextStep);
    setTempDueDate(dueDate);
    setIsEditing(false);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Next Step</CardTitle>
          {!isEditing && (
            <Button variant="ghost" size="sm" onClick={handleEdit}>
              <Edit2 className="h-3 w-3" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {isEditing ? (
          <>
            <div>
              <Label htmlFor="next-step" className="text-xs">Next Step Description</Label>
              <Input
                id="next-step"
                value={tempNextStep}
                onChange={(e) => setTempNextStep(e.target.value)}
                className="text-sm"
              />
            </div>
            <div>
              <Label className="text-xs">Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal text-sm"
                  >
                    <CalendarIcon className="mr-2 h-3 w-3" />
                    {tempDueDate ? format(tempDueDate, 'PPP') : 'Select date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={tempDueDate}
                    onSelect={setTempDueDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSave}>
                <Save className="h-3 w-3 mr-1" />
                Save
              </Button>
              <Button size="sm" variant="outline" onClick={handleCancel}>
                <X className="h-3 w-3 mr-1" />
                Cancel
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="text-sm text-gray-900">{nextStep}</div>
            {dueDate && (
              <div className="text-xs text-gray-500">
                Due: {format(dueDate, 'PPP')}
              </div>
            )}
            {!nextStep && (
              <div className="text-xs text-gray-400 italic">No next step defined</div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default NextStepSection;
