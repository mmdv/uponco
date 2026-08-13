export type MemberAccount = {
    id: number;
    name: string;
    email: string;
    avatar: string | null;
    role: string | null;
    role_label: string | null;
};

export type MemberProfile = {
    email: string | null;
    phone: string | null;
    job_title: string | null;
    description: string | null;
};

export type MemberLocation = { id: number; name: string; city: string | null };

export type MemberService = {
    id: number;
    title: string;
    category: string | null;
};

/** The member id, packaged as the single-element route argument tuple. */
export type SectionArg = [number];
