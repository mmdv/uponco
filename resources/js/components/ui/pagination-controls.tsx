import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import type { TranslateFn } from '@/hooks/use-translation';
import type { Paginated } from '@/types';

type Props<T> = {
    page: Paginated<T>;
    onPageChange: (page: number) => void;
    /**
     * The caller's own translator, so each page keeps its strings in its own
     * namespace. It must resolve `pagination.showing`, `pagination.previous`
     * and `pagination.next`.
     */
    t: TranslateFn;
    /** Prefix for the `data-test` hooks, e.g. `customers` or `notifications`. */
    testPrefix: string;
};

/**
 * "Showing 1–50 of 120" with previous/next buttons.
 *
 * Renders nothing for an empty result set — an empty list already says what
 * needs saying, and a disabled pager under it is just noise.
 */
export function PaginationControls<T>({
    page,
    onPageChange,
    t,
    testPrefix,
}: Props<T>) {
    if (page.total === 0) {
        return null;
    }

    return (
        <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
                {t('pagination.showing', {
                    from: page.from ?? 0,
                    to: page.to ?? 0,
                    total: page.total,
                })}
            </p>
            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    disabled={page.current_page <= 1}
                    onClick={() => onPageChange(page.current_page - 1)}
                    data-test={`${testPrefix}-prev-page`}
                >
                    <ChevronLeft className="size-4" /> {t('pagination.previous')}
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    disabled={page.current_page >= page.last_page}
                    onClick={() => onPageChange(page.current_page + 1)}
                    data-test={`${testPrefix}-next-page`}
                >
                    {t('pagination.next')} <ChevronRight className="size-4" />
                </Button>
            </div>
        </div>
    );
}
