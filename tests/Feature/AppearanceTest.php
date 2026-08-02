<?php

test('a visitor with no stored preference gets the light theme', function () {
    $this->get(route('home'))
        ->assertOk()
        ->assertDontSee('<html lang="en" class="dark"', escape: false);

    expect(view()->shared('appearance'))->toBe('light');
});

test('a stored dark preference is still respected', function () {
    $this->withUnencryptedCookie('appearance', 'dark')
        ->get(route('home'))
        ->assertOk()
        ->assertSee('class="dark"', escape: false);

    expect(view()->shared('appearance'))->toBe('dark');
});
