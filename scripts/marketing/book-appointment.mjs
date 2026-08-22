// Marketing automation: a human-paced walkthrough of the public booking flow,
// meant to be screen-recorded (it also records its own .webm).
//
// It books the demo customer "Yasəmən Zaynalzadə" into a 1-hour individual
// pilates session with Sevinc Pilates on Wed 19 Aug 2026 at 13:00. The page
// runs in Azerbaijani (locale cookie) and the phone field defaults to the +994
// dial code because the browser context is pinned to the Asia/Baku timezone.
//
// Prerequisites:
//   1. Seed the demo studio:   php artisan db:seed --class=SevincPilatesSeeder
//   2. Serve the app:          composer run dev        (Laravel on :8000 + Vite)
//   3. (first run only)        npx playwright install chromium
//
// Run it:
//   node scripts/marketing/book-appointment.mjs
//
// Handy env overrides:
//   BASE_URL   app origin                     (default http://localhost:8000)
//   LOCALE     booking page language          (default az)
//   TIMEZONE   context tz → phone dial code   (default Asia/Baku → +994)
//   HEADLESS   "1" for a hidden smoke test    (default headed, for recording)
//   SLOW_MO    ms between actions             (default 350)
//   TYPE_DELAY ms between keystrokes          (default 110)
//   WIDTH/HEIGHT  viewport, phone portrait    (default 430x932)

import { chromium } from 'playwright';

const BASE_URL = (process.env.BASE_URL ?? 'http://localhost:8000').replace(/\/$/, '');
const SLUG = process.env.SLUG ?? 'sevinc-pilates';
const LOCALE = process.env.LOCALE ?? 'az'; // booking page language (cookie)
const TIMEZONE = process.env.TIMEZONE ?? 'Asia/Baku'; // sets the phone dial code
const BOOKING_DATE = process.env.BOOKING_DATE ?? '2026-08-19'; // Wed 19 Aug 2026
const SLOT_LABEL = process.env.SLOT_LABEL ?? '1300'; // 13:00, colon stripped
const SERVICE_NAME = process.env.SERVICE_NAME ?? 'Fərdi Pilates';

const CUSTOMER = {
    name: process.env.CUSTOMER_NAME ?? 'Leyla Məmmədova',
    email: process.env.CUSTOMER_EMAIL ?? 'leyla.mammadova@test.com',
    // National significant number (no leading 0); the +994 dial code is
    // supplied by the Asia/Baku timezone, so the field shows +994 50 555 12 34.
    phone: process.env.CUSTOMER_PHONE ?? '505551234',
    notes: process.env.CUSTOMER_NOTES ?? 'İlk reformer məşğələm — çox həyəcanlıyam!',
};

// Text that varies by locale, kept locale-robust so the script works in az/en.
const SERVICE_CARD_HINT = /Prosedur seçin|Choose a treatment/i;
const SUCCESS_TEXT = /Rezervasiyanız təsdiqləndi|You're booked in/i;

const HEADLESS = process.env.HEADLESS === '1';
const SLOW_MO = Number(process.env.SLOW_MO ?? 350);
const TYPE_DELAY = Number(process.env.TYPE_DELAY ?? 110);
const WIDTH = Number(process.env.WIDTH ?? 430);
const HEIGHT = Number(process.env.HEIGHT ?? 932);

const RECORDINGS_DIR = new URL('./recordings/', import.meta.url).pathname;

/** A short, deliberate pause so each on-screen change is legible on camera. */
const beat = (page, ms = 800) => page.waitForTimeout(ms);

/** Type into a field one key at a time so the recording shows the animation. */
async function humanType(locator, text) {
    await locator.scrollIntoViewIfNeeded();
    await locator.click();
    await beatFromLocator(locator, 250);
    await locator.pressSequentially(text, { delay: TYPE_DELAY });
}

const beatFromLocator = (locator, ms) => locator.page().waitForTimeout(ms);

async function run() {
    const browser = await chromium.launch({ headless: HEADLESS, slowMo: SLOW_MO });
    const context = await browser.newContext({
        viewport: { width: WIDTH, height: HEIGHT },
        deviceScaleFactor: 2,
        locale: `${LOCALE}-AZ`,
        timezoneId: TIMEZONE, // makes the phone field default to the +994 dial code
        recordVideo: { dir: RECORDINGS_DIR, size: { width: WIDTH, height: HEIGHT } },
    });
    // The booking page resolves its language from the `locale` cookie server-side,
    // so it renders in Azerbaijani from the very first paint.
    await context.addCookies([{ name: 'locale', value: LOCALE, url: BASE_URL }]);
    const page = await context.newPage();

    try {
        // --- Land on the booking page ---------------------------------------
        await page.goto(`${BASE_URL}/appointments/${SLUG}`, { waitUntil: 'networkidle' });
        await beat(page, 1200);

        // --- Step 0: choose the service -------------------------------------
        // Specialist and location are the studio's only ones, so they arrive
        // already settled; the visitor only picks between the two services.
        await page.getByRole('button', { name: SERVICE_CARD_HINT }).click();
        await beat(page, 700);
        await page.getByRole('button', { name: new RegExp(SERVICE_NAME, 'i') }).click();
        await beat(page, 900);
        await page.locator('[data-test="appointment-continue-button"]').click();
        await beat(page, 900);

        // --- Step 1: pick the day, then the time ----------------------------
        const day = page.locator(`[data-test="booking-day-${BOOKING_DATE}"]`);
        await day.scrollIntoViewIfNeeded();
        await day.click();
        await beat(page, 700);

        const slot = page.locator(`[data-test="booking-slot-${SLOT_LABEL}"]`);
        await slot.waitFor({ state: 'visible', timeout: 15000 }); // slots load via XHR
        await slot.scrollIntoViewIfNeeded();
        await beat(page, 500);
        await slot.click();
        await beat(page, 900);
        await page.locator('[data-test="appointment-continue-button"]').click();
        await beat(page, 900);

        // --- Step 2: fill in the customer details ---------------------------
        await humanType(page.locator('[data-test="appointment-customer-name-input"]'), CUSTOMER.name);
        await beat(page, 500);
        await humanType(page.locator('[data-test="appointment-customer-email-input"]'), CUSTOMER.email);
        await beat(page, 500);
        // The dial code (+994) is already set from the Baku timezone, so only the
        // national digits are typed — the widget formats them as they go.
        await humanType(page.locator('[data-test="appointment-customer-phone-input"]'), CUSTOMER.phone);
        await beat(page, 500);
        await humanType(page.locator('[data-test="appointment-notes-input"]'), CUSTOMER.notes);
        await beat(page, 900);

        // --- Confirm & celebrate --------------------------------------------
        await page.locator('[data-test="appointment-save-button"]').click();
        await page.getByText(SUCCESS_TEXT).waitFor({ state: 'visible', timeout: 15000 });
        await beat(page, 3000); // hold on the success screen for the recording

        console.log('✅ Booking completed — success screen reached.');
    } catch (error) {
        console.error('❌ Booking flow failed:', error.message);
        await page.screenshot({ path: `${RECORDINGS_DIR}failure.png` }).catch(() => {});
        process.exitCode = 1;
    } finally {
        // Closing the context flushes the recorded video to disk.
        await context.close();
        await browser.close();
        console.log(`🎬 Video saved under ${RECORDINGS_DIR}`);
    }
}

run();
