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
        
        # -> Reload the booking page (http://localhost:8000/appointments/zz-schedule-preview) and wait for the booking wizard to load so the Service/Specialist cards become interactive.
        await page.goto("http://localhost:8000/appointments/zz-schedule-preview")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
        # -> Click the 'Service' card header to expand the list of treatments.
        # Service Choose a treatment button
        elem = page.get_by_role('button', name='Service Choose a treatment', exact=True)
        await elem.click(timeout=10000)
        
        # -> Select the 'Men's Haircut' service from the Service list.
        # Men's Haircut 30 min · €20 button
        elem = page.get_by_role('button', name="Men's Haircut 30 min · €20", exact=True)
        await elem.click(timeout=10000)
        
        # -> Expand the 'Specialist' card labeled 'Specialist — Choose who you'll see', then verify the specialist list and select an eligible specialist (Specialist A or Specialist B).
        # Specialist Choose who you'll see button
        elem = page.get_by_role('button', name="Specialist Choose who you'll see", exact=True)
        await elem.click(timeout=10000)
        
        # -> Select 'Specialist A' from the Specialist list by clicking its row.
        # SA Specialist A Next available · Today 09:00... button
        elem = page.get_by_role('button', name='SA Specialist A Next available · Today 09:00 09:30 10:00 10:30', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'Preview studio' row in the Location card to select that location.
        # Preview studio 80668 Maverick Trail Apt. 341... button
        elem = page.locator('xpath=/html/body/div/div/div/main/div/div/div/div/div/div/div/div')
        await elem.click(timeout=10000)
        
        # -> Scroll down to reveal the 'Pick a date & time' area and locate the booking-day / booking-calendar-day elements (e.g. a day chip like booking-day-2026-09-15).
        await page.mouse.wheel(0, 300)
        
        # -> Scroll the page to reveal the 'Pick a date & time' area and locate the day-strip / calendar controls (look for day chips like booking-day-2026-09-15).
        await page.mouse.wheel(0, 300)
        
        # -> Scroll down to reveal the 'Pick a date & time' area and the day-strip (visible heading 'Pick a date & time').
        await page.mouse.wheel(0, 300)
        
        # -> Scroll the page down to reveal the 'Pick a date & time' area and search the page for the 'Pick a date & time' heading.
        await page.mouse.wheel(0, 300)
        
        # -> Click the 'Men's Haircut' service, then open the Specialist card and select 'Specialist A' so the specialist list filters to only Specialist A and Specialist B.
        # Men's Haircut 30 min · €20 button
        elem = page.get_by_role('button', name="Men's Haircut 30 min · €20", exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'Men's Haircut' service, then open the Specialist card and select 'Specialist A' so the specialist list filters to only Specialist A and Specialist B.
        # Specialist Specialist A button
        elem = page.get_by_role('button', name='Specialist Specialist A', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'Men's Haircut' service, then open the Specialist card and select 'Specialist A' so the specialist list filters to only Specialist A and Specialist B.
        # SA Specialist A Next available · Today 09:00... button
        elem = page.get_by_role('button', name='SA Specialist A Next available · Today 09:00 09:30 10:00 10:30', exact=True)
        await elem.click(timeout=10000)
        
        # -> Scroll the page to reveal the 'Pick a date & time' area so the day-strip, calendar toggle, and available time slots become visible.
        await page.mouse.wheel(0, 300)
        
        # -> Click the 'Continue' button to advance to the 'Pick a date & time' step.
        # Continue button
        elem = page.get_by_role('button', name='Continue', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'Show calendar' button to toggle to the calendar view.
        # Show calendar button
        elem = page.get_by_role('button', name='Show calendar', exact=True)
        await elem.click(timeout=10000)
        
        # -> Confirm the specialist list shows only 'Specialist A' and 'Specialist B', then click the 'Show day list' button to return to the horizontal day-strip view.
        # Show day list button
        elem = page.get_by_role('button', name='Show day list', exact=True)
        await elem.click(timeout=10000)
        
        # -> Select the day labeled 'Sat 12 Sep' from the horizontal day-strip, then pick the '10:00 AM' time slot and finally click the calendar toggle button to switch to the calendar grid view.
        # Sat 12 Sep button
        elem = page.get_by_role('button', name='Sat 12 Sep', exact=True)
        await elem.click(timeout=10000)
        
        # -> Select the day labeled 'Sat 12 Sep' from the horizontal day-strip, then pick the '10:00 AM' time slot and finally click the calendar toggle button to switch to the calendar grid view.
        # 10:00 AM button
        elem = page.get_by_role('button', name='10:30 AM', exact=True)
        await elem.click(timeout=10000)
        
        # -> Select the day labeled 'Sat 12 Sep' from the horizontal day-strip, then pick the '10:00 AM' time slot and finally click the calendar toggle button to switch to the calendar grid view.
        # Show calendar button
        elem = page.get_by_role('button', name='Show calendar', exact=True)
        await elem.click(timeout=10000)
        
        # --> Assertions to verify final state
        
        # --> The booking footer shows a visible Continue button.
        await page.locator("xpath=/html/body/div[1]/div/div/footer/button[2]").nth(0).scroll_into_view_if_needed()
        # Assert-outcome: passed
        # Assert: The Continue button is visible in the footer.
        await expect(page.locator("xpath=/html/body/div[1]/div/div/footer/button[2]").nth(0)).to_be_visible(timeout=15000), "The Continue button is visible in the footer."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    