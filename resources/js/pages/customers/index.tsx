import { Head, router, usePage } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, Plus, Search } from 'lucide-react';
import { useEffect, useState } from 'react';

import CustomerFormDialog from '@/components/customers/customer-form-dialog';
import CustomerPreviewModal from '@/components/customers/customer-preview-modal';
import CustomersTable from '@/components/customers/customers-table';
import DeleteCustomerModal from '@/components/customers/delete-customer-modal';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTranslation } from '@/hooks/use-translation';
import { index as customersIndex } from '@/routes/customers';
import type { Customer, Paginated } from '@/types';

type Props = {
    customers: Paginated<Customer>;
    filters: { search: string };
};

const SEARCH_DEBOUNCE_MS = 300;

export default function CustomersIndex({ customers, filters }: Props) {
    const { t } = useTranslation('customers');
    const { currentTeam } = usePage().props;
    const teamSlug = currentTeam?.slug ?? '';

    const [search, setSearch] = useState(filters.search);

    const reloadCustomers = (nextSearch: string, page: number) => {
        router.reload({
            only: ['customers', 'filters'],
            data: { search: nextSearch, page },
            replace: true,
        });
    };

    const goToPage = (page: number) => reloadCustomers(search, page);

    // Debounce free-text search, resetting to the first page on each change.
    // Compare against the server's current filter so no request fires on mount
    // or once results for the typed term have already loaded.
    useEffect(() => {
        if (search === filters.search) {
            return;
        }

        const timeout = window.setTimeout(() => {
            reloadCustomers(search, 1);
        }, SEARCH_DEBOUNCE_MS);

        return () => window.clearTimeout(timeout);
    }, [search, filters.search]);

    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState<Customer | null>(null);

    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleting, setDeleting] = useState<Customer | null>(null);

    const [previewOpen, setPreviewOpen] = useState(false);
    const [viewing, setViewing] = useState<Customer | null>(null);

    const openCreate = () => {
        setEditing(null);
        setFormOpen(true);
    };

    const openEdit = (customer: Customer) => {
        setEditing(customer);
        setFormOpen(true);
    };

    const confirmDelete = (customer: Customer) => {
        setDeleting(customer);
        setDeleteOpen(true);
    };

    const openPreview = (customer: Customer) => {
        setViewing(customer);
        setPreviewOpen(true);
    };

    return (
        <>
            <Head title={t('title')} />

            <div className="flex flex-col space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <Heading
                        variant="small"
                        title={t('title')}
                        description={t('description')}
                    />

                    <Button
                        data-test="add-customer-button"
                        onClick={openCreate}
                    >
                        <Plus /> {t('addCustomer')}
                    </Button>
                </div>

                <div className="relative w-full sm:max-w-xs">
                    <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        type="search"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder={t('searchPlaceholder')}
                        className="pl-9"
                        data-test="customer-search-input"
                    />
                </div>

                <CustomersTable
                    customers={customers.data}
                    isFiltered={filters.search !== ''}
                    onView={openPreview}
                    onEdit={openEdit}
                    onDelete={confirmDelete}
                />

                {customers.total > 0 && (
                    <div className="flex items-center justify-between gap-4">
                        <p className="text-sm text-muted-foreground">
                            {t('pagination.showing', {
                                from: customers.from ?? 0,
                                to: customers.to ?? 0,
                                total: customers.total,
                            })}
                        </p>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={customers.current_page <= 1}
                                onClick={() =>
                                    goToPage(customers.current_page - 1)
                                }
                                data-test="customers-prev-page"
                            >
                                <ChevronLeft className="size-4" />{' '}
                                {t('pagination.previous')}
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={
                                    customers.current_page >=
                                    customers.last_page
                                }
                                onClick={() =>
                                    goToPage(customers.current_page + 1)
                                }
                                data-test="customers-next-page"
                            >
                                {t('pagination.next')}{' '}
                                <ChevronRight className="size-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            <CustomerFormDialog
                open={formOpen}
                onOpenChange={setFormOpen}
                customer={editing}
                teamSlug={teamSlug}
            />

            <DeleteCustomerModal
                customer={deleting}
                teamSlug={teamSlug}
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
            />

            <CustomerPreviewModal
                customer={viewing}
                open={previewOpen}
                onOpenChange={setPreviewOpen}
            />
        </>
    );
}

CustomersIndex.layout = (props: { currentTeam?: { slug: string } | null }) => ({
    breadcrumbs: [
        {
            title: 'Customers',
            href: props.currentTeam
                ? customersIndex(props.currentTeam.slug)
                : '/',
        },
    ],
});
