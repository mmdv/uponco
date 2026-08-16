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

const CUSTOMERS = [
    { name: 'Ayla Rzayeva', email: 'ayla.rzayeva@gmail.com', phone: '+994 50 233 18 04' },
    { name: 'Kamran Huseynov', email: 'kamran.h@outlook.com', phone: '+994 55 741 92 30' },
    { name: 'Nigar Mammadli', email: 'nigar.mammadli@mail.ru', phone: '—' },
];

export function CustomersTable() {
    return (
        <div className="w-full max-w-3xl rounded-lg border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead className="w-0 text-right">
                            <span className="sr-only">Actions</span>
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {CUSTOMERS.map((customer) => (
                        <TableRow key={customer.email}>
                            <TableCell className="font-medium">
                                {customer.name}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                                {customer.email}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                                {customer.phone}
                            </TableCell>
                            <TableCell className="text-right">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-8"
                                    aria-label="Customer actions"
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

const APPOINTMENTS = [
    {
        time: '09:30',
        customer: 'Ayla Rzayeva',
        service: 'Deep Tissue Massage',
        specialist: 'Leyla Aliyeva',
        status: 'Confirmed',
        tone: 'default' as const,
    },
    {
        time: '11:00',
        customer: 'Kamran Huseynov',
        service: 'Beard Trim',
        specialist: 'Rashad Guliyev',
        status: 'Pending',
        tone: 'secondary' as const,
    },
    {
        time: '14:15',
        customer: 'Nigar Mammadli',
        service: 'Balayage',
        specialist: 'Leyla Aliyeva',
        status: 'Cancelled',
        tone: 'destructive' as const,
    },
];

export function AppointmentsTable() {
    return (
        <div className="w-full max-w-3xl rounded-lg border">
            <Table>
                <TableHeader className="bg-muted/50">
                    <TableRow>
                        <TableHead>Time</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Service</TableHead>
                        <TableHead>Specialist</TableHead>
                        <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {APPOINTMENTS.map((appointment) => (
                        <TableRow key={appointment.time}>
                            <TableCell className="font-medium tabular-nums">
                                {appointment.time}
                            </TableCell>
                            <TableCell>{appointment.customer}</TableCell>
                            <TableCell className="text-muted-foreground">
                                {appointment.service}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                                {appointment.specialist}
                            </TableCell>
                            <TableCell className="text-right">
                                <Badge variant={appointment.tone}>
                                    {appointment.status}
                                </Badge>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
