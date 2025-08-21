<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\User;
use App\Models\Project;

class Task extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'assignee_id',
        'project_id',
        'priority',
        'status',
        'target_completion_date',
        'is_weekly_deliverable',
    ];
    protected $casts = [
    'target_completion_date' => 'datetime:Y-m-d', 
    ];

    public function assignee()
    {
        return $this->belongsTo(User::class, 'assignee_id');
    }

    public function project()
    {
        return $this->belongsTo(Project::class);
    }
}
