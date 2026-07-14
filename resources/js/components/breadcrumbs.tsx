import { Link } from '@inertiajs/react';
import { Fragment } from 'react';
import {
    Breadcrumb,
    BreadcrumbEllipsis,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';

const MAX_VISIBLE = 3;

export function Breadcrumbs({
    breadcrumbs,
}: {
    breadcrumbs: BreadcrumbItemType[];
}) {
    const isCollapsed = breadcrumbs.length > MAX_VISIBLE;
    const visibleBreadcrumbs = isCollapsed
        ? breadcrumbs.slice(-MAX_VISIBLE)
        : breadcrumbs;

    return (
        <>
            {breadcrumbs.length > 0 && (
                <Breadcrumb>
                    <BreadcrumbList>
                        {isCollapsed && (
                            <>
                                <BreadcrumbItem>
                                    <BreadcrumbEllipsis />
                                </BreadcrumbItem>
                                <BreadcrumbSeparator />
                            </>
                        )}
                        {visibleBreadcrumbs.map((item, index) => {
                            const isLast =
                                index === visibleBreadcrumbs.length - 1;

                            return (
                                <Fragment key={index}>
                                    <BreadcrumbItem>
                                        {isLast ? (
                                            <BreadcrumbPage>
                                                {item.title}
                                            </BreadcrumbPage>
                                        ) : (
                                            <BreadcrumbLink asChild>
                                                <Link href={item.href}>
                                                    {item.title}
                                                </Link>
                                            </BreadcrumbLink>
                                        )}
                                    </BreadcrumbItem>
                                    {!isLast && <BreadcrumbSeparator />}
                                </Fragment>
                            );
                        })}
                    </BreadcrumbList>
                </Breadcrumb>
            )}
        </>
    );
}
