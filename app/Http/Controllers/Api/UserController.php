<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class UserController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $q = User::orderBy('created_at', 'desc');

        // Optional filters
        if ($request->filled('source')) {
            $q->where('source', $request->source);
        }
        if ($request->filled('role')) {
            $q->where('role', $request->role);
        }

        return response()->json($q->get()->map(fn($u) => $this->transform($u)));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'     => 'required|string|max:120',
            'email'    => 'required|email|unique:users,email',
            'password' => ['required', 'string', Password::min(8)],
            'role'     => 'nullable|string|in:admin,editor,viewer',
            'phone'    => 'nullable|string|max:30',
            'source'   => 'nullable|string|max:50',
            'notes'    => 'nullable|string',
        ]);

        // Hash password manually — model cast removed to prevent double-hash
        $data['password'] = Hash::make($data['password']);
        $data['role']     = $data['role'] ?? 'editor';

        // Use direct insert to bypass any model mutation
        $u = User::create($data);

        return response()->json($this->transform($u), 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $u    = User::findOrFail($id);
        $data = $request->validate([
            'name'     => 'sometimes|string|max:120',
            'email'    => "sometimes|email|unique:users,email,{$id}",
            'password' => ['nullable', 'string', Password::min(8)],
            'role'     => 'nullable|string|in:admin,editor,viewer',
            'phone'    => 'nullable|string|max:30',
            'source'   => 'nullable|string|max:50',
            'notes'    => 'nullable|string',
        ]);

        // Handle password separately to avoid double-hash
        if (!empty($data['password'])) {
            $u->password = Hash::make($data['password']);
        }
        unset($data['password']);

        $u->fill($data);
        $u->save();

        return response()->json($this->transform($u));
    }

    public function destroy(int $id): JsonResponse
    {
        User::findOrFail($id)->delete();
        return response()->json(['message' => 'Deleted']);
    }

    private function transform(User $u): array
    {
        return [
            'id'         => $u->id,
            'name'       => $u->name,
            'email'      => $u->email,
            'role'       => $u->role ?? 'editor',
            'phone'      => $u->phone,
            'source'     => $u->source ?? 'website',
            'notes'      => $u->notes,
            'created_at' => $u->created_at?->toISOString(),
            // camelCase alias kept for dashboard users page
            'createdAt'  => $u->created_at?->toISOString(),
        ];
    }
}