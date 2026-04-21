<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use App\Models\Billboard;
use App\Models\Location;
use App\Models\Contact;
use App\Models\BlogPost;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class SettingController extends Controller
{
    // GET /api/settings – return all settings as flat key-value object
    public function index(): JsonResponse
    {
        $rows = Setting::all()->pluck('value', 'key');
        $out  = [];
        foreach ($rows as $k => $v) {
            $decoded = json_decode($v, true);
            $out[$k] = $decoded !== null ? $decoded : $v;
        }
        return response()->json($out);
    }

    // PUT /api/settings – bulk-upsert key-value pairs
    public function bulkUpdate(Request $request): JsonResponse
    {
        $data = $request->validate(['*' => 'nullable']);
        foreach ($data as $k => $v) Setting::set($k, $v);
        return response()->json(['message' => 'Settings saved']);
    }

    // GET /api/dashboard/stats – admin dashboard summary
    public function dashboardStats(): JsonResponse
    {
        return response()->json([
            'billboards'     => Billboard::count(),
            'locations'      => Location::count(),
            'contacts'       => Contact::count(),
            'new_contacts'   => Contact::where('status', 'new')->count(),
            'blog_posts'     => BlogPost::count(),
            'projects'       => Project::count(),
        ]);
    }
}
