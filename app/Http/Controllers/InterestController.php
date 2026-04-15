<?php

namespace App\Http\Controllers;

use App\Models\Interest;
use App\Http\Requests\StoreInterestRequest;
use App\Http\Requests\UpdateInterestRequest;

class InterestController extends Controller
{
    public function index()
    {
        $this->authorize('viewAny', Interest::class);

        return Interest::latest()->paginate(10);
    }

    public function store(StoreInterestRequest $request)
    {
        $this->authorize('create', Interest::class);

        $interest = Interest::create($request->validated());

        return response()->json($interest, 201);
    }

    public function show(Interest $interest)
    {
        $this->authorize('view', $interest);

        return $interest->loadCount('users');
    }

    public function update(UpdateInterestRequest $request, Interest $interest)
    {
        $this->authorize('update', $interest);

        $interest->update($request->validated());

        return response()->json($interest);
    }

    public function destroy(Interest $interest)
    {
        $this->authorize('delete', $interest);

        $interest->delete();

        return response()->json([
            'message' => 'Interest deleted',
        ]);
    }
}
