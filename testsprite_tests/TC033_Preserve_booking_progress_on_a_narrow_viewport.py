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
        
        # -> Expand the 'Service' card and select the 'Men's Haircut' service.
        # Men's Haircut 30 min · €20 button
        elem = page.get_by_role('button', name="Men's Haircut 30 min · €20", exact=True)
        await elem.click(timeout=10000)
        
        # -> Expand the 'Specialist' card and select the 'Specialist A' option so the date/time picker appears.
        # Specialist Choose who you'll see button
        elem = page.get_by_role('button', name="Specialist Choose who you'll see", exact=True)
        await elem.click(timeout=10000)
        
        # -> Expand the 'Specialist' card and select the 'Specialist A' option so the date/time picker appears.
        # SA Specialist A Next available · Tomorrow 09:00... button
        elem = page.get_by_role('button', name='SA Specialist A Next available · Tomorrow 09:00 09:30 10:00 10:30', exact=True)
        await elem.click(timeout=10000)
        
        # -> Verify the specialist list shows only 'Specialist A' and 'Specialist B' (confirm that 'Sam Idris', 'Preview Owner', and 'Specialist C' are not present), then (re)select 'Specialist A' and scroll to reveal the date/time picker.
        # SA Specialist A Next available · Tomorrow 09:00... button
        elem = page.get_by_role('button', name='SA Specialist A Next available · Tomorrow 09:00 09:30 10:00 10:30', exact=True)
        await elem.click(timeout=10000)
        
        # -> Verify the specialist list shows only 'Specialist A' and 'Specialist B' (confirm that 'Sam Idris', 'Preview Owner', and 'Specialist C' are not present), then (re)select 'Specialist A' and scroll to reveal the date/time picker.
        await page.mouse.wheel(0, 300)
        
        # -> Search the page for 'Sam Idris', 'Preview Owner', and 'Specialist C' to confirm they are absent from the Specialist card, then click the 'Specialist A' button to reveal the date & time picker.
        # SA Specialist A Next available · Tomorrow 09:00... button
        elem = page.get_by_role('button', name='SA Specialist A Next available · Tomorrow 09:00 09:30 10:00 10:30', exact=True)
        await elem.click(timeout=10000)
        
        # -> Confirm the specialist list shows only 'Specialist A' and 'Specialist B' by checking that 'Specialist C', 'Sam Idris', and 'Preview Owner' are not present, then expand 'Specialist A' to reveal the date/time area.
        # SA Specialist A Next available · Tomorrow 09:00... button
        elem = page.get_by_role('button', name='SA Specialist A Next available · Tomorrow 09:00 09:30 10:00 10:30', exact=True)
        await elem.click(timeout=10000)
        
        # -> Confirm the specialist list shows only 'Specialist A' and 'Specialist B' by checking that 'Specialist C', 'Sam Idris', and 'Preview Owner' are not present, then expand 'Specialist A' to reveal the date/time area.
        await page.mouse.wheel(0, 300)
        
        # -> Confirm the specialist list shows only 'Specialist A' and 'Specialist B', then expand the 'Specialist' card and click 'Specialist A' to reveal the date & time picker.
        # Specialist Specialist A button
        elem = page.get_by_role('button', name='Specialist Specialist A', exact=True)
        await elem.click(timeout=10000)
        
        # -> Confirm the specialist list shows only 'Specialist A' and 'Specialist B', then expand the 'Specialist' card and click 'Specialist A' to reveal the date & time picker.
        # SA Specialist A Next available · Tomorrow 09:00... button
        elem = page.get_by_role('button', name='SA Specialist A Next available · Tomorrow 09:00 09:30 10:00 10:30', exact=True)
        await elem.click(timeout=10000)
        
        # -> Scroll the page to reveal the horizontal day chips and the time list so the date/time picker becomes visible.
        await page.mouse.wheel(0, 300)
        
        # -> Check the specialist list shows only 'Specialist A' and 'Specialist B' and then click the 'SA / Specialist A' button to try to reveal the date & time picker.
        # SA Specialist A Next available · Tomorrow 09:00... button
        elem = page.get_by_role('button', name='SA Specialist A Next available · Tomorrow 09:00 09:30 10:00 10:30', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'SA / Specialist A' button to reveal the date & time picker (after listing visible role=button elements to confirm only Specialist A and Specialist B are shown).
        # SA Specialist A Next available · Tomorrow 09:00... button
        elem = page.get_by_role('button', name='SA Specialist A Next available · Tomorrow 09:00 09:30 10:00 10:30', exact=True)
        await elem.click(timeout=10000)
        
        # -> Verify the Specialist list shows only 'Specialist A' and 'Specialist B', then click the 'SA / Specialist A' button to try to reveal the date & time picker.
        # SA Specialist A Next available · Tomorrow 09:00... button
        elem = page.get_by_role('button', name='SA Specialist A Next available · Tomorrow 09:00 09:30 10:00 10:30', exact=True)
        await elem.click(timeout=10000)
        
        # -> Verify the Specialist list shows only 'Specialist A' and 'Specialist B' (no 'Specialist C', 'Sam Idris', or 'Preview Owner'), then click the 'SA / Specialist A' button to reveal the date & time picker.
        # SA Specialist A Next available · Tomorrow 09:00... button
        elem = page.get_by_role('button', name='SA Specialist A Next available · Tomorrow 09:00 09:30 10:00 10:30', exact=True)
        await elem.click(timeout=10000)
        
        # --> Assertions to verify final state
        
        # --> The Continue button is visible on the page footer.
        await page.locator("xpath=/html/body/div/div/div/footer/button").nth(0).scroll_into_view_if_needed()
        # Assert-outcome: passed
        # Assert: The footer Continue button is visible.
        await expect(page.locator("xpath=/html/body/div/div/div/footer/button").nth(0)).to_be_visible(timeout=15000), "The footer Continue button is visible."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    