<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

use Illuminate\Validation\Rule;

class UpdateBadgeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => [
                'sometimes',
                'string',
                'max:255',
                Rule::unique('badges', 'name')->ignore($this->route('badge')),
            ],
            'description' => 'nullable|string',
            'icon' => 'nullable|string|max:255',
            'points_required' => 'sometimes|integer|min:0',
        ];
    }
}
