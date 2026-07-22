import LegalLayout, { LegalSection } from '@/layouts/legal-layout';

export default function Privacy() {
    return (
        <LegalLayout title="Privacy Policy" lastUpdated="19 July 2026">
            <p className="mb-6 text-lg leading-relaxed text-muted-foreground">
                This Privacy Policy explains how Uponco (“Uponco”, “we”, “us” or
                “our”) collects, uses and protects personal data when you use
                our appointment-booking platform (the “Service”). We are
                committed to handling your data transparently and in accordance
                with the EU General Data Protection Regulation (GDPR) and
                applicable data protection laws.
            </p>

            <LegalSection id="who-we-are" heading="1. Who we are">
                <p>
                    Uponco provides software that lets businesses publish their
                    services and locations and accept online and onsite
                    appointments from their customers. For personal data that
                    businesses collect about their own customers through the
                    Service, the business acts as the data controller and Uponco
                    acts as a data processor. For account and platform data
                    described below, Uponco is the data controller.
                </p>
                <p>
                    For any privacy questions or to exercise your rights,
                    contact us at{' '}
                    <a
                        href="mailto:support@uponco.com"
                        className="font-medium text-primary hover:underline"
                    >
                        support@uponco.com
                    </a>
                    .
                </p>
            </LegalSection>

            <LegalSection id="data-we-collect" heading="2. Data we collect">
                <p>We collect the following categories of personal data:</p>
                <ul className="list-disc space-y-2 pl-5">
                    <li>
                        <span className="font-medium text-foreground">
                            Account data.
                        </span>{' '}
                        Name, email address, password (stored hashed) and
                        profile details you provide when registering.
                    </li>
                    <li>
                        <span className="font-medium text-foreground">
                            Business data.
                        </span>{' '}
                        Company name, branding, locations, services, working
                        hours and team members you configure.
                    </li>
                    <li>
                        <span className="font-medium text-foreground">
                            Booking data.
                        </span>{' '}
                        Customer names, contact details, appointment times,
                        service selections and notes submitted through booking
                        pages.
                    </li>
                    <li>
                        <span className="font-medium text-foreground">
                            Technical data.
                        </span>{' '}
                        IP address, device and browser information, and log data
                        generated when you use the Service.
                    </li>
                    <li>
                        <span className="font-medium text-foreground">
                            Third-party sign-in.
                        </span>{' '}
                        If you sign in with a third-party provider, we receive
                        basic profile information such as your name and email.
                    </li>
                    <li>
                        <span className="font-medium text-foreground">
                            Usage and analytics data.
                        </span>{' '}
                        Pages viewed, features used and similar
                        product-analytics events, which we may associate with
                        your account and team so we can understand how the
                        Service is used. See{' '}
                        <a
                            href="#cookies"
                            className="font-medium text-primary hover:underline"
                        >
                            Cookies and analytics
                        </a>
                        .
                    </li>
                </ul>
            </LegalSection>

            <LegalSection
                id="how-we-use-data"
                heading="3. How we use your data"
            >
                <p>We process personal data to:</p>
                <ul className="list-disc space-y-2 pl-5">
                    <li>Provide, operate and maintain the Service;</li>
                    <li>
                        Create and manage accounts, teams and business profiles;
                    </li>
                    <li>
                        Enable appointment booking and send related
                        confirmations, reminders and generated meeting links;
                    </li>
                    <li>
                        Respond to support requests and communicate with you;
                    </li>
                    <li>
                        Secure the Service, prevent abuse and comply with legal
                        obligations;
                    </li>
                    <li>Improve and develop new features.</li>
                </ul>
            </LegalSection>

            <LegalSection id="legal-bases" heading="4. Legal bases (GDPR)">
                <p>
                    Under the GDPR, we rely on the following legal bases for
                    processing:
                </p>
                <ul className="list-disc space-y-2 pl-5">
                    <li>
                        <span className="font-medium text-foreground">
                            Performance of a contract
                        </span>{' '}
                        — to provide the Service you or your business sign up
                        for;
                    </li>
                    <li>
                        <span className="font-medium text-foreground">
                            Legitimate interests
                        </span>{' '}
                        — to secure, maintain and improve the Service, balanced
                        against your rights;
                    </li>
                    <li>
                        <span className="font-medium text-foreground">
                            Consent
                        </span>{' '}
                        — where required, for example for certain communications
                        (which you may withdraw at any time);
                    </li>
                    <li>
                        <span className="font-medium text-foreground">
                            Legal obligation
                        </span>{' '}
                        — to comply with applicable law.
                    </li>
                </ul>
            </LegalSection>

            <LegalSection id="payments" heading="5. Payments">
                <p>
                    The Service does not currently process payments. In the
                    future, Uponco intends to offer subscription-based paid
                    plans. When payment features are introduced, billing will be
                    handled by a third-party payment processor, and this Privacy
                    Policy will be updated to describe how payment-related data
                    is processed. We do not store full card details on our own
                    servers.
                </p>
            </LegalSection>

            <LegalSection id="sharing" heading="6. How we share data">
                <p>We do not sell your personal data. We share it only with:</p>
                <ul className="list-disc space-y-2 pl-5">
                    <li>
                        The business you book with (and its authorised team
                        members) when you submit a booking;
                    </li>
                    <li>
                        Service providers who process data on our behalf, under
                        appropriate data-processing agreements. These currently
                        cover hosting, email delivery, product analytics
                        (PostHog) and Google services described below;
                    </li>
                    <li>
                        <span className="font-medium text-foreground">
                            Google.
                        </span>{' '}
                        If a business connects its Google account, we create
                        calendar events with Google Meet links in that account;
                        the event contains the service name, the business name,
                        the appointment time and any notes on the booking. When
                        a business searches for an address while setting up a
                        location, the text typed into the address field is sent
                        to the Google Places API to return suggestions. If you
                        sign in with Google, Google processes that sign-in;
                    </li>
                    <li>
                        Authorities or third parties where required by law or to
                        protect our rights and the safety of users.
                    </li>
                </ul>
            </LegalSection>

            <LegalSection id="transfers" heading="7. International transfers">
                <p>
                    Where personal data is transferred outside the European
                    Economic Area, we rely on appropriate safeguards such as the
                    European Commission’s Standard Contractual Clauses or
                    transfers to countries with an adequacy decision.
                </p>
            </LegalSection>

            <LegalSection id="retention" heading="8. Data retention">
                <p>
                    We retain personal data for as long as needed to provide the
                    Service and for legitimate business or legal purposes.
                    Account and business data is kept while your account is
                    active; you may request deletion as described below. Booking
                    data is stored by us on behalf of the business you booked
                    with and is kept for as long as that business keeps its
                    account and its own retention settings require, so requests
                    to delete a booking are decided by that business. We may
                    keep limited records longer where the law requires it.
                </p>
            </LegalSection>

            <LegalSection id="your-rights" heading="9. Your rights">
                <p>
                    Subject to applicable law, you have the right to access,
                    rectify, erase, restrict or object to the processing of your
                    personal data, to data portability, and to withdraw consent.
                    You also have the right to lodge a complaint with your local
                    data protection authority. To exercise any of these rights,
                    contact{' '}
                    <a
                        href="mailto:support@uponco.com"
                        className="font-medium text-primary hover:underline"
                    >
                        support@uponco.com
                    </a>
                    . If your data was submitted to a business through a
                    booking, please also contact that business directly.
                </p>
            </LegalSection>

            <LegalSection id="security" heading="10. Security">
                <p>
                    We use appropriate technical and organisational measures —
                    including encryption in transit, hashed passwords and access
                    controls — to protect personal data. No method of
                    transmission or storage is completely secure, and we cannot
                    guarantee absolute security.
                </p>
            </LegalSection>

            <LegalSection id="cookies" heading="11. Cookies and analytics">
                <p>
                    We use strictly necessary cookies to keep you signed in and
                    to operate the Service securely. These are set without
                    consent because the Service cannot work without them.
                </p>
                <p>
                    We also use a product-analytics service, PostHog, to
                    understand how the Service is used and to improve it.
                    PostHog processes data on our behalf as a processor, on
                    servers located in the European Union. It records events
                    such as page views, the pages and features you use and,
                    where you are signed in, an identifier for your account and
                    team. On public booking pages it also records which business
                    the page belongs to.
                </p>
                <p>
                    Analytics cookies are only set after you accept them in the
                    cookie banner. Until you make a choice, and if you decline,
                    analytics runs without cookies and without storing an
                    identifier on your device — which means we can still count
                    the visit but cannot recognise you when you return. Inside
                    the embedded booking widget analytics is always cookieless.
                    You can change your decision at any time by clearing this
                    site's data in your browser, and your browser settings let
                    you control cookies generally, though disabling essential
                    cookies will affect functionality.
                </p>
                <p>
                    We do not use cookies for advertising and we do not run
                    advertising or cross-site tracking networks.
                </p>
            </LegalSection>

            <LegalSection id="children" heading="12. Children">
                <p>
                    The Service is not directed to children under 16, and we do
                    not knowingly collect their personal data. If you believe a
                    child has provided us with personal data, please contact us
                    so we can delete it.
                </p>
            </LegalSection>

            <LegalSection id="changes" heading="13. Changes to this policy">
                <p>
                    We may update this Privacy Policy from time to time.
                    Material changes will be communicated through the Service or
                    by email, and the “Last updated” date above will reflect the
                    latest revision.
                </p>
            </LegalSection>

            <LegalSection id="contact" heading="14. Contact us">
                <p>
                    If you have questions about this Privacy Policy or how we
                    handle your data, contact us at{' '}
                    <a
                        href="mailto:support@uponco.com"
                        className="font-medium text-primary hover:underline"
                    >
                        support@uponco.com
                    </a>
                    .
                </p>
            </LegalSection>
        </LegalLayout>
    );
}
