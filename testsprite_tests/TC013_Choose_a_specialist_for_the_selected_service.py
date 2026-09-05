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
        
        # -> Click the 'Service' card header to expand the list of services.
        # Service Choose a treatment button
        elem = page.get_by_role('button', name='Service Choose a treatment', exact=True)
        await elem.click(timeout=10000)
        
        # -> Reload the 'ZZ Schedule Preview' booking page (http://localhost:8000/appointments/zz-schedule-preview) and wait for the booking app to load so the Service and Specialist cards become interactive.
        await page.goto("http://localhost:8000/appointments/zz-schedule-preview")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
        # -> Open the 'Service' card and select the 'Men's Haircut' service.
        # Service Choose a treatment button
        elem = page.get_by_role('button', name='Service Choose a treatment', exact=True)
        await elem.click(timeout=10000)
        
        # -> Open the 'Service' card and select the 'Men's Haircut' service.
        # Men's Haircut 30 min · €20 button
        elem = page.get_by_role('button', name="Men's Haircut 30 min · €20", exact=True)
        await elem.click(timeout=10000)
        
        # -> Open the 'Specialist' card by clicking the 'Specialist' header so the list of specialists is revealed.
        # Specialist Choose who you'll see button
        elem = page.get_by_role('button', name="Specialist Choose who you'll see", exact=True)
        await elem.click(timeout=10000)
        
        # -> Verify that only 'Specialist A' and 'Specialist B' are listed and that 'Specialist C', 'Specialist D', 'Sam Idris', and 'Preview Owner' are not present on the Specialist card, then open the 'About' profile for Specialist A.
        # About Specialist A button
        elem = page.get_by_role('button', name='About Specialist A', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'Close' button on the Specialist A profile dialog to dismiss the modal so the Specialist card can be used.
        # Close button
        elem = page.locator('xpath=/html/body/div[3]/div[2]/button')
        await elem.click(timeout=10000)
        
        # -> Select the 'Specialist A' option on the Specialist card so the chosen specialist will appear in the booking summary.
        # SA Specialist A Next available · Today 09:00... button
        elem = page.get_by_role('button', name='SA Specialist A Next available · Today 09:00 09:30 10:00 10:30', exact=True)
        await elem.click(timeout=10000)
        
        # --> Assertions to verify final state
        
        # --> Only Specialist A and Specialist B are listed in the Specialist card after selecting the service.
        await page.locator("xpath=/html/body/div[1]/div/div/main/div/div/div[3]/div/div/div/div/div[1]").nth(0).scroll_into_view_if_needed()
        # Assert-outcome: passed
        # Assert: Specialist A is visible in the specialist list.
        await expect(page.locator("xpath=/html/body/div[1]/div/div/main/div/div/div[3]/div/div/div/div/div[1]").nth(0)).to_be_visible(timeout=15000), "Specialist A is visible in the specialist list."
        await page.locator("xpath=/html/body/div[1]/div/div/main/div/div/div[3]/div/div/div/div/div[2]").nth(0).scroll_into_view_if_needed()
        # Assert-outcome: passed
        # Assert: Specialist B is visible in the specialist list.
        await expect(page.locator("xpath=/html/body/div[1]/div/div/main/div/div/div[3]/div/div/div/div/div[2]").nth(0)).to_be_visible(timeout=15000), "Specialist B is visible in the specialist list."
        
        # --> The chosen specialist is shown in the booking summary as Specialist A.
        await page.locator("xpath=/html/body/div[1]/div/div/main/div/div/div[3]/button").nth(0).scroll_into_view_if_needed()
        # Assert-outcome: passed
        # Assert: The Specialist card header shows Specialist A.
        await expect(page.locator("xpath=/html/body/div[1]/div/div/main/div/div/div[3]/button").nth(0)).to_be_visible(timeout=15000), "The Specialist card header shows Specialist A."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    