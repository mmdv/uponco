import { highlightParts } from '@/lib/booking-search';

type Props = {
    text: string;
    query: string;
};

/** Renders `text` with whatever the visitor searched for picked out. */
export default function Highlight({ text, query }: Props) {
    const parts = highlightParts(text, query);

    if (parts.length === 1 && !parts[0].match) {
        return text;
    }

    return parts.map((part, index) =>
        part.match ? (
            <mark
                key={index}
                className="rounded-[3px] bg-primary/15 px-px font-semibold text-foreground"
            >
                {part.text}
            </mark>
        ) : (
            <span key={index}>{part.text}</span>
        ),
    );
}
