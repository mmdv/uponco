<?php

test('the public booking page renders in a real browser', function () {
    $setup = bookableSetup();

    $page = visit(route('public.appointments.show', ['company' => $setup['team']->slug]));

    $page->assertSee($setup['team']->name)
        ->assertSee($setup['service']->title)
        ->assertNoJavascriptErrors();
});
