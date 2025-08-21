<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'staff_id' => 'required|string|unique:users,staff_id',
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|unique:users,email',
            'password' => 'required|string|min:6|confirmed',
        ]);

        $user = User::create([
            'staff_id' => $request->staff_id,
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        $user->assignRole('staff');

        return response()->json(['user' => $user], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'login'    => 'sometimes|string',
            'staffId'  => 'sometimes|string',
            'password' => 'required|string',
        ]);

        $loginValue = $request->login ?? $request->staffId;
        $loginType  = filter_var($loginValue, FILTER_VALIDATE_EMAIL) ? 'email' : 'staff_id';

        $user = User::where($loginType, $loginValue)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Invalid credentialss'], 401);
        }

        // Clear old tokens
        $user->tokens()->delete();

        // Issue new token
        $token = $user->createToken('auth_token')->plainTextToken;

        // Prepare the response data
        $responseData = [
            'message' => 'Login successful',
            'user'    => $user->toArray(),
            'token'   => $token,
        ];

        // Optionally log the response
        Log::info('Login response data', $responseData);
        return response()->json($responseData);
    }



    public function user(Request $request)
    {
        return response()->json($request->user());
    }

    public function all_users()
    {
        // Return all users with id, first_name, last_name, role
        return response()->json(
            User::select('id', 'first_name', 'last_name', 'staff_id', 'role')->get()
        );
    }

    public function logout(Request $request)
    {
        $request->user()->tokens()->delete();

        return response()->json(['message' => 'Logged out successfully']);
    }
}
