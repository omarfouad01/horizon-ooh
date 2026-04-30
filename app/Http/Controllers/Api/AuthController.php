<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Tymon\JWTAuth\Facades\JWTAuth;

class AuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        $token = JWTAuth::fromUser($user);

        return response()->json([
            'token' => $token,
            'user'  => [
                'id'      => $user->id,
                'name'    => $user->name,
                'email'   => $user->email,
                'phone'   => $user->phone   ?? null,
                'company' => $user->company ?? null,
                'role'    => $user->role,
            ],
        ]);
    }

    public function register(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'     => 'required|string|max:120',
            'email'    => 'required|email|unique:users,email',
            'password' => 'required|string|min:6|confirmed',
            'phone'    => 'nullable|string|max:30',
            'company'  => 'nullable|string|max:120',
        ]);

        // Create user — set password directly to avoid double-hashing from model cast
        $user = new User();
        $user->name     = $data['name'];
        $user->email    = $data['email'];
        $user->phone    = $data['phone']   ?? null;
        $user->company  = $data['company'] ?? null;
        $user->role     = 'user';
        $user->source   = 'website';
        $user->password = Hash::make($data['password']);
        $user->save();

        $token = JWTAuth::fromUser($user);

        return response()->json([
            'token' => $token,
            'user'  => [
                'id'      => $user->id,
                'name'    => $user->name,
                'email'   => $user->email,
                'phone'   => $user->phone   ?? null,
                'company' => $user->company ?? null,
                'role'    => $user->role,
            ],
        ], 201);
    }

    public function refresh(): JsonResponse
    {
        try {
            $newToken = JWTAuth::parseToken()->refresh();
            return response()->json(['token' => $newToken]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Token cannot be refreshed'], 401);
        }
    }

    public function logout(): JsonResponse
    {
        try { JWTAuth::invalidate(JWTAuth::getToken()); } catch (\Exception) {}
        return response()->json(['message' => 'Logged out']);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user();
        return response()->json([
            'id'      => $user->id,
            'name'    => $user->name,
            'email'   => $user->email,
            'phone'   => $user->phone   ?? null,
            'company' => $user->company ?? null,
            'role'    => $user->role,
        ]);
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();
        $data = $request->validate([
            'name'     => 'sometimes|string|max:120',
            'phone'    => 'nullable|string|max:30',
            'company'  => 'nullable|string|max:120',
            'password' => 'nullable|string|min:6|confirmed',
        ]);

        if (!empty($data['password'])) {
            // Set password directly to avoid double-hashing from model cast
            $user->password = \Illuminate\Support\Facades\Hash::make($data['password']);
            unset($data['password']);
        }
        $user->fill(array_diff_key($data, ['password' => '']));
        $user->save();

        return response()->json([
            'id'      => $user->id,
            'name'    => $user->name,
            'email'   => $user->email,
            'phone'   => $user->phone   ?? null,
            'company' => $user->company ?? null,
            'role'    => $user->role,
        ]);
    }
}
