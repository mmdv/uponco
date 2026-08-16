import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from 'uponco';

export function Default() {
    return (
        <Breadcrumb>
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink href="/company">Company</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                    <BreadcrumbLink href="/company/locations">
                        Locations
                    </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                    <BreadcrumbPage>Nizami Street Studio</BreadcrumbPage>
                </BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>
    );
}

export function CustomGlyph() {
    return (
        <Breadcrumb>
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink href="/company">Company</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator>
                    <span className="text-muted-foreground/60">/</span>
                </BreadcrumbSeparator>
                <BreadcrumbItem>
                    <BreadcrumbLink href="/company/services">
                        Services
                    </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator>
                    <span className="text-muted-foreground/60">/</span>
                </BreadcrumbSeparator>
                <BreadcrumbItem>
                    <BreadcrumbPage>Gel Manicure</BreadcrumbPage>
                </BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>
    );
}
