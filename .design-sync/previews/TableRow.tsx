import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from 'uponco';

export function CustomerRows() {
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
            email: 'rashad.m@example.com',
            phone: '+994 70 288 45 12',
        },
        {
            id: 4,
            name: 'Kamran Əsgərov',
            email: 'kamran@example.com',
            phone: '+994 51 907 66 30',
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
                        <TableRow key={customer.id} className="cursor-pointer">
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

export function RowStates() {
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
                            Day header row — Monday, 18 August
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className="font-medium">09:30</TableCell>
                        <TableCell>Deep Tissue Massage</TableCell>
                        <TableCell className="text-muted-foreground">
                            Ayla Rzayeva
                        </TableCell>
                    </TableRow>
                    <TableRow data-state="selected">
                        <TableCell className="font-medium">11:00</TableCell>
                        <TableCell>Gel Manicure</TableCell>
                        <TableCell className="text-muted-foreground">
                            Nigar Əliyeva
                        </TableCell>
                    </TableRow>
                    <TableRow className="opacity-60">
                        <TableCell className="font-medium line-through">
                            13:15
                        </TableCell>
                        <TableCell className="line-through">
                            Beard Trim
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                            Cancelled
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </div>
    );
}
