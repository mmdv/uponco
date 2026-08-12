import AuthLayoutTemplate from '@/layouts/auth/auth-card-layout';

export default function AuthLayout({
    title = '',
    description = '',
    showAccountMenu = false,
    children,
}: {
    title?: string;
    description?: string;
    showAccountMenu?: boolean;
    children: React.ReactNode;
}) {
    return (
        <AuthLayoutTemplate
            title={title}
            description={description}
            showAccountMenu={showAccountMenu}
        >
            {children}
        </AuthLayoutTemplate>
    );
}
