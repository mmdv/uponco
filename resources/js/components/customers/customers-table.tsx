import { MoreHorizontal, Pencil, Search, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useTranslation } from '@/hooks/use-translation';
import type { Customer } from '@/types';

type Props = {
    customers: Customer[];
    isFiltered?: boolean;
    onView: (customer: Customer) => void;
    onEdit: (customer: Customer) => void;
    onDelete: (customer: Customer) => void;
};

export default function CustomersTable({
    customers,
    isFiltered = false,
    onView,
    onEdit,
    onDelete,
}: Props) {
    const { t } = useTranslation('customers');

    if (customers.length === 0) {
        return (
            <div className="rounded-lg border border-dashed p-10 text-center">
                <p className="text-sm text-muted-foreground">
                    {isFiltered ? t('table.emptyFiltered') : t('table.empty')}
                </p>
            </div>
        );
    }

    return (
        <div className="rounded-lg border">
            <Table containerClassName="overscroll-x-none">
                <TableHeader>
                    <TableRow>
                        <TableHead>{t('table.name')}</TableHead>
                        <TableHead>{t('table.email')}</TableHead>
                        <TableHead>{t('table.phone')}</TableHead>
                        <TableHead className="sticky right-0 z-20 w-0 border-l bg-background text-right">
                            <span className="sr-only">{t('table.actions')}</span>
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {customers.map((customer) => (
                        <TableRow
                            key={customer.id}
                            data-test="customer-row"
                            className="group/row cursor-pointer"
                            onClick={() => onView(customer)}
                        >
                            <TableCell className="font-medium">
                                {customer.name}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                                {customer.email ?? '—'}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                                {customer.phone ?? '—'}
                            </TableCell>
                            <TableCell className="sticky right-0 z-10 border-l bg-background text-right group-hover/row:bg-muted/50">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="size-8"
                                            data-test="customer-menu-button"
                                            aria-label={t('table.actions')}
                                            onClick={(event) =>
                                                event.stopPropagation()
                                            }
                                        >
                                            <MoreHorizontal className="size-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                        align="end"
                                        onClick={(event) =>
                                            event.stopPropagation()
                                        }
                                    >
                                        <DropdownMenuItem
                                            data-test="customer-view-button"
                                            onSelect={() => onView(customer)}
                                        >
                                            <Search className="size-4" />
                                            {t('table.view')}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            data-test="customer-edit-button"
                                            onSelect={() => onEdit(customer)}
                                        >
                                            <Pencil className="size-4" />
                                            {t('table.edit')}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            variant="destructive"
                                            data-test="customer-delete-button"
                                            onSelect={() => onDelete(customer)}
                                        >
                                            <Trash2 className="size-4" />
                                            {t('table.delete')}
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
