<?php

namespace App\Http\Controllers;

use App\Models\Badge;
use App\Http\Requests\StoreBadgeRequest;
use App\Http\Requests\UpdateBadgeRequest;

class BadgeController extends Controller
{
    public function index()
    {
        $this->authorize('viewAny', Badge::class);

        return Badge::latest()->paginate(10);
    }

    public function store(StoreBadgeRequest $request)
    {
        $this->authorize('create', Badge::class);

        $badge = Badge::create($request->validated());

        return response()->json($badge, 201);
    }

    public function show(Badge $badge)
    {
        $this->authorize('view', $badge);

        return $badge;
    }

    public function update(UpdateBadgeRequest $request, Badge $badge)
    {
        $this->authorize('update', $badge);

        $badge->update($request->validated());

        return response()->json($badge);
    }

    public function destroy(Badge $badge)
    {
        $this->authorize('delete', $badge);

        $badge->delete();

        return response()->json(['message' => 'Badge deleted']);
    }
}
