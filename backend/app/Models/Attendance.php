<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\User;

class Attendance extends Model
{
    use HasFactory;

    protected $table = 'attendance';

    protected $fillable = ['user_id', 'date', 'time_in', 'time_out', 'total_hours'];


    protected $casts = [
        'time_in' => 'datetime',
        'time_out' => 'datetime',
        'date' => 'date',
        'total_hours' => 'decimal:2',
    ];

    // Relationship to User
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
