<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    // List notifications
    public function index()
    {
        $user = Auth::user();
        return response()->json($user->notifications);
    }

    // Count unread
    public function unreadCount()
    {
        $user = Auth::user();
        $count = $user->unreadNotifications->count();

        return response()->json([
            'count' => $count
        ]);
    }

    // Mark single as read
    public function markAsRead($id)
    {
        $user = Auth::user();
        $notification = $user->notifications()
        ->where('id', $id)
        ->first();

        $notification = $user->notifications()->where('id', $id)->first();

        if ($notification) {
            $notification->markAsRead();
            return response()->json(['message' => 'Notification marked as read']);
        }

        return response()->json(['message' => 'Notification not found'], 404);
    }

    // Mark all as read
    public function markAllAsRead()
    {
        $user = Auth::user();
        $user->unreadNotifications->markAsRead();

        return response()->json(['message' => 'All notifications marked as read']);
    }
}
