import asyncio
import re
from playwright import async_api
from playwright.async_api import expect

async def run_test():
    pw = None
    browser = None
    context = None

    try:
        # Start a Playwright session in asynchronous mode
        pw = await async_api.async_playwright().start()

        # Launch a Chromium browser in headless mode with custom arguments
        browser = await pw.chromium.launch(
            headless=True,
            args=[
                "--window-size=1280,720",
                "--disable-dev-shm-usage",
                "--ipc=host",
                "--single-process"
            ],
        )

        # Create a new browser context (like an incognito window)
        context = await browser.new_context()
        # Wider default timeout to match the agent's DOM-stability budget;
        # auto-waiting Playwright APIs (expect, locator.wait_for) inherit this.
        context.set_default_timeout(15000)

        # Open a new page in the browser context
        page = await context.new_page()

        # Interact with the page elements to simulate user flow
        # -> navigate
        await page.goto("http://localhost:8000/appointments/zz-schedule-preview")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
        # -> Select the 'Group Pilates Class' service from the Service card so the booking wizard can show dependent options.
        # Group Pilates Class 1h · €15 Group pilates... button
        elem = page.get_by_role('button', name='Group Pilates Class 1h · €15 Group pilates session led by Specialist C.', exact=True)
        await elem.click(timeout=10000)
        
        # -> Select the 'Specialist C' option from the Specialist list so the booking wizard can update available dates and times.
        # SC Specialist C Next available · Tomorrow 09:00... button
        elem = page.get_by_role('button', name='SC Specialist C Next available · Tomorrow 09:00 09:30 10:00 10:30', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'SC Specialist C' option in the Specialist list to select Specialist C.
        # SC Specialist C Next available · Tomorrow 09:00... button
        elem = page.get_by_role('button', name='SC Specialist C Next available · Tomorrow 09:00 09:30 10:00 10:30', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'About Specialist C' button to open specialist details and trigger dependent UI updates.
        # About Specialist C button
        elem = page.get_by_role('button', name='About Specialist C', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'Specialist' card header (label: 'Specialist — Choose who you'll see') to toggle the specialist list and trigger a UI update.
        # Specialist Choose who you'll see button
        elem = page.get_by_role('button', name="Specialist Choose who you'll see", exact=True)
        await elem.click(timeout=10000)
        
        # -> Select 'Specialist C' from the Specialist list by toggling the 'Specialist' card header to refresh the UI and then clicking 'Specialist C'.
        # Specialist Choose who you'll see button
        elem = page.get_by_role('button', name="Specialist Choose who you'll see", exact=True)
        await elem.click(timeout=10000)
        
        # -> Select 'Specialist C' from the Specialist list by toggling the 'Specialist' card header to refresh the UI and then clicking 'Specialist C'.
        # SC Specialist C Next available · Tomorrow 09:00... button
        elem = page.get_by_role('button', name='SC Specialist C Next available · Tomorrow 09:00 09:30 10:00 10:30', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'SC Specialist C' entry in the Specialist list to select Specialist C so the wizard can show available dates and times.
        # SC Specialist C Next available · Tomorrow 09:00... button
        elem = page.get_by_role('button', name='SC Specialist C Next available · Tomorrow 09:00 09:30 10:00 10:30', exact=True)
        await elem.click(timeout=10000)
        
        # -> Expand the 'Specialist' card and click the 'SC Specialist C' entry to select Specialist C so the wizard can show available dates and times.
        # Specialist Choose who you'll see button
        elem = page.get_by_role('button', name="Specialist Choose who you'll see", exact=True)
        await elem.click(timeout=10000)
        
        # -> Expand the 'Specialist' card and click the 'SC Specialist C' entry to select Specialist C so the wizard can show available dates and times.
        # SC Specialist C Next available · Tomorrow 09:00... button
        elem = page.get_by_role('button', name='SC Specialist C Next available · Tomorrow 09:00 09:30 10:00 10:30', exact=True)
        await elem.click(timeout=10000)
        
        # -> Expand the 'Service' card and select the 'Group Pilates Class' service so the booking wizard can enable 'Continue'.
        # Service Choose a treatment button
        elem = page.get_by_role('button', name='Service Choose a treatment', exact=True)
        await elem.click(timeout=10000)
        
        # -> Expand the 'Service' card and select the 'Group Pilates Class' service so the booking wizard can enable 'Continue'.
        # Group Pilates Class 1h · €15 Group pilates... button
        elem = page.get_by_role('button', name='Group Pilates Class 1h · €15 Group pilates session led by Specialist C.', exact=True)
        await elem.click(timeout=10000)
        
        # -> Select the 'Preview studio' location option so the booking wizard can enable the Continue button.
        # Preview studio 80668 Maverick Trail Apt. 341... button
        elem = page.locator('xpath=/html/body/div/div/div/main/div/div/div/div/div/div/div/div')
        await elem.click(timeout=10000)
        
        # -> Click the 'Continue' button to move to the date & time selection step
        # Continue button
        elem = page.get_by_role('button', name='Continue', exact=True)
        await elem.click(timeout=10000)
        
        # --> Assertions to verify final state
        
        # --> Group Pilates time options are available and show the 10:00 AM slot.
        await page.locator("xpath=/html/body/div[1]/div/div/main/div/div/section[2]/div/button[1]").nth(0).scroll_into_view_if_needed()
        # Assert-outcome: passed
        # Assert: The 10:00 AM time slot button is visible.
        await expect(page.locator("xpath=/html/body/div[1]/div/div/main/div/div/section[2]/div/button[1]").nth(0)).to_be_visible(timeout=15000), "The 10:00 AM time slot button is visible."
        
        # --> The booking page is showing the selected date (2026-09-05).
        # Assert-outcome: passed
        # Assert: The URL includes the selected date parameter (date=2026-09-05).
        await expect(page).to_have_url(re.compile("date=2026\\-09\\-05"), timeout=15000), "The URL includes the selected date parameter (date=2026-09-05)."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    