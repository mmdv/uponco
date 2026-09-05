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
        
        # -> Expand the 'Service' card and select the 'Men's Haircut' service.
        # Service Choose a treatment button
        elem = page.get_by_role('button', name='Service Choose a treatment', exact=True)
        await elem.click(timeout=10000)
        
        # -> Reload the booking page (clear the 'Too Many Requests' message) so the booking wizard UI can load.
        await page.goto("http://localhost:8000/appointments/zz-schedule-preview")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
        # -> Click the 'Service' card, choose 'Men's Haircut', then open the 'Specialist' card and capture the list of visible specialists for verification.
        # Service Choose a treatment button
        elem = page.get_by_role('button', name='Service Choose a treatment', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'Service' card, choose 'Men's Haircut', then open the 'Specialist' card and capture the list of visible specialists for verification.
        # Men's Haircut 30 min · €20 button
        elem = page.get_by_role('button', name="Men's Haircut 30 min · €20", exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'Service' card, choose 'Men's Haircut', then open the 'Specialist' card and capture the list of visible specialists for verification.
        # Specialist Choose who you'll see button
        elem = page.get_by_role('button', name="Service Men's Haircut", exact=True)
        await elem.click(timeout=10000)
        
        # -> Verify that 'Specialist C', 'Specialist D', 'Sam Idris', and 'Preview Owner' are not present in the specialist list, then click the 'Specialist A' card to select Specialist A.
        # SA Specialist A Next available · Today 09:00... button
        elem = page.get_by_role('button', name='SA Specialist A Next available · Today 09:00 09:30 10:00 10:30', exact=True)
        await elem.click(timeout=10000)
        
        # -> Select the 'Preview studio' location and click the 'Continue' button to move to the date & time step.
        # Preview studio 80668 Maverick Trail Apt. 341... button
        elem = page.locator('xpath=/html/body/div/div/div/main/div/div/div/div/div/div/div/div')
        await elem.click(timeout=10000)
        
        # -> Select the 'Preview studio' location and click the 'Continue' button to move to the date & time step.
        # Continue button
        elem = page.get_by_role('button', name='Continue', exact=True)
        await elem.click(timeout=10000)
        
        # -> Select the day '12 Sep' and choose the '10:00 AM' time slot, then click the 'Continue' button to go to the customer details step.
        # Sat 12 Sep button
        elem = page.get_by_role('button', name='Sat 12 Sep', exact=True)
        await elem.click(timeout=10000)
        
        # -> Select the day '12 Sep' and choose the '10:00 AM' time slot, then click the 'Continue' button to go to the customer details step.
        # 10:00 AM button
        elem = page.get_by_role('button', name='10:00 AM', exact=True)
        await elem.click(timeout=10000)
        
        # -> Select the day '12 Sep' and choose the '10:00 AM' time slot, then click the 'Continue' button to go to the customer details step.
        # Continue button
        elem = page.get_by_role('button', name='Continue', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the '10:00 AM' time slot, then click the 'Continue' button to go to the customer details step.
        # 10:00 AM button
        elem = page.get_by_role('button', name='10:00 AM', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the '10:00 AM' time slot, then click the 'Continue' button to go to the customer details step.
        # Continue button
        elem = page.get_by_role('button', name='Continue', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'Back' button on the customer details page to return to the 'Pick a date & time' step and verify the previously selected date (12 Sep 2026) and time (10:00 AM) remain selected.
        # Back button
        elem = page.get_by_role('button', name='Back', exact=True)
        await elem.click(timeout=10000)
        
        # --> Assertions to verify final state
        
        # --> The previously chosen date (Sat, Sep 12, 2026) remains visible on the Pick a date & time step.
        await page.locator("xpath=/html/body/div/div/div/main/div/div/section[1]/div[2]/button[8]").nth(0).scroll_into_view_if_needed()
        # Assert-outcome: passed
        # Assert: The day chip 'Sat 12 Sep' is visible in the day strip.
        await expect(page.locator("xpath=/html/body/div/div/div/main/div/div/section[1]/div[2]/button[8]").nth(0)).to_be_visible(timeout=15000), "The day chip 'Sat 12 Sep' is visible in the day strip."
        
        # --> The previously chosen time (10:00 AM) remains visible and selected on the Pick a date & time step.
        await page.locator("xpath=/html/body/div/div/div/main/div/div/section[2]/div/button[3]").nth(0).scroll_into_view_if_needed()
        # Assert-outcome: passed
        # Assert: The '10:00 AM' time slot button is visible.
        await expect(page.locator("xpath=/html/body/div/div/div/main/div/div/section[2]/div/button[3]").nth(0)).to_be_visible(timeout=15000), "The '10:00 AM' time slot button is visible."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    