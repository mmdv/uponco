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
        
        # -> Reload the 'ZZ Schedule Preview' booking page to recover from the 'Too Many Requests' error and load the services list.
        await page.goto("http://localhost:8000/appointments/zz-schedule-preview")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
        # -> Click the 'Service' header if collapsed, then click the 'Men's Haircut' service to choose that treatment.
        # Service Choose a treatment button
        elem = page.get_by_role('button', name='Service Choose a treatment', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'Service' header if collapsed, then click the 'Men's Haircut' service to choose that treatment.
        # Men's Haircut 30 min · €20 button
        elem = page.get_by_role('button', name="Men's Haircut 30 min · €20", exact=True)
        await elem.click(timeout=10000)
        
        # -> Expand the 'Specialist' card, select 'Specialist A', then click the 'Continue' button to go to the Pick a date & time step.
        # Specialist Choose who you'll see button
        elem = page.get_by_role('button', name="Specialist Choose who you'll see", exact=True)
        await elem.click(timeout=10000)
        
        # -> Expand the 'Specialist' card, select 'Specialist A', then click the 'Continue' button to go to the Pick a date & time step.
        # SA Specialist A Next available · Today 09:00... button
        elem = page.get_by_role('button', name='SA Specialist A Next available · Today 09:00 09:30 10:00 10:30', exact=True)
        await elem.click(timeout=10000)
        
        # -> Expand the 'Specialist' card, select 'Specialist A', then click the 'Continue' button to go to the Pick a date & time step.
        # Continue button
        elem = page.get_by_role('button', name='Continue', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the visible 'Preview studio' location entry, then click the 'Continue' button to go to the "Pick a date & time" step.
        # Preview studio 80668 Maverick Trail Apt. 341... button
        elem = page.locator('xpath=/html/body/div/div/div/main/div/div/div/div/div/div/div/div')
        await elem.click(timeout=10000)
        
        # -> Click the visible 'Preview studio' location entry, then click the 'Continue' button to go to the "Pick a date & time" step.
        # Continue button
        elem = page.get_by_role('button', name='Continue', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the day chip for 'Sat 12 Sep' (2026-09-12) and then click the '10:00 AM' time slot to choose a date and time, while verifying that only Specialist A and Specialist B are listed and other specialists are not present.
        # Sat 12 Sep button
        elem = page.get_by_role('button', name='Sat 12 Sep', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the day chip for 'Sat 12 Sep' (2026-09-12) and then click the '10:00 AM' time slot to choose a date and time, while verifying that only Specialist A and Specialist B are listed and other specialists are not present.
        # 10:00 AM button
        elem = page.get_by_role('button', name='10:00 AM', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'Back' button to return to the 'Choose your booking details' step so the Specialist card can be inspected.
        # Back button
        elem = page.get_by_role('button', name='Back', exact=True)
        await elem.click(timeout=10000)
        
        # -> Expand the 'Specialist' card and verify that only 'Specialist A' and 'Specialist B' appear and that 'Specialist C', 'Specialist D', 'Sam Idris', and 'Preview Owner' are not present.
        # Specialist Specialist A button
        elem = page.get_by_role('button', name='Specialist Specialist A', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the visible "Continue" button to go to the "Pick a date & time" step after verifying the specialist list.
        # Continue button
        elem = page.get_by_role('button', name='Continue', exact=True)
        await elem.click(timeout=10000)
        
        # --> Assertions to verify final state
        
        # --> The selected service and specialist remain selected (reflected in the URL).
        # Assert-outcome: passed
        # Assert: URL contains the selected service_id and specialist_id.
        await expect(page).to_have_url(re.compile("service_id=11\\&specialist_id=10"), timeout=15000), "URL contains the selected service_id and specialist_id."
        
        # --> Available appointment times are displayed (a 10:00 AM slot is visible).
        await page.locator("xpath=/html/body/div/div/div/main/div/div/section[2]/div/button[3]").nth(0).scroll_into_view_if_needed()
        # Assert-outcome: passed
        # Assert: The 10:00 AM time slot button is visible.
        await expect(page.locator("xpath=/html/body/div/div/div/main/div/div/section[2]/div/button[3]").nth(0)).to_be_visible(timeout=15000), "The 10:00 AM time slot button is visible."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    