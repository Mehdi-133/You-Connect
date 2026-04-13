<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', Notification::class);
        return Notification::where('you_coder_id', $request->user()->id)
            ->latest()
            ->paginate(15);
    }

    public function show(Notification $notification)
    {
        $this->authorize('view', $notification);
        return $notification;
    }

    public function markAsRead(Notification $notification)
    {
        $this->authorize('update', $notification);
        $notification->update(['is_read' => true]);
        return response()->json(['message' => 'Notification marked as read']);
    }

    public function markAllAsRead(Request $request)
    {
        Notification::where('you_coder_id', $request->user()->id)
            ->where('is_read', false)
            ->update(['is_read' => true]);
        return response()->json(['message' => 'All notifications marked as read']);
    }

    public function destroy(Notification $notification)
    {
        $this->authorize('delete', $notification);
        $notification->delete();
        return response()->json(['message' => 'Notification deleted']);
    }

    public function destroyAll(Request $request)
    {
        Notification::where('you_coder_id', $request->user()->id)->delete();
        return response()->json(['message' => 'All notifications deleted']);
    }
}
