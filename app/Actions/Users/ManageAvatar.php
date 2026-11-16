<?php

namespace App\Actions\Users;

use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class ManageAvatar
{
    /**
     * Store a new profile picture and delete the one it replaces. Shared by
     * the web settings and member pages and the mobile API.
     */
    public function store(User $user, UploadedFile $file): void
    {
        $previousPath = $user->avatar_path;

        $path = $file->store('avatars', 'public');

        $user->update(['avatar_path' => $path]);

        if ($previousPath && $previousPath !== $path) {
            Storage::disk('public')->delete($previousPath);
        }
    }

    /**
     * Remove the profile picture (the initials show instead).
     */
    public function remove(User $user): void
    {
        $previousPath = $user->avatar_path;

        $user->update(['avatar_path' => null]);

        if ($previousPath) {
            Storage::disk('public')->delete($previousPath);
        }
    }
}
