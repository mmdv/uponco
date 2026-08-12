import { router } from '@inertiajs/react';
import { LogOut } from 'lucide-react';
import { useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserInfo } from '@/components/user-info';
import { useInitials } from '@/hooks/use-initials';
import { logout } from '@/routes';
import type { User } from '@/types';

type Props = {
    user: User;
};

/**
 * Account button shown in the corner of the onboarding card. Onboarding sits
 * outside the app shell (and its user menu), so this is the only way to sign
 * out mid-setup: the avatar opens a menu, and logging out confirms first, since
 * leaving abandons the current screen.
 */
export default function OnboardingUserMenu({ user }: Props) {
    const getInitials = useInitials();
    const [confirmOpen, setConfirmOpen] = useState(false);
    const hasAvatar = Boolean(user.avatar && user.avatar !== '');

    const signOut = () => {
        // Drop any in-flight prefetch/poll work before the session ends.
        router.flushAll();
        router.post(logout.url());
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute top-2.5 right-2.5 z-30 rounded-full md:top-3 md:right-3"
                        aria-label="Account"
                        data-test="onboarding-user-menu"
                    >
                        <Avatar className="size-8 rounded-full">
                            {hasAvatar ? (
                                <AvatarImage
                                    src={user.avatar}
                                    alt={user.name}
                                />
                            ) : null}
                            <AvatarFallback className="rounded-full text-xs text-black dark:text-white">
                                {getInitials(user.name)}
                            </AvatarFallback>
                        </Avatar>
                    </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="min-w-56">
                    <DropdownMenuLabel className="p-0 font-normal">
                        <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                            <UserInfo user={user} showEmail={true} />
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        variant="destructive"
                        className="cursor-pointer"
                        onSelect={() => setConfirmOpen(true)}
                        data-test="onboarding-logout"
                    >
                        <LogOut className="mr-2" />
                        Log out
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>You are leaving onboarding</DialogTitle>
                        <DialogDescription>
                            Your progress is saved. You can sign back in and
                            finish setting up your business whenever you are
                            ready.
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter className="gap-2">
                        <DialogClose asChild>
                            <Button variant="secondary">Keep setting up</Button>
                        </DialogClose>

                        <Button
                            variant="destructive"
                            onClick={signOut}
                            data-test="onboarding-sign-out-confirm"
                        >
                            Yes, I&apos;ll continue setup later
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
