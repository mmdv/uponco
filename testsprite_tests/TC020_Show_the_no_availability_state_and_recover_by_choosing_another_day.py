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
        
        # -> Click the "Service — Choose a treatment" card header to expand the Service selection.
        # Service Choose a treatment button
        elem = page.get_by_role('button', name='Service Choose a treatment', exact=True)
        await elem.click(timeout=10000)
        
        # -> Reload the 'ZZ Schedule Preview' booking page and wait for the booking wizard to load (resolve the 429 error if transient).
        await page.goto("http://localhost:8000/appointments/zz-schedule-preview")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
        # -> Click the 'Service — Choose a treatment' card header to expand the Service selection.
        # Service Choose a treatment button
        elem = page.get_by_role('button', name='Service Choose a treatment', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'Men's Haircut' service to select it.
        # Men's Haircut 30 min · €20 button
        elem = page.get_by_role('button', name="Men's Haircut 30 min · €20", exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'Specialist — Choose who you'll see' card header to expand the Specialist selection and reveal the specialist list.
        # Specialist Choose who you'll see button
        elem = page.get_by_role('button', name="Specialist Choose who you'll see", exact=True)
        await elem.click(timeout=10000)
        
        # -> Select 'Specialist A' from the Specialist list after confirming only Specialist A and Specialist B are shown and Specialist C / Specialist D / Sam Idris / Preview Owner are not present.
        # SA Specialist A Next available · Today 09:00... button
        elem = page.get_by_role('button', name='SA Specialist A Next available · Today 09:00 09:30 10:00 10:30', exact=True)
        await elem.click(timeout=10000)
        
        # -> Select the location 'Preview studio' to enable date selection and proceed to the Pick a date & time step.
        # Preview studio 80668 Maverick Trail Apt. 341... button
        elem = page.locator('xpath=/html/body/div/div/div/main/div/div/div/div/div/div/div/div')
        await elem.click(timeout=10000)
        
        # -> Click the 'Continue' button to go to the 'Pick a date & time' step.
        # Continue button
        elem = page.get_by_role('button', name='Continue', exact=True)
        await elem.click(timeout=10000)
        
        # -> Select the day 'Fri 11 Sep' and verify the page shows the empty 'no times available' state (or that the day is disabled), then pick 'Sat 12 Sep' and choose the 09:00 AM slot.
        # Fri 11 Sep button
        elem = page.get_by_role('button', name='Fri 11 Sep', exact=True)
        await elem.click(timeout=10000)
        
        # -> Select the day 'Fri 11 Sep' and verify the page shows the empty 'no times available' state (or that the day is disabled), then pick 'Sat 12 Sep' and choose the 09:00 AM slot.
        # Sat 12 Sep button
        elem = page.get_by_role('button', name='Sat 12 Sep', exact=True)
        await elem.click(timeout=10000)
        
        # -> Select the day 'Fri 11 Sep' and verify the page shows the empty 'no times available' state (or that the day is disabled), then pick 'Sat 12 Sep' and choose the 09:00 AM slot.
        # 09:00 AM button
        elem = page.get_by_role('button', name='09:00 AM', exact=True)
        await elem.click(timeout=10000)
        
        # -> Verify that the 'Fri 11 Sep' day chip shows no availability, then select 'Sat 12 Sep' and click the '09:00 AM' time slot.
        # Fri 11 Sep button
        elem = page.get_by_role('button', name='Fri 11 Sep', exact=True)
        await elem.click(timeout=10000)
        
        # -> Verify that the 'Fri 11 Sep' day chip shows no availability, then select 'Sat 12 Sep' and click the '09:00 AM' time slot.
        # Sat 12 Sep button
        elem = page.get_by_role('button', name='Sat 12 Sep', exact=True)
        await elem.click(timeout=10000)
        
        # -> Verify that the 'Fri 11 Sep' day chip shows no availability, then select 'Sat 12 Sep' and click the '09:00 AM' time slot.
        # 09:00 AM button
        elem = page.get_by_role('button', name='09:00 AM', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'Fri 11 Sep' day chip and confirm it shows no availability, then select 'Sat 12 Sep' and choose the '09:00 AM' time slot.
        # Fri 11 Sep button
        elem = page.get_by_role('button', name='Fri 11 Sep', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'Fri 11 Sep' day chip and confirm it shows no availability, then select 'Sat 12 Sep' and choose the '09:00 AM' time slot.
        # Sat 12 Sep button
        elem = page.get_by_role('button', name='Sat 12 Sep', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'Fri 11 Sep' day chip and confirm it shows no availability, then select 'Sat 12 Sep' and choose the '09:00 AM' time slot.
        # 09:00 AM button
        elem = page.get_by_role('button', name='09:00 AM', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'Fri 11 Sep' day chip and verify that the page shows a no-availability/empty-times state (look for text like 'no times', 'no availability', or 'try another').
        # Fri 11 Sep button
        elem = page.get_by_role('button', name='Fri 11 Sep', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'Fri 11 Sep' day chip and confirm the UI shows the empty/no-times-available state (either by an empty time list or an explicit no-times message).
        # Fri 11 Sep button
        elem = page.get_by_role('button', name='Fri 11 Sep', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'Fri 11 Sep' day chip and observe whether the page displays an empty/no-times-available state (empty time list or an explicit no-availability message).
        # Fri 11 Sep button
        elem = page.get_by_role('button', name='Fri 11 Sep', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'Fri 11 Sep' day chip and then verify the time list is empty (no available time slots shown) to confirm the no-availability empty state.
        # Fri 11 Sep button
        elem = page.get_by_role('button', name='Fri 11 Sep', exact=True)
        await elem.click(timeout=10000)
        
        # --> Assertions to verify final state
        
        # --> The Fri 11 Sep day chip is shown disabled, indicating no availability for that day.
        # Assert-outcome: passed
        # Assert: Verifies the Fri 11 Sep day chip is marked disabled (no availability).
        await expect(page.locator("xpath=/html/body/div[1]/div/div/main/div/div/section[1]/div[2]/button[7]").nth(0)).to_have_attribute("aria-disabled", "true", timeout=15000), "Verifies the Fri 11 Sep day chip is marked disabled (no availability)."
        
        # --> Available time slots are displayed for the selected day (the first visible slot is 09:00 AM).
        # Assert-outcome: passed
        # Assert: Verifies the 09:00 AM time slot is visible in the time list.
        await expect(page.locator("xpath=/html/body/div[1]/div/div/main/div/div/section[2]/div/button[1]").nth(0)).to_have_text("09:00 AM", timeout=15000), "Verifies the 09:00 AM time slot is visible in the time list."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    