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
        
        # -> Open the 'Service' card and select the 'Preview haircut' service so the specialist and location options can appear.
        # Service Choose a treatment button
        elem = page.get_by_role('button', name='Service Choose a treatment', exact=True)
        await elem.click(timeout=10000)
        
        # -> Select the 'Preview haircut' service from the Service card so the eligible specialists and location appear.
        # Preview haircut 1h · €30 button
        elem = page.get_by_role('button', name='Preview haircut 1h · €30', exact=True)
        await elem.click(timeout=10000)
        
        # -> Select the 'Preview Owner' specialist and click the 'Continue' button to go to the 'Pick a date & time' step.
        # PO Preview Owner Next available · Tomorrow 09:00... button
        elem = page.get_by_role('button', name='PO Preview Owner Next available · Tomorrow 09:00 09:30 10:00 10:30', exact=True)
        await elem.click(timeout=10000)
        
        # -> Select the 'Preview Owner' specialist and click the 'Continue' button to go to the 'Pick a date & time' step.
        # Continue button
        elem = page.get_by_role('button', name='Continue', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'Preview Owner' specialist to select them so the Continue button can enable.
        # PO Preview Owner Next available · Tomorrow 09:00... button
        elem = page.get_by_role('button', name='PO Preview Owner Next available · Tomorrow 09:00 09:30 10:00 10:30', exact=True)
        await elem.click(timeout=10000)
        
        # -> Expand the 'Specialist' card, select the 'Preview Owner' specialist, and click the 'Continue' button to go to the 'Pick a date & time' step.
        # Specialist Choose who you'll see button
        elem = page.get_by_role('button', name="Specialist Choose who you'll see", exact=True)
        await elem.click(timeout=10000)
        
        # -> Expand the 'Specialist' card, select the 'Preview Owner' specialist, and click the 'Continue' button to go to the 'Pick a date & time' step.
        # PO Preview Owner Next available · Tomorrow 09:00... button
        elem = page.get_by_role('button', name='PO Preview Owner Next available · Tomorrow 09:00 09:30 10:00 10:30', exact=True)
        await elem.click(timeout=10000)
        
        # -> Expand the 'Specialist' card, select the 'Preview Owner' specialist, and click the 'Continue' button to go to the 'Pick a date & time' step.
        # Continue button
        elem = page.get_by_role('button', name='Continue', exact=True)
        await elem.click(timeout=10000)
        
        # -> Expand the 'Specialist' card (label: 'Specialist') to reveal available specialists.
        # Specialist Preview Owner button
        elem = page.get_by_role('button', name='Specialist Preview Owner', exact=True)
        await elem.click(timeout=10000)
        
        # -> Expand the 'Location' card, select 'Preview studio', then click the 'Continue' button to go to the 'Pick a date & time' step.
        # Location Pick where to visit button
        elem = page.get_by_role('button', name='Location Pick where to visit', exact=True)
        await elem.click(timeout=10000)
        
        # -> Expand the 'Location' card, select 'Preview studio', then click the 'Continue' button to go to the 'Pick a date & time' step.
        # Preview studio 80668 Maverick Trail Apt. 341... button
        elem = page.locator('xpath=/html/body/div/div/div/main/div/div/div/div/div/div/div/div')
        await elem.click(timeout=10000)
        
        # -> Expand the 'Location' card, select 'Preview studio', then click the 'Continue' button to go to the 'Pick a date & time' step.
        # Continue button
        elem = page.get_by_role('button', name='Continue', exact=True)
        await elem.click(timeout=10000)
        
        # -> Open the calendar (calendar icon) to expose and choose 11 September.
        # Show calendar button
        elem = page.get_by_role('button', name='Show calendar', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the calendar cell labelled '11' (11 September 2026) and verify the page shows the no-times-available empty-state message.
        # 11 button
        elem = page.locator('xpath=/html/body/div/div/div/main/div/div/section/div[2]/div[2]/button[12]')
        await elem.click(timeout=10000)
        
        # -> Click the calendar day '12' (12 September 2026) and then select the '09:00 AM' time slot to verify available times are shown.
        # 12 button
        elem = page.get_by_role('button', name='12', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the calendar day '12' (12 September 2026) and then select the '09:00 AM' time slot to verify available times are shown.
        # 09:00 AM button
        elem = page.get_by_role('button', name='09:00 AM', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the '09:00 AM' time slot to select it and confirm that available times are shown for 12 September (verify the selection by observing the Continue button enabling or other selected-time UI feedback).
        # 09:00 AM button
        elem = page.get_by_role('button', name='09:00 AM', exact=True)
        await elem.click(timeout=10000)
        
        # --> Assertions to verify final state
        
        # --> Available times are shown for 12 September and include a 09:00 AM slot.
        await page.locator("xpath=/html/body/div/div/div/main/div/div/section[2]/div/button[1]").nth(0).scroll_into_view_if_needed()
        # Assert-outcome: passed
        # Assert: The 09:00 AM time slot is visible.
        await expect(page.locator("xpath=/html/body/div/div/div/main/div/div/section[2]/div/button[1]").nth(0)).to_be_visible(timeout=15000), "The 09:00 AM time slot is visible."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    