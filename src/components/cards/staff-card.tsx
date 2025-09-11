import { Card, CardContent } from "@/components/ui/card";
import { User } from "@/types";

interface StaffCardProps {
  staff: User;
  weeklyTasks: number;
  completedTasks: number;
  overdueTasks: number;
  workloadPercentage: number;
}

export default function StaffCard({ 
  staff, 
  weeklyTasks, 
  completedTasks, 
  overdueTasks, 
  workloadPercentage 
}: StaffCardProps) {
  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  const getWorkloadColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-becs-red';
    if (percentage >= 60) return 'bg-becs-gold';
    return 'bg-green-500';
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 becs-gold-gradient rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-sm">
              {getInitials(staff.first_name, staff.last_name)}
            </span>
          </div>
          <div>
            <p className="font-medium text-gray-900">
              {staff.first_name} {staff.last_name}
            </p>
            <p className="text-sm text-becs-gray">{staff.department}</p>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-becs-gray">This Week:</span>
            <span className="font-medium text-becs-navy">{weeklyTasks} Tasks</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-becs-gray">Completed:</span>
            <span className="font-medium text-green-600">{completedTasks}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-becs-gray">Overdue:</span>
            <span className="font-medium text-becs-red">{overdueTasks}</span>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-sm text-becs-gray">Workload</span>
            <span className="text-sm font-medium text-becs-navy">{workloadPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div 
              className={`${getWorkloadColor(workloadPercentage)} h-2 rounded-full transition-all`}
              style={{ width: `${workloadPercentage}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
