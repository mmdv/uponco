import { Form } from '@inertiajs/react';
import InputError from '@/components/input-error';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { store as storeMember } from '@/routes/company/business/members';
import type { Team } from '@/types';

type Props = {
    team: Team;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export default function AddMemberModal({ team, open, onOpenChange }: Props) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <Form
                    key={String(open)}
                    {...storeMember.form(team.slug)}
                    className="space-y-6"
                    onSuccess={() => onOpenChange(false)}
                >
                    {({ errors, processing }) => (
                        <>
                            <DialogHeader>
                                <DialogTitle>Add a team member</DialogTitle>
                                <DialogDescription>
                                    Create an account and add them to this team
                                    right away.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="grid gap-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="name">Name</Label>
                                        <Input
                                            id="name"
                                            name="name"
                                            data-test="member-name"
                                            placeholder="Jane"
                                            autoComplete="off"
                                            required
                                        />
                                        <InputError message={errors.name} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="surname">Surname</Label>
                                        <Input
                                            id="surname"
                                            name="surname"
                                            data-test="member-surname"
                                            placeholder="Doe"
                                            autoComplete="off"
                                        />
                                        <InputError message={errors.surname} />
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="job_title">Title</Label>
                                    <Input
                                        id="job_title"
                                        name="job_title"
                                        data-test="member-title"
                                        placeholder="Stylist"
                                        autoComplete="off"
                                    />
                                    <InputError message={errors.job_title} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email address</Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        data-test="member-email"
                                        placeholder="jane@example.com"
                                        autoComplete="off"
                                        required
                                    />
                                    <InputError message={errors.email} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        id="password"
                                        name="password"
                                        type="password"
                                        data-test="member-password"
                                        placeholder="••••••••"
                                        autoComplete="new-password"
                                        required
                                    />
                                    <InputError message={errors.password} />
                                </div>
                            </div>

                            <DialogFooter className="gap-2">
                                <DialogClose asChild>
                                    <Button variant="secondary">Cancel</Button>
                                </DialogClose>

                                <Button
                                    type="submit"
                                    data-test="member-submit"
                                    disabled={processing}
                                >
                                    Add member
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}
