import {
    Badge,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from 'uponco';

const services = [
    { id: 1, title: 'Deep Tissue Massage', duration: '1 hr 30 min', price: '120 ₼', status: 'Active' },
    { id: 2, title: 'Swedish Massage', duration: '1 hr', price: '80 ₼', status: 'Active' },
    { id: 3, title: 'Gel Manicure', duration: '45 min', price: '45 ₼', status: 'Active' },
    { id: 4, title: 'Hot Stone Therapy', duration: '1 hr 15 min', price: '150 ₼', status: 'Hidden' },
];

export function ServicesBody() {
    return (
        <div className="rounded-lg border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Service</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {services.map((service) => (
                        <TableRow key={service.id}>
                            <TableCell className="font-medium">
                                {service.title}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                                {service.duration}
                            </TableCell>
                            <TableCell>{service.price}</TableCell>
                            <TableCell className="text-right">
                                <Badge
                                    variant={
                                        service.status === 'Active'
                                            ? 'default'
                                            : 'secondary'
                                    }
                                >
                                    {service.status}
                                </Badge>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

export function GroupedBody() {
    return (
        <div className="rounded-lg border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Time</TableHead>
                        <TableHead>Service</TableHead>
                        <TableHead>Customer</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                        <TableCell
                            colSpan={3}
                            className="py-2 text-xs font-medium tracking-wide text-muted-foreground"
                        >
                            Today, 16 August
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className="font-medium">10:00</TableCell>
                        <TableCell>Gel Manicure</TableCell>
                        <TableCell className="text-muted-foreground">
                            Nigar Əliyeva
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className="font-medium">14:30</TableCell>
                        <TableCell>Deep Tissue Massage</TableCell>
                        <TableCell className="text-muted-foreground">
                            Ayla Rzayeva
                        </TableCell>
                    </TableRow>
                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                        <TableCell
                            colSpan={3}
                            className="py-2 text-xs font-medium tracking-wide text-muted-foreground"
                        >
                            Tomorrow, 17 August
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className="font-medium">09:15</TableCell>
                        <TableCell>Beard Trim</TableCell>
                        <TableCell className="text-muted-foreground">
                            Rəşad Məmmədov
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </div>
    );
}

export function EmptyBody() {
    return (
        <div className="rounded-lg border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Time</TableHead>
                        <TableHead>Service</TableHead>
                        <TableHead>Customer</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow className="hover:bg-transparent">
                        <TableCell
                            colSpan={3}
                            className="h-28 text-center text-sm whitespace-normal text-muted-foreground"
                        >
                            No appointments booked for this week yet.
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </div>
    );
}
