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
        
        # -> Select the "Men's Haircut" service from the Service list.
        # Men's Haircut 30 min · €20 button
        elem = page.get_by_role('button', name="Men's Haircut 30 min · €20", exact=True)
        await elem.click(timeout=10000)
        
        # -> Expand the 'Specialist' card so the list of available specialists is visible.
        # Specialist Choose who you'll see button
        elem = page.get_by_role('button', name="Specialist Choose who you'll see", exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'Men's Haircut' service button to ensure the service selection is applied.
        # Men's Haircut 30 min · €20 button
        elem = page.get_by_role('button', name="Men's Haircut 30 min · €20", exact=True)
        await elem.click(timeout=10000)
        
        # --> Assertions to verify final state
        
        # --> Booking could not complete because selecting "Men's Haircut" did not narrow the specialist list to only Specialist A and Specialist B.
        # Assert-outcome: failed
        # Assert: Expected 'Preview Owner' to be removed from the specialist list after selecting "Men's Haircut".
        await expect(page.locator("xpath=/html/body/div[1]/div/div/main/div/div/div[2]/div/div/div/div/div[1]").nth(0)).not_to_be_visible(timeout=15000), "Expected 'Preview Owner' to be removed from the specialist list after selecting \"Men's Haircut\"."
        # Assert-outcome: failed
        # Assert: Expected 'Sam Idris' to be removed from the specialist list after selecting "Men's Haircut".
        await expect(page.locator("xpath=/html/body/div[1]/div/div/main/div/div/div[2]/div/div/div/div/div[2]").nth(0)).not_to_be_visible(timeout=15000), "Expected 'Sam Idris' to be removed from the specialist list after selecting \"Men's Haircut\"."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    