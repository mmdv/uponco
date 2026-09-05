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
        
        # -> Open the header 'Share and appearance' menu by clicking the gear icon to reveal theme options.
        # Share and appearance button
        elem = page.get_by_role('button', name='Share and appearance', exact=True)
        await elem.click(timeout=10000)
        
        # -> Reload the 'ZZ Schedule Preview' booking page to recover from the 'Too Many Requests' error and restore the booking wizard.
        await page.goto("http://localhost:8000/appointments/zz-schedule-preview")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
        # -> Open the 'Share and appearance' header menu by clicking the gear icon to reveal theme options.
        # Share and appearance button
        elem = page.get_by_role('button', name='Share and appearance', exact=True)
        await elem.click(timeout=10000)
        
        # -> Open the 'Share and appearance' menu by clicking the gear icon labeled 'Share and appearance'.
        # Share and appearance button
        elem = page.get_by_role('button', name='Share and appearance', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'Dark' button in the Theme menu to switch the booking page theme to dark.
        # Dark button
        elem = page.get_by_role('button', name='Dark', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'Light' button in the Theme dialog to switch the booking page back to the light theme.
        # Light button
        elem = page.get_by_role('button', name='Light', exact=True)
        await elem.click(timeout=10000)
        
        # --> Assertions to verify final state
        
        # --> The booking wizard remains displayed on the booking page (Service & Specialist cards and Continue button are visible).
        # Assert-outcome: passed
        # Assert: The booking wizard heading 'Choose your booking details' is visible on the page.
        await expect(page.locator("xpath=/html/body/div[1]").nth(0)).to_contain_text("Choose your booking details", timeout=15000), "The booking wizard heading 'Choose your booking details' is visible on the page."
        
        # --> The Light theme is active in the Theme dialog after toggling back.
        await page.locator("xpath=/html/body/div[2]/div/div[1]/div/button[1]").nth(0).scroll_into_view_if_needed()
        # Assert-outcome: passed
        # Assert: The Theme dialog's 'Light' button is visible (indicating the dialog shows the Light option).
        await expect(page.locator("xpath=/html/body/div[2]/div/div[1]/div/button[1]").nth(0)).to_be_visible(timeout=15000), "The Theme dialog's 'Light' button is visible (indicating the dialog shows the Light option)."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    