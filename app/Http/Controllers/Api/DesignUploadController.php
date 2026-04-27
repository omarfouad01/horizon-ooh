<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DesignUpload;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class DesignUploadController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(DesignUpload::orderByDesc('created_at')->get()->map(fn($u) => $this->transform($u)));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'userId'      => 'nullable|string',
            'userName'    => 'nullable|string',
            'userEmail'   => 'nullable|string|email',
            'userPhone'   => 'nullable|string',
            'designUrl'   => 'required|string',
            'templateId'  => 'nullable|string',
            'typeName'    => 'nullable|string',
            'sizeLabel'   => 'nullable|string',
            'productId'   => 'nullable|string',
            'productName' => 'nullable|string',
            'status'      => 'nullable|string|in:pending,reviewed,approved,rejected',
            'notes'       => 'nullable|string',
        ]);

        $upload = DesignUpload::create([
            'user_id'      => $data['userId']      ?? null,
            'user_name'    => $data['userName']    ?? null,
            'user_email'   => $data['userEmail']   ?? null,
            'user_phone'   => $data['userPhone']   ?? null,
            'design_url'   => $data['designUrl'],
            'template_id'  => $data['templateId']  ?? null,
            'type_name'    => $data['typeName']    ?? null,
            'size_label'   => $data['sizeLabel']   ?? null,
            'product_id'   => $data['productId']   ?? null,
            'product_name' => $data['productName'] ?? null,
            'status'       => $data['status']      ?? 'pending',
            'notes'        => $data['notes']       ?? null,
        ]);

        return response()->json($this->transform($upload), 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $upload = DesignUpload::findOrFail($id);
        $data   = $request->validate([
            'status' => 'sometimes|string|in:pending,reviewed,approved,rejected',
            'notes'  => 'nullable|string',
        ]);
        $upload->update($data);
        return response()->json($this->transform($upload->fresh()));
    }

    public function destroy(int $id): JsonResponse
    {
        DesignUpload::findOrFail($id)->delete();
        return response()->json(['message' => 'Deleted']);
    }

    private function transform(DesignUpload $u): array
    {
        return [
            'id'          => $u->id,
            'userId'      => $u->user_id,
            'userName'    => $u->user_name,
            'userEmail'   => $u->user_email,
            'userPhone'   => $u->user_phone,
            'designUrl'   => $u->design_url,
            'templateId'  => $u->template_id,
            'typeName'    => $u->type_name,
            'sizeLabel'   => $u->size_label,
            'productId'   => $u->product_id,
            'productName' => $u->product_name,
            'status'      => $u->status,
            'notes'       => $u->notes,
            'createdAt'   => $u->created_at?->toISOString(),
        ];
    }
}
