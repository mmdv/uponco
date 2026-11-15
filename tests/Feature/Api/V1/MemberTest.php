<?php

use App\Enums\TeamPermission;
use App\Enums\TeamRole;
use App\Models\Location;
use App\Models\Service;
use App\Models\Team;
use App\Models\TeamInvitation;
use App\Models\User;
use App\Notifications\Teams\TeamInvitation as TeamInvitationNotification;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Support\Facades\Notification;
use Laravel\Sanctum\Sanctum;

/**
 * A team with an owner, an admin and a plain member, all working in it.
 *
 * @return array{team: Team, owner: User, admin: User, member: User}
 */
function apiMembersTeam(): array
{
    $team = Team::factory()->create();
    $people = [];

    foreach (['owner' => TeamRole::Owner, 'admin' => TeamRole::Admin, 'member' => TeamRole::Member] as $key => $role) {
        $people[$key] = User::factory()->create(['name' => ucfirst($key).' Person']);
        $team->members()->attach($people[$key], ['role' => $role->value]);
        $people[$key]->switchTeam($team);
    }

    return ['team' => $team, ...$people];
}

test('admins see the team, pending invitations and what they may do', function () {
    $setup = apiMembersTeam();
    TeamInvitation::factory()->create(['team_id' => $setup['team']->id, 'email' => 'new@example.com', 'role' => TeamRole::Member]);
    Sanctum::actingAs($setup['admin']);

    $this->getJson(route('api.v1.members.index'))
        ->assertOk()
        ->assertJsonPath('data.members.*.name', ['Admin Person', 'Member Person', 'Owner Person'])
        ->assertJsonPath('data.members.2.role', 'owner')
        ->assertJsonPath('data.invitations.0.email', 'new@example.com')
        ->assertJsonPath('data.can', ['add' => true, 'invite' => true, 'cancel_invitation' => true])
        ->assertJsonPath('data.roles.*.value', ['admin', 'member']);
});

test('plain members cannot reach the members API', function () {
    $setup = apiMembersTeam();
    Sanctum::actingAs($setup['member']);

    $this->getJson(route('api.v1.members.index'))->assertForbidden();
    $this->getJson(route('api.v1.members.show', $setup['owner']))->assertForbidden();
});

