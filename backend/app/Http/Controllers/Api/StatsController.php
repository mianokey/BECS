<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\User;
use App\Models\Attendance;
use App\Models\Task;

class StatsController extends Controller
{
    public function index()
    {
        return response()->json([
            'totalProjects'     => Project::count(),
            'activeProjects'    => Project::where('status', 'active')->count(),
            'completedProjects' => Project::where('status', 'completed')->count(),
            'weeklyDeliverables'  => Task::where('is_weekly_deliverable', true)->count(),

            'totalStaff'        => User::count(),

            'todayAttendance'   => Attendance::whereDate('created_at', today())->count(),
        ]);
    }
}
