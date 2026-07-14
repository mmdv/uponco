import { Head, usePage } from '@inertiajs/react';
import { FolderPlus, Plus } from 'lucide-react';
import { useState } from 'react';

import Heading from '@/components/heading';
import CategoryFormDialog from '@/components/services/category-form-dialog';
import DeleteCategoryModal from '@/components/services/delete-category-modal';
import DeleteServiceModal from '@/components/services/delete-service-modal';
import ServiceFormDrawer from '@/components/services/service-form-drawer';
import ServicesList from '@/components/services/services-list';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/use-translation';
import { index as companyIndex } from '@/routes/company';
import { index as servicesIndex } from '@/routes/company/services';
import type { SelectOption, Service, ServiceCategory } from '@/types';

type Props = {
    categories: ServiceCategory[];
    services: Service[];
    locations: SelectOption[];
    specialists: SelectOption[];
    priceTypes: SelectOption[];
    serviceTypes: SelectOption[];
    deliveryTypes: SelectOption[];
    meetingProviders: SelectOption[];
};

export default function ServicesIndex({
    categories,
    services,
    locations,
    specialists,
    priceTypes,
    serviceTypes,
    deliveryTypes,
    meetingProviders,
}: Props) {
    const { t } = useTranslation('company');
    const { currentTeam } = usePage().props;
    const teamSlug = currentTeam?.slug ?? '';

    const [serviceFormOpen, setServiceFormOpen] = useState(false);
    const [editingService, setEditingService] = useState<Service | null>(null);
    const [defaultCategoryId, setDefaultCategoryId] = useState<number | null>(
        null,
    );

    const [deleteServiceOpen, setDeleteServiceOpen] = useState(false);
    const [deletingService, setDeletingService] = useState<Service | null>(
        null,
    );

    const [categoryFormOpen, setCategoryFormOpen] = useState(false);
    const [editingCategory, setEditingCategory] =
        useState<ServiceCategory | null>(null);

    const [deleteCategoryOpen, setDeleteCategoryOpen] = useState(false);
    const [deletingCategory, setDeletingCategory] =
        useState<ServiceCategory | null>(null);

    const openCreateService = (categoryId: number | null = null) => {
        setEditingService(null);
        setDefaultCategoryId(categoryId);
        setServiceFormOpen(true);
    };

    const openEditService = (service: Service) => {
        setEditingService(service);
        setDefaultCategoryId(null);
        setServiceFormOpen(true);
    };

    const confirmDeleteService = (service: Service) => {
        setDeletingService(service);
        setDeleteServiceOpen(true);
    };

    const openCreateCategory = () => {
        setEditingCategory(null);
        setCategoryFormOpen(true);
    };

    const openEditCategory = (category: ServiceCategory) => {
        setEditingCategory(category);
        setCategoryFormOpen(true);
    };

    const confirmDeleteCategory = (category: ServiceCategory) => {
        setDeletingCategory(category);
        setDeleteCategoryOpen(true);
    };

    const hasCategories = categories.length > 0;

    const deletingCategoryServiceCount = deletingCategory
        ? services.filter(
              (service) => service.service_category_id === deletingCategory.id,
          ).length
        : 0;

    return (
        <>
            <Head title={t('services.title')} />

            <div className="flex flex-col space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <Heading
                        variant="small"
                        title={t('services.title')}
                        description={t('services.description')}
                    />

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            data-test="add-category-button"
                            onClick={openCreateCategory}
                        >
                            <FolderPlus /> {t('services.addCategory')}
                        </Button>
                        <Button
                            data-test="add-service-button"
                            disabled={!hasCategories}
                            onClick={() => openCreateService()}
                        >
                            <Plus /> {t('services.addService')}
                        </Button>
                    </div>
                </div>

                <ServicesList
                    categories={categories}
                    services={services}
                    meetingProviders={meetingProviders}
                    onAddService={openCreateService}
                    onEditService={openEditService}
                    onDeleteService={confirmDeleteService}
                    onEditCategory={openEditCategory}
                    onDeleteCategory={confirmDeleteCategory}
                />
            </div>

            <ServiceFormDrawer
                open={serviceFormOpen}
                onOpenChange={setServiceFormOpen}
                service={editingService}
                defaultCategoryId={defaultCategoryId}
                teamSlug={teamSlug}
                categories={categories}
                locations={locations}
                specialists={specialists}
                priceTypes={priceTypes}
                serviceTypes={serviceTypes}
                deliveryTypes={deliveryTypes}
                meetingProviders={meetingProviders}
            />

            <DeleteServiceModal
                service={deletingService}
                teamSlug={teamSlug}
                open={deleteServiceOpen}
                onOpenChange={setDeleteServiceOpen}
            />

            <CategoryFormDialog
                open={categoryFormOpen}
                onOpenChange={setCategoryFormOpen}
                category={editingCategory}
                teamSlug={teamSlug}
            />

            <DeleteCategoryModal
                category={deletingCategory}
                serviceCount={deletingCategoryServiceCount}
                teamSlug={teamSlug}
                open={deleteCategoryOpen}
                onOpenChange={setDeleteCategoryOpen}
            />
        </>
    );
}

ServicesIndex.layout = (props: { currentTeam?: { slug: string } | null }) => ({
    breadcrumbs: [
        {
            title: 'Company',
            href: props.currentTeam
                ? companyIndex(props.currentTeam.slug)
                : '/',
        },
        {
            title: 'Services',
            href: props.currentTeam
                ? servicesIndex(props.currentTeam.slug)
                : '/',
        },
    ],
});