test('an admin adds a member who must verify their own email', function () {
    Notification::fake();
    $setup = apiMembersTeam();
    Sanctum::actingAs($setup['admin']);

    $this->postJson(route('api.v1.members.store'), [
        'name' => 'Jane',
        'surname' => 'Doe',
        'job_title' => 'Stylist',
        'email' => 'jane@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ])->assertCreated()
        ->assertJsonPath('data.name', 'Jane Doe')
        ->assertJsonPath('data.role', 'member')
        ->assertJsonPath('data.profile.job_title', 'Stylist');

    $jane = User::where('email', 'jane@example.com')->sole();

    expect($jane->belongsToTeam($setup['team']))->toBeTrue()
        ->and($jane->email_verified_at)->toBeNull();
    Notification::assertSentTo($jane, VerifyEmail::class);
});

test('a member\'s detail lists the team\'s services and locations with theirs ticked', function () {
    $setup = apiMembersTeam();
    $service = Service::factory()->create(['team_id' => $setup['team']->id, 'title' => 'Haircut']);
    Service::factory()->create(['team_id' => $setup['team']->id, 'title' => 'Beard']);
    $location = Location::factory()->create(['team_id' => $setup['team']->id]);
    $setup['member']->services()->attach($service);
    Sanctum::actingAs($setup['admin']);

    $this->getJson(route('api.v1.members.show', $setup['member']))
        ->assertOk()
        ->assertJsonPath('data.services.*.title', ['Beard', 'Haircut'])
        ->assertJsonPath('data.service_ids', [$service->id])
        ->assertJsonPath('data.locations.0.id', $location->id)
        ->assertJsonPath('data.location_ids', [])
        ->assertJsonPath('data.grantable_permissions', [TeamPermission::ViewAllAppointments->value])
        ->assertJsonPath('data.can', ['change_role' => true, 'remove' => false]);
});

test('role, profile, login email, permissions and assignments can be changed', function () {
    $setup = apiMembersTeam();
    $service = Service::factory()->create(['team_id' => $setup['team']->id]);
    $location = Location::factory()->create(['team_id' => $setup['team']->id]);
    $member = $setup['member'];
    Sanctum::actingAs($setup['admin']);

    $this->patchJson(route('api.v1.members.role.update', $member), ['role' => 'admin'])
        ->assertOk()->assertJsonPath('data.role', 'admin');
    $this->patchJson(route('api.v1.members.profile.update', $member), [
        'name' => 'Mia Chen', 'phone' => '+994500000000', 'job_title' => 'Colourist', 'description' => 'Hi',
    ])->assertOk()->assertJsonPath('data.name', 'Mia Chen')->assertJsonPath('data.profile.job_title', 'Colourist');
    $this->patchJson(route('api.v1.members.account.update', $member), ['email' => 'mia@example.com'])
        ->assertOk()->assertJsonPath('data.email', 'mia@example.com');
    $this->putJson(route('api.v1.members.permissions.update', $member), ['permissions' => ['appointment:view-all']])
        ->assertOk()->assertJsonPath('data.permissions', ['appointment:view-all']);
    $this->putJson(route('api.v1.members.services.update', $member), ['ids' => [$service->id]])
        ->assertOk()->assertJsonPath('data.service_ids', [$service->id]);
    $this->putJson(route('api.v1.members.locations.update', $member), ['ids' => [$location->id]])
        ->assertOk()->assertJsonPath('data.location_ids', [$location->id]);

    expect($member->fresh()->email_verified_at)->toBeNull();
});

test('another team\'s service cannot be assigned, nor a permission that is not grantable', function () {
    $setup = apiMembersTeam();
    $foreign = Service::factory()->create();
    Sanctum::actingAs($setup['admin']);

    $this->putJson(route('api.v1.members.services.update', $setup['member']), ['ids' => [$foreign->id]])
        ->assertJsonValidationErrors('ids.0');
    $this->putJson(route('api.v1.members.permissions.update', $setup['member']), ['permissions' => ['team:delete']])
        ->assertJsonValidationErrors('permissions.0');
});

test('only the owner manages the owner, and the owner\'s role never changes here', function () {
    $setup = apiMembersTeam();

    Sanctum::actingAs($setup['admin']);
    $this->getJson(route('api.v1.members.show', $setup['owner']))->assertForbidden();

    Sanctum::actingAs($setup['owner']);
    $this->getJson(route('api.v1.members.show', $setup['owner']))
        ->assertOk()->assertJsonPath('data.can.change_role', false);
    $this->patchJson(route('api.v1.members.role.update', $setup['owner']), ['role' => 'member'])->assertForbidden();
    $this->patchJson(route('api.v1.members.role.update', $setup['member']), ['role' => 'owner'])
        ->assertJsonValidationErrors('role');
});

test('someone outside the team is not found', function () {
    $setup = apiMembersTeam();
    $outsider = User::factory()->create();
    Sanctum::actingAs($setup['owner']);

    $this->getJson(route('api.v1.members.show', $outsider))->assertNotFound();
    $this->deleteJson(route('api.v1.members.destroy', $outsider))->assertNotFound();
});

test('only the owner removes members, and never themselves', function () {
    $setup = apiMembersTeam();

    Sanctum::actingAs($setup['admin']);
    $this->deleteJson(route('api.v1.members.destroy', $setup['member']))->assertForbidden();

    Sanctum::actingAs($setup['owner']);
    $this->deleteJson(route('api.v1.members.destroy', $setup['owner']))->assertForbidden();
    $this->deleteJson(route('api.v1.members.destroy', $setup['member']))->assertNoContent();

    expect($setup['member']->fresh()->belongsToTeam($setup['team']))->toBeFalse();
});

test('admins invite by email and cancel invitations', function () {
    Notification::fake();
    $setup = apiMembersTeam();
    Sanctum::actingAs($setup['admin']);

    $code = $this->postJson(route('api.v1.invitations.store'), ['email' => 'new@example.com', 'role' => 'admin'])
        ->assertCreated()
        ->assertJsonPath('data.role', 'admin')
        ->json('data.code');

    Notification::assertSentOnDemand(TeamInvitationNotification::class);

    $this->postJson(route('api.v1.invitations.store'), ['email' => $setup['member']->email, 'role' => 'member'])
        ->assertJsonValidationErrors('email');

    $this->deleteJson(route('api.v1.invitations.destroy', $code))->assertNoContent();

    expect(TeamInvitation::where('code', $code)->exists())->toBeFalse();
});

test('nobody can be invited as owner', function () {
    Notification::fake();
    $setup = apiMembersTeam();
    Sanctum::actingAs($setup['owner']);

    $this->postJson(route('api.v1.invitations.store'), ['email' => 'new@example.com', 'role' => 'owner'])
        ->assertJsonValidationErrors('role');

    expect(TeamInvitation::count())->toBe(0);
    Notification::assertNothingSent();
});

test('another team\'s invitation cannot be cancelled', function () {
    $setup = apiMembersTeam();
    $other = TeamInvitation::factory()->create();
    Sanctum::actingAs($setup['owner']);

    $this->deleteJson(route('api.v1.invitations.destroy', $other->code))->assertNotFound();
});

test('member endpoints require a token', function () {
    $this->getJson(route('api.v1.members.index'))->assertUnauthorized();
    $this->postJson(route('api.v1.invitations.store'))->assertUnauthorized();
});
