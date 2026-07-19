import { Link } from '@inertiajs/react';
import LegalLayout, { LegalSection } from '@/layouts/legal-layout';
import { privacy } from '@/routes';

export default function Terms() {
    return (
        <LegalLayout title="Terms & Conditions" lastUpdated="7 July 2026">
            <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
                These Terms &amp; Conditions (“Terms”) govern your access to and
                use of the Uponco appointment-booking platform (the “Service”)
                provided by Uponco (“Uponco”, “we”, “us” or “our”). By creating
                an account or using the Service, you agree to these Terms. If
                you do not agree, do not use the Service.
            </p>

            <LegalSection id="eligibility" heading="1. Eligibility & accounts">
                <p>
                    You must be at least 16 years old and able to enter into a
                    binding contract to use the Service. You are responsible for
                    the accuracy of the information you provide, for maintaining
                    the confidentiality of your credentials, and for all
                    activity that occurs under your account. Notify us promptly
                    of any unauthorised use.
                </p>
            </LegalSection>

            <LegalSection id="the-service" heading="2. The Service">
                <p>
                    Uponco lets businesses publish services and locations and
                    accept online and onsite appointments from their customers.
                    Features include team management, working hours, automated
                    reminders and generated meeting links. We may add, change or
                    remove features over time.
                </p>
            </LegalSection>

            <LegalSection
                id="businesses-customers"
                heading="3. Businesses and their customers"
            >
                <p>
                    If you use the Service as a business, you are responsible
                    for the services you offer, for honouring the appointments
                    booked through your booking pages, and for complying with
                    all laws that apply to your business, including
                    consumer-protection and data-protection obligations toward
                    your customers. Uponco is a technology provider and is not a
                    party to the arrangement between a business and its
                    customers.
                </p>
                <p>
                    If you book an appointment as a customer, your booking is
                    with the business, not with Uponco. Any questions about a
                    specific appointment, service or cancellation should be
                    directed to that business.
                </p>
            </LegalSection>

            <LegalSection id="acceptable-use" heading="4. Acceptable use">
                <p>You agree not to:</p>
                <ul className="list-disc space-y-1.5 pl-5">
                    <li>
                        Use the Service for any unlawful or fraudulent purpose;
                    </li>
                    <li>
                        Upload content that is illegal, infringing, harmful or
                        misleading;
                    </li>
                    <li>
                        Attempt to gain unauthorised access to the Service or
                        disrupt its operation;
                    </li>
                    <li>
                        Reverse engineer, resell or misuse the Service or its
                        data;
                    </li>
                    <li>
                        Send unsolicited communications or violate the privacy
                        of others.
                    </li>
                </ul>
            </LegalSection>

            <LegalSection id="pricing" heading="5. Pricing & subscriptions">
                <p>
                    The Service is currently offered free of charge, and new
                    accounts receive their first 100 appointments at no cost.
                    Uponco intends to introduce subscription-based paid plans in
                    the future. When paid plans become available, applicable
                    fees, billing cycles and payment terms will be presented to
                    you before you subscribe, and continued use of paid features
                    will be subject to those terms. We will give reasonable
                    notice before any charges begin to apply to your account.
                </p>
            </LegalSection>

            <LegalSection id="content" heading="6. Your content">
                <p>
                    You retain ownership of the content you submit to the
                    Service, such as business details, services and booking
                    information. You grant Uponco a limited licence to host,
                    process and display that content solely to operate and
                    provide the Service. You are responsible for ensuring you
                    have the rights necessary to submit such content.
                </p>
            </LegalSection>

            <LegalSection id="ip" heading="7. Intellectual property">
                <p>
                    The Service, including its software, design and trademarks,
                    is owned by Uponco and protected by intellectual property
                    laws. These Terms do not grant you any right to use our
                    branding except as necessary to use the Service.
                </p>
            </LegalSection>

            <LegalSection id="availability" heading="8. Availability">
                <p>
                    We aim to keep the Service available and reliable but do not
                    guarantee uninterrupted or error-free operation. We may
                    suspend or restrict access for maintenance, security or
                    legal reasons.
                </p>
            </LegalSection>

            <LegalSection
                id="termination"
                heading="9. Suspension & termination"
            >
                <p>
                    You may stop using the Service and close your account at any
                    time. We may suspend or terminate your access if you breach
                    these Terms or use the Service in a way that could harm
                    Uponco, other users or third parties. On termination, the
                    rights granted to you under these Terms will end.
                </p>
            </LegalSection>

            <LegalSection
                id="disclaimer"
                heading="10. Disclaimer of warranties"
            >
                <p>
                    To the fullest extent permitted by law, the Service is
                    provided “as is” and “as available” without warranties of
                    any kind, whether express or implied, including fitness for
                    a particular purpose and non-infringement. This does not
                    affect any mandatory statutory rights you may have as a
                    consumer.
                </p>
            </LegalSection>

            <LegalSection id="liability" heading="11. Limitation of liability">
                <p>
                    To the extent permitted by law, Uponco shall not be liable
                    for any indirect, incidental or consequential damages, or
                    for lost profits, revenue or data, arising from your use of
                    the Service. Nothing in these Terms limits liability that
                    cannot be limited under applicable law, such as liability
                    for gross negligence or wilful misconduct.
                </p>
            </LegalSection>

            <LegalSection id="privacy" heading="12. Privacy">
                <p>
                    Our{' '}
                    <Link
                        href={privacy()}
                        className="font-medium text-primary hover:underline"
                    >
                        Privacy Policy
                    </Link>{' '}
                    explains how we collect and process personal data and forms
                    part of these Terms.
                </p>
            </LegalSection>

            <LegalSection id="governing-law" heading="13. Governing law">
                <p>
                    These Terms are governed by the laws of the European Union
                    and the member state in which Uponco is established, without
                    regard to conflict-of-law rules. If you are a consumer, you
                    also benefit from any mandatory protections of the law of
                    your country of residence. Disputes shall be subject to the
                    competent courts, subject to any mandatory consumer rights
                    to bring proceedings locally.
                </p>
            </LegalSection>

            <LegalSection id="changes" heading="14. Changes to these Terms">
                <p>
                    We may update these Terms from time to time. Material
                    changes will be communicated through the Service or by
                    email, and the “Last updated” date above will reflect the
                    latest revision. Continued use of the Service after changes
                    take effect constitutes acceptance of the updated Terms.
                </p>
            </LegalSection>

            <LegalSection id="contact" heading="15. Contact us">
                <p>
                    Questions about these Terms? Contact us at{' '}
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
