<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Contact;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ContactController extends Controller
{
    // Public: submit enquiry
    public function submit(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'    => 'required|string|max:120',
            'email'   => 'required|email|max:255',
            'phone'   => 'nullable|string|max:30',
            'company' => 'nullable|string|max:200',
            'subject' => 'nullable|string|max:255',
            'message' => 'required|string|min:10|max:2000',
        ]);

        // Honeypot
        if ($request->filled('website')) {
            return response()->json(['message' => 'Your message has been received. We will be in touch within 24 hours.']);
        }

        $data['ip_address'] = $request->ip();
        $data['user_agent'] = substr($request->userAgent() ?? '', 0, 500);

        $contact = Contact::create($data);

        return response()->json([
            'message' => 'Your message has been received. We will be in touch within 24 hours.',
            'id'      => $contact->id,
        ]);
    }

    // Admin: list all
    public function index(): JsonResponse
    {
        return response()->json(
            Contact::orderBy('created_at', 'desc')->get()->map(fn($c) => [
                'id'        => $c->id,
                'name'      => $c->name,
                'email'     => $c->email,
                'phone'     => $c->phone,
                'company'   => $c->company,
                'subject'   => $c->subject,
                'message'   => $c->message,
                'status'    => $c->status,
                'created_at'=> $c->created_at?->toISOString(),
                'createdAt' => $c->created_at?->toISOString(),
            ])
        );
    }

    // Admin: update status
    public function update(Request $request, int $id): JsonResponse
    {
        $c    = Contact::findOrFail($id);
        $data = $request->validate(['status' => 'sometimes|in:new,read,replied,archived']);
        $c->update($data);
        return response()->json($c);
    }

    // Admin: delete
    public function destroy(int $id): JsonResponse
    {
        Contact::findOrFail($id)->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
