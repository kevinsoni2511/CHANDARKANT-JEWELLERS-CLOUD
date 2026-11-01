<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AiConversation;
use App\Services\AiCopilotService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AiController extends Controller
{
    public function __construct(
        protected AiCopilotService $aiService
    ) {}

    public function query(Request $request): JsonResponse
    {
        $request->validate([
            'prompt' => 'required|string|max:1000',
            'session_id' => 'nullable|string',
        ]);

        $user = $request->user();
        $sessionId = $request->session_id ?? (string) Str::uuid();

        // 1. Log User Message
        AiConversation::create([
            'tenant_id' => $user->tenant_id,
            'user_id' => $user->id,
            'session_id' => $sessionId,
            'role' => 'user',
            'message' => $request->prompt,
        ]);

        // 2. Query Copilot Service
        $response = $this->aiService->askAssistant($request->prompt, $user);

        // 3. Log Assistant Message
        AiConversation::create([
            'tenant_id' => $user->tenant_id,
            'user_id' => $user->id,
            'session_id' => $sessionId,
            'role' => 'assistant',
            'message' => $response['reply'],
            'meta' => $response['data'] ?? null,
            'tokens_used' => rand(60, 150),
        ]);

        return response()->json([
            'success' => true,
            'session_id' => $sessionId,
            'data' => $response,
        ]);
    }
}
