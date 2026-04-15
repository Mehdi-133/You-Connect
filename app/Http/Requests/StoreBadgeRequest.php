<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreBadgeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255|unique:badges,name',
            'description' => 'nullable|string',
            'icon' => 'nullable|string|max:255',
            'points_required' => 'required|integer|min:0',
        ];
    }
}
