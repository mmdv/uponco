import { MoreHorizontal } from 'lucide-react';
import {
    Badge,
    Button,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from 'uponco';

export function AppointmentCells() {
    const rows = [
        {
            id: 1,
            time: '09:30',
            duration: '1 hr',
            service: 'Deep Tissue Massage',
            customer: 'Ayla Rzayeva',
        },
        {
            id: 2,
            time: '11:00',
            duration: '45 min',
            service: 'Gel Manicure',
            customer: 'Nigar Əliyeva',
        },
        {
            id: 3,
            time: '15:45',
            duration: '30 min',
            service: 'Beard Trim',
            customer: 'Rəşad Məmmədov',
        },
    ];

    return (
        <div className="rounded-lg border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Time</TableHead>
                        <TableHead>Service</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead className="w-0 border-l text-right">
                            <span className="sr-only">Actions</span>
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {rows.map((row) => (
                        <TableRow key={row.id}>
                            <TableCell className="align-top">
                                <div className="font-medium">{row.time}</div>
                                <div className="text-xs text-muted-foreground">
                                    {row.duration}
                                </div>
                            </TableCell>
                            <TableCell className="align-top font-medium">
                                {row.service}
                            </TableCell>
                            <TableCell className="align-top text-muted-foreground">
                                {row.customer}
                            </TableCell>
                            <TableCell className="border-l text-right align-top">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-8"
                                    aria-label="Appointment actions"
                                >
                                    <MoreHorizontal className="size-4" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

export function AlignmentAndSpan() {
    return (
        <div className="rounded-lg border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Service</TableHead>
                        <TableHead>Specialist</TableHead>
                        <TableHead className="text-right">Revenue</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                        <TableCell
                            colSpan={3}
                            className="py-2 text-xs font-medium tracking-wide text-muted-foreground"
                        >
                            August 2026 — Nizami Studio
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className="font-medium">
                            Deep Tissue Massage
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                            Leyla Hüseynova
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                            2 040 ₼
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className="font-medium">
                            Gel Manicure
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                            Səbinə Quliyeva
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                            1 305 ₼
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell colSpan={2} className="font-medium">
                            Total
                        </TableCell>
                        <TableCell className="text-right font-medium tabular-nums">
                            3 345 ₼
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </div>
    );
}

export function CellsWithBadges() {
    return (
        <div className="rounded-lg border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead>Last visit</TableHead>
                        <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow>
                        <TableCell className="font-medium">
                            Ayla Rzayeva
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                            12 August 2026
                        </TableCell>
                        <TableCell className="text-right">
                            <Badge>Confirmed</Badge>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className="font-medium">
                            Nigar Əliyeva
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                            29 July 2026
                        </TableCell>
                        <TableCell className="text-right">
                            <Badge variant="secondary">Pending</Badge>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className="font-medium">
                            Rəşad Məmmədov
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                            3 June 2026
                        </TableCell>
                        <TableCell className="text-right">
                            <Badge variant="destructive">No-show</Badge>
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </div>
    );
}
