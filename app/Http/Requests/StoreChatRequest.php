<?php

namespace App\Http\Requests;

use App\Enums\ChatType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class StoreChatRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'type' => ['required', new Enum(ChatType::class)],
            'name' => 'nullable|string|max:255',
            'member_ids' => 'required|array|min:1',
            'member_ids.*' => 'integer|exists:users,id|distinct',
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $type = $this->input('type');
            $memberIds = $this->input('member_ids', []);

            if ($type === ChatType::Private->value && count($memberIds) !== 1) {
                $validator->errors()->add('member_ids', 'A private chat must have exactly one other member.');
            }
        });
    }
}
