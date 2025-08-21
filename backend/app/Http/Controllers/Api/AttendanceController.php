<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Attendance;
use Carbon\Carbon;

class AttendanceController extends Controller
{
    // GET /api/attendance
    public function index()
    {
        return Attendance::with('user')->get();
    }

    // GET /api/attendance/today/{userId}
    public function today($userId)
    {
        $today = Carbon::today()->toDateString();
        return Attendance::where('user_id', $userId)
            ->where('date', $today)
            ->get();
    }

    // POST /api/attendance/clock-in
    public function clockIn(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'date' => 'required|date',
            'time_in' => 'required|date',
        ]);
        $attendance = Attendance::create([
            'user_id' => $request->user_id,
            'date' => $request->date,
            'time_in' => $request->time_in,
        ]);


        return response()->json($attendance, 201);
    }

    // POST /api/attendance/clock-out
    public function clockOut(Request $request)
    {
        $request->validate([
            'userId' => 'required|exists:users,id',
        ]);

        $today = Carbon::today()->toDateString();
        $attendance = Attendance::where('user_id', $request->userId)
            ->where('date', $today)
            ->first();

        if (!$attendance || $attendance->time_out) {
            return response()->json(['message' => 'No active clock-in found'], 400);
        }

        $attendance->time_out = now();
        $attendance->total_hours = round(
            (strtotime($attendance->time_out) - strtotime($attendance->time_in)) / 3600,
            2
        );
        $attendance->save();

        return response()->json($attendance);
    }
}
