<?php

namespace App\Actions\Teams;

use App\Models\Team;
use App\Support\BrandPalette;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

/**
 * Business details and branding (TEAM-1, BRAND-1, BRAND-2). Each change locks
 * the team row so concurrent saves can't interleave. Shared by the web
 * Business/Brand pages and the mobile API.
 */
class UpdateBusinessSettings
{
    /**
     * Name, URL slug, timezone and category.
     *
     * @param  array<string, mixed>  $data  Validated by SaveTeamRequest.
     */
    public function details(Team $team, array $data): void
    {
        DB::transaction(function () use ($team, $data): void {
            Team::whereKey($team->id)->lockForUpdate()->firstOrFail()->update($data);
        });

        $team->refresh();
    }

    /**
     * The booking page's primary colour; null resets to the Uponco blue.
     */
    public function brandColor(Team $team, ?string $color): void
    {
        $color = BrandPalette::normalise($color);

        DB::transaction(function () use ($team, $color): void {
            Team::whereKey($team->id)->lockForUpdate()->firstOrFail()->update(['brand_primary_color' => $color]);
        });

        $team->refresh();
    }

    /**
     * Store a new logo and delete the one it replaces.
     */
    public function storeLogo(Team $team, UploadedFile $file): void
    {
        $path = $file->store('team-logos', 'public');

        $this->replaceLogo($team, $path);
    }

    public function removeLogo(Team $team): void
    {
        $this->replaceLogo($team, null);
    }

    protected function replaceLogo(Team $team, ?string $path): void
    {
        DB::transaction(function () use ($team, $path): void {
            $locked = Team::whereKey($team->id)->lockForUpdate()->firstOrFail();
            $previousPath = $locked->logo_path;

            $locked->update(['logo_path' => $path]);

            if ($previousPath && $previousPath !== $path) {
                Storage::disk('public')->delete($previousPath);
            }
        });

        $team->refresh();
    }
}
