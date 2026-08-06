import { Head } from '@inertiajs/react';
import { FolderPlus, Plus } from 'lucide-react';
import { useState } from 'react';

import Heading from '@/components/heading';
import CategoryFormDialog from '@/components/services/category-form-dialog';
import DeleteCategoryModal from '@/components/services/delete-category-modal';
import DeleteServiceModal from '@/components/services/delete-service-modal';
import ServiceFormDrawer from '@/components/services/service-form-drawer';
import ServiceWizardDialog from '@/components/services/service-wizard/service-wizard-dialog';
import ServicesList from '@/components/services/services-list';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/use-translation';
import { index as companyIndex } from '@/routes/company';
import { index as servicesIndex } from '@/routes/company/services';
import type {
    GoogleIntegrationStatus,
    SelectOption,
    Service,
    ServiceCategory,
} from '@/types';

type Props = {
    categories: ServiceCategory[];
    services: Service[];
    locations: SelectOption[];
    specialists: SelectOption[];
    countries: SelectOption[];
    priceTypes: SelectOption[];
    currencies: SelectOption[];
    serviceTypes: SelectOption[];
    deliveryTypes: SelectOption[];
    meetingProviders: SelectOption[];
    google: GoogleIntegrationStatus;
};

export default function ServicesIndex({
    categories,
    services,
    locations,
    specialists,
    countries,
    priceTypes,
    currencies,
    serviceTypes,
    deliveryTypes,
    meetingProviders,
    google,
}: Props) {
    const { t } = useTranslation('company');

    const [serviceWizardOpen, setServiceWizardOpen] = useState(false);
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
        setDefaultCategoryId(categoryId);
        setServiceWizardOpen(true);
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

    /** The location drawer opened from the wizard attaches existing services. */
    const serviceOptions: SelectOption[] = services.map((service) => ({
        value: service.id.toString(),
        label: service.title,
    }));

    const deletingCategoryServiceCount = deletingCategory
        ? services.filter(
              (service) => service.service_category_id === deletingCategory.id,
          ).length
        : 0;

    return (
        <>
            <Head title={t('services.title')} />

            <div className="flex flex-col space-y-6 p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <Heading
                        variant="small"
                        title={t('services.title')}
                        description={t('services.description')}
                    />

                    {/*
                     * On a phone the two actions sit in their own full-width row
                     * under the title, splitting the space evenly so neither
                     * label gets clipped; from sm up they shrink to their labels
                     * and move beside the heading.
                     */}
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            className="flex-1 sm:flex-none"
                            data-test="add-category-button"
                            onClick={openCreateCategory}
                        >
                            <FolderPlus /> {t('services.addCategory')}
                        </Button>
                        <Button
                            className="flex-1 sm:flex-none"
                            data-test="add-service-button"
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
                    google={google}
                    onAddService={openCreateService}
                    onEditService={openEditService}
                    onDeleteService={confirmDeleteService}
                    onEditCategory={openEditCategory}
                    onDeleteCategory={confirmDeleteCategory}
                />
            </div>

            <ServiceWizardDialog
                open={serviceWizardOpen}
                onOpenChange={setServiceWizardOpen}
                defaultCategoryId={defaultCategoryId}
                categories={categories}
                locations={locations}
                serviceOptions={serviceOptions}
                specialists={specialists}
                countries={countries}
                priceTypes={priceTypes}
                currencies={currencies}
                serviceTypes={serviceTypes}
                google={google}
            />

            <ServiceFormDrawer
                open={serviceFormOpen}
                onOpenChange={setServiceFormOpen}
                service={editingService}
                defaultCategoryId={defaultCategoryId}
                categories={categories}
                locations={locations}
                specialists={specialists}
                priceTypes={priceTypes}
                currencies={currencies}
                serviceTypes={serviceTypes}
                deliveryTypes={deliveryTypes}
                meetingProviders={meetingProviders}
            />

            <DeleteServiceModal
                service={deletingService}
                open={deleteServiceOpen}
                onOpenChange={setDeleteServiceOpen}
            />

            <CategoryFormDialog
                open={categoryFormOpen}
                onOpenChange={setCategoryFormOpen}
                category={editingCategory}
            />

            <DeleteCategoryModal
                category={deletingCategory}
                serviceCount={deletingCategoryServiceCount}
                open={deleteCategoryOpen}
                onOpenChange={setDeleteCategoryOpen}
            />
        </>
    );
}

ServicesIndex.layout = () => ({
    breadcrumbs: [
        {
            title: 'Company',
            href: companyIndex(),
        },
        {
            title: 'Services',
            href: servicesIndex(),
        },
    ],
});
