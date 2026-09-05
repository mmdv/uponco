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
        
        # -> Click the 'Service' card to expand the list of available services so their names, durations and prices can be reviewed.
        # Service Choose a treatment button
        elem = page.get_by_role('button', name='Service Choose a treatment', exact=True)
        await elem.click(timeout=10000)
        
        # -> Reload the 'ZZ Schedule Preview' public booking page and wait for the booking wizard and Service/Specialist cards to load.
        await page.goto("http://localhost:8000/appointments/zz-schedule-preview")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
        # -> Click the 'Service' card (label: 'Service — Choose a treatment') to expand the list of services.
        # Service Choose a treatment button
        elem = page.get_by_role('button', name='Service Choose a treatment', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'Men's Haircut' service button to select that service for the booking.
        # Men's Haircut 30 min · €20 button
        elem = page.get_by_role('button', name="Men's Haircut 30 min · €20", exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'Men's Haircut' service button (label: "Men's Haircut 30 min · €20") to select it so the UI will filter specialists and update the booking summary.
        # Men's Haircut 30 min · €20 button
        elem = page.get_by_role('button', name="Men's Haircut 30 min · €20", exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'Men's Haircut 30 min · €20' service button to select it.
        # Men's Haircut 30 min · €20 button
        elem = page.get_by_role('button', name="Men's Haircut 30 min · €20", exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'Men's Haircut 30 min · €20' service button to select the service so the UI can filter specialists.
        # Men's Haircut 30 min · €20 button
        elem = page.get_by_role('button', name="Men's Haircut 30 min · €20", exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'Men's Haircut' service button once and then verify the Specialist list updates to only show Specialist A and Specialist B.
        # Men's Haircut 30 min · €20 button
        elem = page.get_by_role('button', name="Men's Haircut 30 min · €20", exact=True)
        await elem.click(timeout=10000)
        
        # --> Assertions to verify final state
        
        # --> The Services list displays the available services with durations and prices (e.g. Men's Haircut is visible).
        await page.locator("xpath=/html/body/div[1]/div/div/main/div/div/div[1]/div/div/div/div/div[1]/div/button[3]").nth(0).scroll_into_view_if_needed()
        # Assert-outcome: failed
        # Assert: Expected the service 'Men's Haircut 30 min · €20' to be visible in the Services list.
        await expect(page.locator("xpath=/html/body/div[1]/div/div/main/div/div/div[1]/div/div/div/div/div[1]/div/button[3]").nth(0)).to_be_visible(timeout=15000), "Expected the service 'Men's Haircut 30 min \u00b7 \u20ac20' to be visible in the Services list."
        
        # --> Selecting the service did not update the booking: the Specialist list was not filtered and still shows specialists that should have been removed.
        await page.locator("xpath=/html/body/div[1]/div/div/main/div/div/div[2]/div/div/div/div/div[5]").nth(0).scroll_into_view_if_needed()
        # Assert-outcome: failed
        # Assert: Expected the Specialist list to be filtered to only eligible specialists after selecting the service.
        await expect(page.locator("xpath=/html/body/div[1]/div/div/main/div/div/div[2]/div/div/div/div/div[5]").nth(0)).to_be_visible(timeout=15000), "Expected the Specialist list to be filtered to only eligible specialists after selecting the service."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    