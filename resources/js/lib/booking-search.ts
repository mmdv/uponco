import type { ServiceCategoryGroup } from '@/lib/appointments';

/**
 * Letters NFD can't take apart: they are separate letters, not a base letter
 * plus an accent, but a visitor on an English keyboard types the plain one.
 */
const LETTER_FOLDS: Record<string, string> = {
    ə: 'e',
    ı: 'i',
    ß: 'ss',
    ø: 'o',
    ł: 'l',
    đ: 'd',
};

/**
 * Fold text into the form search compares on: lowercase, accents stripped and
 * Azerbaijani/Turkish letters mapped to their Latin look-alikes, so "sac" finds
 * "Saç" and "uz" finds "Üz".
 */
export function normalizeSearch(value: string): string {
    return value
        .toLocaleLowerCase('en')
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .replace(/[əıßøłđ]/g, (letter) => LETTER_FOLDS[letter] ?? letter)
        .trim();
}

/** The query split into its normalised words; empty when there is nothing to search for. */
export function searchTerms(query: string): string[] {
    return normalizeSearch(query).split(/\s+/).filter(Boolean);
}

/**
 * Whether every word of the query appears in at least one of the fields, so
 * "laser face" finds "Face — Laser rejuvenation". An empty query matches all.
 */
export function matchesSearch(
    fields: (string | null | undefined)[],
    query: string,
): boolean {
    const terms = searchTerms(query);

    if (terms.length === 0) {
        return true;
    }

    const haystack = fields
        .filter((field): field is string => Boolean(field))
        .map(normalizeSearch)
        .join(' ');

    return terms.every((term) => haystack.includes(term));
}

/**
 * Narrow grouped services to one category (or all, with `null`) and a search
 * query. The category name counts as a searchable field, so "hair" lists the
 * whole Hair category; groups left empty are dropped.
 */
export function filterServiceGroups(
    groups: ServiceCategoryGroup[],
    query: string,
    categoryId: number | null,
): ServiceCategoryGroup[] {
    return groups
        .filter((group) => categoryId === null || group.id === categoryId)
        .map((group) => ({
            ...group,
            services: group.services.filter((service) =>
                matchesSearch(
                    [service.title, service.description, group.name],
                    query,
                ),
            ),
        }))
        .filter((group) => group.services.length > 0);
}

export type HighlightPart = { text: string; match: boolean };

/**
 * Split `text` into plain and matching parts for each query word, so the list
 * can bold what the visitor typed.
 *
 * Folding only ever maps one character to one (bar the rare `ß`), so positions
 * found in the folded text are the same in the original; when the lengths
 * differ the text is returned unhighlighted rather than cut in the wrong place.
 */
export function highlightParts(text: string, query: string): HighlightPart[] {
    const terms = searchTerms(query);
    const folded = Array.from(text)
        .map((char) => normalizeSearch(char) || char)
        .join('');

    if (terms.length === 0 || folded.length !== text.length) {
        return [{ text, match: false }];
    }

    const marked = new Array<boolean>(text.length).fill(false);

    for (const term of terms) {
        let from = folded.indexOf(term);

        while (from !== -1) {
            marked.fill(true, from, from + term.length);
            from = folded.indexOf(term, from + term.length);
        }
    }

    const parts: HighlightPart[] = [];

    for (let index = 0; index < text.length; index++) {
        const last = parts[parts.length - 1];

        if (last && last.match === marked[index]) {
            last.text += text[index];
        } else {
            parts.push({ text: text[index], match: marked[index] });
        }
    }

    return parts;
}
