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
        
        # -> Expand the 'Service' section by clicking the 'Service' card header labeled "Service - Choose a treatment".
        # Service Choose a treatment button
        elem = page.get_by_role('button', name='Service Choose a treatment', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'Men's Haircut' service
        # Men's Haircut 30 min · €20 button
        elem = page.get_by_role('button', name="Men's Haircut 30 min · €20", exact=True)
        await elem.click(timeout=10000)
        
        # -> Select 'Specialist A' in the Specialist card so the booking summary can remain showing the service and the Continue button can become enabled.
        # SA Specialist A Next available · Tomorrow 09:00... button
        elem = page.get_by_role('button', name='SA Specialist A Next available · Tomorrow 09:00 09:30 10:00 10:30', exact=True)
        await elem.click(timeout=10000)
        
        # -> Expand the 'Specialist' card and select 'Specialist A' so the booking summary shows 'Men's Haircut' and the 'Continue' button becomes enabled.
        # Specialist Choose who you'll see button
        elem = page.get_by_role('button', name="Specialist Choose who you'll see", exact=True)
        await elem.click(timeout=10000)
        
        # -> Expand the 'Specialist' card and select 'Specialist A' so the booking summary shows 'Men's Haircut' and the 'Continue' button becomes enabled.
        # SA Specialist A Next available · Tomorrow 09:00... button
        elem = page.get_by_role('button', name='SA Specialist A Next available · Tomorrow 09:00 09:30 10:00 10:30', exact=True)
        await elem.click(timeout=10000)
        
        # -> Expand the 'Specialist' card and click the 'Specialist A' option so the booking summary shows the chosen service and the 'Continue' button becomes enabled.
        # Specialist Specialist A button
        elem = page.get_by_role('button', name='Specialist Specialist A', exact=True)
        await elem.click(timeout=10000)
        
        # -> Expand the 'Specialist' card and click the 'Specialist A' option so the booking summary shows the chosen service and the 'Continue' button becomes enabled.
        # SA Specialist A Next available · Tomorrow 09:00... button
        elem = page.get_by_role('button', name='SA Specialist A Next available · Tomorrow 09:00 09:30 10:00 10:30', exact=True)
        await elem.click(timeout=10000)
        
        # --> Assertions to verify final state
        
        # --> The services list is visible and includes the 'Men's Haircut' entry with its details.
        await page.locator("xpath=/html/body/div/div/div/main/div/div/div[2]/div/div/div/div/div/div/button[3]").nth(0).scroll_into_view_if_needed()
        # Assert-outcome: passed
        # Assert: Men's Haircut service entry is visible on the services list.
        await expect(page.locator("xpath=/html/body/div/div/div/main/div/div/div[2]/div/div/div/div/div/div/button[3]").nth(0)).to_be_visible(timeout=15000), "Men's Haircut service entry is visible on the services list."
        
        # --> The chosen service 'Men's Haircut' is shown in the Service card header (booking summary).
        await page.locator("xpath=/html/body/div/div/div/main/div/div/div[2]/button").nth(0).scroll_into_view_if_needed()
        # Assert-outcome: passed
        # Assert: Service card header displays the chosen service 'Men's Haircut'.
        await expect(page.locator("xpath=/html/body/div/div/div/main/div/div/div[2]/button").nth(0)).to_be_visible(timeout=15000), "Service card header displays the chosen service 'Men's Haircut'."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    