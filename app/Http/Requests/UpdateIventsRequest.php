<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateIventsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title'       => 'sometimes|string|max:255',
            'photo'       => 'sometimes|url|max:2048',
            'description' => 'nullable|string',
            'location'    => 'nullable|string',
            'starts_at'   => 'sometimes|date',
            'ends_at'     => 'nullable|date|after:starts_at',
            'status'      => 'sometimes|in:upcoming,ongoing,finished,cancelled,suspended',
        ];
    }
}
