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
    // ── Helper: decode a settings group from the DB ───────────────────────────

    private function decodeAll(): array
    {
        $rows = Setting::all()->pluck('value', 'key');
        $out  = [];
        foreach ($rows as $k => $v) {
            $decoded = json_decode($v, true);
            $out[$k] = $decoded !== null ? $decoded : $v;
        }
        return $out;
    }

    // GET /api/settings – return all settings as flat key-value object
    public function index(): JsonResponse
    {
        return response()->json($this->decodeAll());
    }

    // PUT /api/settings – bulk-upsert key-value pairs
    public function bulkUpdate(Request $request): JsonResponse
    {
        $data = $request->validate(['*' => 'nullable']);
        foreach ($data as $k => $v) Setting::set($k, $v);
        return response()->json(['message' => 'Settings saved']);
    }

    // GET /api/home-content – return all settings that relate to home page
    public function homeContent(): JsonResponse
    {
        $all = $this->decodeAll();
        // Return the dedicated home_content key if set, otherwise return all settings
        // (frontend merges the whole settings object into homeContent anyway)
        return response()->json($all['home_content'] ?? $all);
    }

    // PUT /api/home-content – upsert home content block
    public function updateHomeContent(Request $request): JsonResponse
    {
        $data = $request->all();
        // Store as a single JSON blob under key "home_content"
        Setting::set('home_content', $data);
        // Also persist individual keys so they're accessible via /settings
        foreach ($data as $k => $v) Setting::set($k, $v);
        return response()->json(['message' => 'Home content saved']);
    }

    // GET /api/about-content – return all settings that relate to about page
    public function aboutContent(): JsonResponse
    {
        $all = $this->decodeAll();
        return response()->json($all['about_content'] ?? $all);
    }

    // PUT /api/about-content – upsert about content block
    public function updateAboutContent(Request $request): JsonResponse
    {
        $data = $request->all();
        Setting::set('about_content', $data);
        foreach ($data as $k => $v) Setting::set($k, $v);
        return response()->json(['message' => 'About content saved']);
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
