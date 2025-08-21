<?php
namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\Task;

class TaskController extends Controller
{
    public function index(Request $request)
    {
        return Task::with(['assignee', 'project'])->get();
    }

    public function show($id)
    {
        return Task::with(['assignee', 'project'])->findOrFail($id);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'assignee_id' => 'required|exists:users,id',
            'project_id' => 'nullable|exists:projects,id',
            'priority' => 'required|in:high,medium,low',
            'target_completion_date' => 'nullable|date',
            'is_weekly_deliverable' => 'boolean',
        ]);

        $task = Task::create($validated);

        return response()->json($task, 201);
    }

    public function update(Request $request, $id)
    {
        $task = Task::findOrFail($id);

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'assignee_id' => 'sometimes|exists:users,id',
            'project_id' => 'nullable|exists:projects,id',
            'priority' => 'sometimes|in:high,medium,low',
            'status' => 'sometimes|in:not_started,in_progress,submitted,completed',
            'target_completion_date' => 'nullable|date',
            'is_weekly_deliverable' => 'boolean',
        ]);

        $task->update($validated);

        return response()->json($task);
    }

    public function destroy($id)
    {
        $task = Task::findOrFail($id);
        $task->delete();

        return response()->json(null, 204);
    }
}

