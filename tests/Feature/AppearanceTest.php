<?php

test('a visitor with no stored preference follows their system theme', function () {
    $this->get(route('home'))
        ->assertOk()
        // The server can't know the visitor's OS preference, so it renders
        // light and the inline script adds `dark` when the system asks for it.
        ->assertDontSee('<html lang="en" class="dark"', escape: false)
        ->assertSee("const appearance = 'system';", escape: false);

    expect(view()->shared('appearance'))->toBe('system');
});

test('a stored light preference is still respected', function () {
    $this->withUnencryptedCookie('appearance', 'light')
        ->get(route('home'))
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
