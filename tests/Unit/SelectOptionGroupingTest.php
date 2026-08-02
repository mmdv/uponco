<?php

use App\Enums\BusinessCategory;
use App\Support\LocationOptions;

test('every business category option carries a section', function () {
    $options = BusinessCategory::options();

    expect($options)->toHaveCount(count(BusinessCategory::cases()));

    foreach ($options as $option) {
        expect($option['group'])->not->toBeEmpty();
    }
});

test('the catch-all category is listed last', function () {
    $options = BusinessCategory::options();

    expect(end($options)['value'])->toBe(BusinessCategory::Other->value);
});

test('categories of the same section are listed as one run', function () {
    $groups = array_column(BusinessCategory::options(), 'group');

    /** The sections in the order they first appear, with repeats collapsed. */
    $runs = array_values(array_filter(
        $groups,
        fn (string $group, int $index): bool => $index === 0 || $groups[$index - 1] !== $group,
        ARRAY_FILTER_USE_BOTH
    ));

    expect($runs)->toBe(array_values(array_unique($groups)));
});

test('timezones are grouped by their region', function () {
    $berlin = array_values(array_filter(
        LocationOptions::timezones(),
        fn (array $option): bool => $option['value'] === 'Europe/Berlin'
    ));

    expect($berlin[0]['group'])->toBe('Europe');
});
