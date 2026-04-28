<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(User::orderBy('name')->get()->map(fn($u) => [
            'id'        => $u->id,
            'name'      => $u->name,
            'email'     => $u->email,
            'role'      => $u->role,
            'phone'     => $u->phone,
            'source'    => $u->source,
            'notes'     => $u->notes,
            'createdAt' => $u->created_at?->toISOString(),
        ]));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'     => 'required|string|max:120',
            'email'    => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'role'     => 'nullable|string',
            'phone'    => 'nullable|string',
            'source'   => 'nullable|string',
            'notes'    => 'nullable|string',
        ]);
        // Explicitly hash password — do NOT rely on model cast to avoid double-hashing
        $data['password'] = Hash::make($data['password']);
        // Remove cast to prevent double-hash: temporarily unguard the hashed field
        $u = new User();
        $u->fill(array_diff_key($data, ['password' => '']));
        $u->password = $data['password']; // set pre-hashed password directly
        $u->save();
        return response()->json(['id' => $u->id, 'name' => $u->name, 'email' => $u->email, 'role' => $u->role], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $u    = User::findOrFail($id);
        $data = $request->validate([
            'name'     => 'sometimes|string|max:120',
            'email'    => "sometimes|email|unique:users,email,{$id}",
            'password' => 'nullable|string|min:8',
            'role'     => 'nullable|string',
            'phone'    => 'nullable|string',
            'source'   => 'nullable|string',
            'notes'    => 'nullable|string',
        ]);
        if (!empty($data['password'])) {
            // Set pre-hashed password directly to avoid double-hashing from model cast
            $data['password'] = Hash::make($data['password']);
            $u->password = $data['password'];
            unset($data['password']);
        }
        $u->fill(array_diff_key($data, ['password' => '']));
        $u->save();
        return response()->json(['id' => $u->id, 'name' => $u->name, 'email' => $u->email, 'role' => $u->role]);
    }

    public function destroy(int $id): JsonResponse
    {
        User::findOrFail($id)->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
