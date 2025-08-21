<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('attendance', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->date('date');
            $table->timestamp('time_in')->nullable();
            $table->timestamp('time_out')->nullable();
            $table->decimal('total_hours', 5, 2)->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'date']); // Prevent duplicate records for same user/day
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attendance');
    }
};
