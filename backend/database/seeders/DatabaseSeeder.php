<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Clear existing users for a fresh start (optional)
        User::delete();

        // Admin User
        User::create([
            'staff_id'   => 'BECS001',
            'first_name' => 'System',
            'last_name'  => 'Admin',
            'email'      => 'admin@becs.co.ke',
            'password'   => Hash::make('demo'), // Default password
            'role'       => 'admin',
            'department' => 'IT',
            'position'   => 'System Administrator',
        ]);

        // Director User
        User::create([
            'staff_id'   => 'BECS002',
            'first_name' => 'Grace',
            'last_name'  => 'Kiptoo',
            'email'      => 'director@becs.co.ke',
            'password'   => Hash::make('demo'),
            'role'       => 'director',
            'department' => 'Executive',
            'position'   => 'Managing Director',
        ]);

        // Staff User
        User::create([
            'staff_id'   => 'BECS003',
            'first_name' => 'Anne',
            'last_name'  => 'Njeri',
            'email'      => 'anne.njeri@becs.co.ke',
            'password'   => Hash::make('demo'),
            'role'       => 'staff',
            'department' => 'Project Management',
            'position'   => 'Project Coordinator - Consortium',
        ]);
    }
}
