import { MoreHorizontal } from 'lucide-react';
import {
    Button,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from 'uponco';

const appointments = [
    {
        id: 1,
        time: '09:30',
        duration: '1 hr',
        service: 'Deep Tissue Massage',
        location: 'Nizami Studio',
        customer: 'Ayla Rzayeva',
        specialist: 'Leyla Hüseynova',
    },
    {
        id: 2,
        time: '11:00',
        duration: '45 min',
        service: 'Gel Manicure',
        location: 'Nizami Studio',
        customer: 'Nigar Əliyeva',
        specialist: 'Səbinə Quliyeva',
    },
    {
        id: 3,
        time: '13:15',
        duration: '30 min',
        service: 'Beard Trim',
        location: 'Port Baku Kiosk',
        customer: 'Rəşad Məmmədov',
        specialist: 'Kamran Əsgərov',
    },
];

export function AppointmentsTable() {
    return (
        <div className="rounded-lg border">
            <Table containerClassName="overscroll-x-none">
                <TableHeader>
                    <TableRow>
                        <TableHead>Time</TableHead>
                        <TableHead>Service</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Specialist</TableHead>
                        <TableHead className="w-0 border-l text-right">
                            <span className="sr-only">Actions</span>
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                        <TableCell
                            colSpan={5}
                            className="py-2 text-xs font-medium tracking-wide text-muted-foreground"
                        >
                            Monday, 18 August
                        </TableCell>
                    </TableRow>
                    {appointments.map((appointment) => (
                        <TableRow key={appointment.id}>
                            <TableCell className="align-top">
                                <div className="font-medium">
                                    {appointment.time}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    {appointment.duration}
                                </div>
                            </TableCell>
                            <TableCell className="align-top">
                                <div className="font-medium">
                                    {appointment.service}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    @ {appointment.location}
                                </div>
                            </TableCell>
                            <TableCell className="align-top font-medium">
                                {appointment.customer}
                            </TableCell>
                            <TableCell className="align-top text-muted-foreground">
                                {appointment.specialist}
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

export function CustomersTable() {
    const customers = [
        {
            id: 1,
            name: 'Ayla Rzayeva',
            email: 'ayla.rzayeva@example.com',
            phone: '+994 50 412 08 77',
        },
        {
            id: 2,
            name: 'Nigar Əliyeva',
            email: 'nigar@example.com',
            phone: '+994 55 330 19 04',
        },
        {
            id: 3,
            name: 'Rəşad Məmmədov',
            email: '—',
            phone: '+994 70 288 45 12',
        },
    ];

    return (
        <div className="rounded-lg border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {customers.map((customer) => (
                        <TableRow key={customer.id}>
                            <TableCell className="font-medium">
                                {customer.name}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                                {customer.email}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                                {customer.phone}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

export function SelectedRow() {
    return (
        <div className="rounded-lg border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Service</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow>
                        <TableCell className="font-medium">
                            Swedish Massage
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                            1 hr
                        </TableCell>
                        <TableCell className="text-right">80 ₼</TableCell>
                    </TableRow>
                    <TableRow data-state="selected">
                        <TableCell className="font-medium">
                            Deep Tissue Massage
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                            1 hr 30 min
                        </TableCell>
                        <TableCell className="text-right">120 ₼</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className="font-medium">
                            Gel Manicure
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                            45 min
                        </TableCell>
                        <TableCell className="text-right">45 ₼</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </div>
    );
}
