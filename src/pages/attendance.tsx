import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, Users, TrendingUp } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

export default function Attendance() {
  const { user } = useAuth();
  const [selectedUser, setSelectedUser] = useState<string>(user?.id || "");
  const [dateRange, setDateRange] = useState<string>("week");

  const { data: users } = useQuery({
    queryKey: ['/api/users'],
  });

  const { data: attendance } = useQuery({
    queryKey: ['/api/attendance', { userId: selectedUser }],
  });

  const { data: todayAttendance } = useQuery({
    queryKey: ['/api/attendance/today'],
  });

  const isAdmin = user?.role === 'admin' || user?.role === 'director';

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateTotalHours = (timeIn: string, timeOut?: string) => {
    if (!timeOut) return 0;
    const start = new Date(timeIn);
    const end = new Date(timeOut);
    return ((end.getTime() - start.getTime()) / (1000 * 60 * 60)).toFixed(2);
  };

  const getAttendanceStatus = (timeIn?: string, timeOut?: string) => {
    if (!timeIn) return { status: 'Absent', color: 'bg-red-100 text-becs-red' };
    if (!timeOut) return { status: 'Present', color: 'bg-green-100 text-green-700' };
    return { status: 'Completed', color: 'bg-blue-100 text-becs-blue' };
  };

  // Calculate statistics
  const attendanceStats = attendance?.reduce((acc, record) => {
    if (record.timeIn) {
      acc.totalDays++;
      if (record.totalHours) {
        acc.totalHours += parseFloat(record.totalHours.toString());
      }
      if (record.timeOut) {
        acc.completedDays++;
      }
    }
    return acc;
  }, { totalDays: 0, totalHours: 0, completedDays: 0 }) || { totalDays: 0, totalHours: 0, completedDays: 0 };

  const averageHours = attendanceStats.completedDays > 0 ? 
    (attendanceStats.totalHours / attendanceStats.completedDays).toFixed(1) : 0;

  // Today's overview for admin
  const todayStats = todayAttendance?.reduce((acc, record) => {
    if (record.timeIn && !record.timeOut) acc.present++;
    if (!record.timeIn) acc.absent++;
    if (record.timeIn && record.timeOut) acc.completed++;
    return acc;
  }, { present: 0, absent: 0, completed: 0 }) || { present: 0, absent: 0, completed: 0 };

  const totalStaff = users?.filter(u => u.role === 'staff').length || 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-becs-navy">Attendance</h1>
          <p className="text-becs-gray">
            {isAdmin ? 'Monitor staff attendance and working hours' : 'View your attendance records'}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          {isAdmin && (
            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select staff member" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Staff</SelectItem>
                {users?.filter(u => u.role === 'staff').map(staff => (
                  <SelectItem key={staff.id} value={staff.id}>
                    {staff.firstName} {staff.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Today's Overview for Admin */}
      {isAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border border-gray-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-becs-gray text-sm font-medium">Currently Present</p>
                  <p className="text-2xl font-bold text-green-600">{todayStats.present}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-becs-gray text-sm font-medium">Completed Day</p>
                  <p className="text-2xl font-bold text-becs-blue">{todayStats.completed}</p>
                </div>
                <div className="w-12 h-12 becs-gradient rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-becs-gray text-sm font-medium">Attendance Rate</p>
                  <p className="text-2xl font-bold text-becs-navy">
                    {totalStaff > 0 ? Math.round(((todayStats.present + todayStats.completed) / totalStaff) * 100) : 0}%
                  </p>
                </div>
                <div className="w-12 h-12 becs-gold-gradient rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Individual Statistics */}
      {selectedUser !== "all" && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border border-gray-100">
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-becs-gray text-sm font-medium">Total Days</p>
                <p className="text-2xl font-bold text-becs-navy">{attendanceStats.totalDays}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-100">
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-becs-gray text-sm font-medium">Total Hours</p>
                <p className="text-2xl font-bold text-becs-blue">{attendanceStats.totalHours.toFixed(1)}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-100">
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-becs-gray text-sm font-medium">Average Hours</p>
                <p className="text-2xl font-bold text-becs-gold">{averageHours}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-100">
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-becs-gray text-sm font-medium">Completion Rate</p>
                <p className="text-2xl font-bold text-green-600">
                  {attendanceStats.totalDays > 0 ? 
                    Math.round((attendanceStats.completedDays / attendanceStats.totalDays) * 100) : 0}%
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Attendance Records */}
      <Card className="border border-gray-100">
        <CardHeader className="border-b border-gray-100">
          <CardTitle className="text-becs-navy flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Attendance Records
            {selectedUser !== "all" && (
              <Badge variant="secondary" className="ml-2">
                {attendance?.length || 0} records
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {selectedUser === "all" ? (
            // All staff overview
            <div className="space-y-4">
              {todayAttendance?.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-becs-gray mx-auto mb-4" />
                  <p className="text-becs-gray text-lg">No attendance records for today</p>
                </div>
              ) : (
                todayAttendance?.map((record) => {
                  const staff = users?.find(u => u.id === record.userId);
                  const status = getAttendanceStatus(record.timeIn, record.timeOut);
                  
                  return (
                    <div key={record.id} className="flex items-center justify-between p-4 bg-becs-soft rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 becs-gold-gradient rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {staff?.firstName?.[0]}{staff?.lastName?.[0]}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {staff?.firstName} {staff?.lastName}
                          </p>
                          <p className="text-sm text-becs-gray">{staff?.department}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-6">
                        <div className="text-sm text-center">
                          <p className="text-becs-gray">Time In</p>
                          <p className="font-medium">
                            {record.timeIn ? formatTime(record.timeIn) : '-'}
                          </p>
                        </div>
                        <div className="text-sm text-center">
                          <p className="text-becs-gray">Time Out</p>
                          <p className="font-medium">
                            {record.timeOut ? formatTime(record.timeOut) : '-'}
                          </p>
                        </div>
                        <div className="text-sm text-center">
                          <p className="text-becs-gray">Hours</p>
                          <p className="font-medium">
                            {record.totalHours ? record.totalHours : '-'}
                          </p>
                        </div>
                        <Badge className={status.color}>
                          {status.status}
                        </Badge>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            // Individual attendance records
            <div className="space-y-4">
              {attendance?.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-becs-gray mx-auto mb-4" />
                  <p className="text-becs-gray text-lg">No attendance records found</p>
                  <p className="text-becs-gray text-sm">Start tracking your attendance by clocking in</p>
                </div>
              ) : (
                attendance?.map((record) => {
                  const status = getAttendanceStatus(record.timeIn, record.timeOut);
                  
                  return (
                    <div key={record.id} className="flex items-center justify-between p-4 bg-becs-soft rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 becs-gradient rounded-lg flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {formatDate(record.date)}
                          </p>
                          <p className="text-sm text-becs-gray">
                            {new Date(record.date).toLocaleDateString('en-US', { weekday: 'long' })}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-6">
                        <div className="text-sm text-center">
                          <p className="text-becs-gray">Time In</p>
                          <p className="font-medium">
                            {record.timeIn ? formatTime(record.timeIn) : '-'}
                          </p>
                        </div>
                        <div className="text-sm text-center">
                          <p className="text-becs-gray">Time Out</p>
                          <p className="font-medium">
                            {record.timeOut ? formatTime(record.timeOut) : '-'}
                          </p>
                        </div>
                        <div className="text-sm text-center">
                          <p className="text-becs-gray">Total Hours</p>
                          <p className="font-medium">
                            {record.totalHours ? `${record.totalHours}h` : 
                             record.timeIn && !record.timeOut ? 'In Progress' : '-'}
                          </p>
                        </div>
                        <Badge className={status.color}>
                          {status.status}
                        </Badge>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
