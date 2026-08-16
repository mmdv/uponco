import { ArrowDown } from 'lucide-react';
import {
    Checkbox,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from 'uponco';

export function AppointmentHeaders() {
    return (
        <div className="rounded-lg border">
            <Table>
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
                    <TableRow>
                        <TableCell className="font-medium">09:30</TableCell>
                        <TableCell>Deep Tissue Massage</TableCell>
                        <TableCell className="text-muted-foreground">
                            Ayla Rzayeva
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                            Leyla Hüseynova
                        </TableCell>
                        <TableCell className="border-l" />
                    </TableRow>
                    <TableRow>
                        <TableCell className="font-medium">11:00</TableCell>
                        <TableCell>Gel Manicure</TableCell>
                        <TableCell className="text-muted-foreground">
                            Nigar Əliyeva
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                            Səbinə Quliyeva
                        </TableCell>
                        <TableCell className="border-l" />
                    </TableRow>
                </TableBody>
            </Table>
        </div>
    );
}

export function SortableAndNumericHeaders() {
    return (
        <div className="rounded-lg border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Service</TableHead>
                        <TableHead>
                            <span className="inline-flex items-center gap-1">
                                Bookings
                                <ArrowDown className="size-3.5" />
                            </span>
                        </TableHead>
                        <TableHead className="text-right">Revenue</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow>
                        <TableCell className="font-medium">
                            Deep Tissue Massage
                        </TableCell>
                        <TableCell className="tabular-nums">17</TableCell>
                        <TableCell className="text-right tabular-nums">
                            2 040 ₼
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className="font-medium">
                            Gel Manicure
                        </TableCell>
                        <TableCell className="tabular-nums">29</TableCell>
                        <TableCell className="text-right tabular-nums">
                            1 305 ₼
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className="font-medium">
                            Beard Trim
                        </TableCell>
                        <TableCell className="tabular-nums">41</TableCell>
                        <TableCell className="text-right tabular-nums">
                            820 ₼
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </div>
    );
}

export function SelectionHeader() {
    return (
        <div className="rounded-lg border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-10">
                            <Checkbox aria-label="Select all customers" />
                        </TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Phone</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow>
                        <TableCell>
                            <Checkbox
                                defaultChecked
                                aria-label="Select Ayla Rzayeva"
                            />
                        </TableCell>
                        <TableCell className="font-medium">
                            Ayla Rzayeva
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                            +994 50 412 08 77
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>
                            <Checkbox aria-label="Select Nigar Əliyeva" />
                        </TableCell>
                        <TableCell className="font-medium">
                            Nigar Əliyeva
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                            +994 55 330 19 04
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </div>
    );
}
