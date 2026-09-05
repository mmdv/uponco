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
        
        # -> Open the 'Online Lecture (Latvian)' service page by navigating to the service deep-link URL.
        await page.goto("http://localhost:8000/appointments/zz-schedule-preview/service/online-lecture-latvian")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
        # -> Click the 'Continue' button to proceed to the "Pick a date & time" step.
        # Continue button
        elem = page.get_by_role('button', name='Continue', exact=True)
        await elem.click(timeout=10000)
        
        # -> Select the '5 September' day chip and then click the '10:00 AM' time slot so the Continue button enables.
        # Tmrw 5 Sep button
        elem = page.get_by_role('button', name='Tmrw 5 Sep', exact=True)
        await elem.click(timeout=10000)
        
        # -> Select the '5 September' day chip and then click the '10:00 AM' time slot so the Continue button enables.
        # 10:00 AM button
        elem = page.get_by_role('button', name='10:00 AM', exact=True)
        await elem.click(timeout=10000)
        
        # -> Select the '5 September' day chip and then click the '10:00 AM' time slot so the Continue button enables.
        # Continue button
        elem = page.get_by_role('button', name='Continue', exact=True)
        await elem.click(timeout=10000)
        
        # -> Fill the Name and Email fields and click the "Confirm booking" button to submit the appointment, after verifying no physical location is requested.
        # Jane Doe text field
        elem = page.locator('[id="customer_name"]')
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("TS Testuser")
        
        # -> Fill the Name and Email fields and click the "Confirm booking" button to submit the appointment, after verifying no physical location is requested.
        # jane@example.com email field
        elem = page.locator('[id="customer_email"]')
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("ts-ol-20260904-001@example.com")
        
        # -> Fill the Name and Email fields and click the "Confirm booking" button to submit the appointment, after verifying no physical location is requested.
        # Confirm booking button
        elem = page.get_by_role('button', name='Confirm booking', exact=True)
        await elem.click(timeout=10000)
        
        # --> Assertions to verify final state
        
        # --> The booked service is the online 'Online Lecture (Latvian)' (no physical location).
        # Assert-outcome: passed
        # Assert: The confirmation card shows the service as 'Online Lecture (Latvian)', indicating an online (no-location) service.
        await expect(page.locator("xpath=/html/body/div[1]/div/div/main/div/div[2]/div/div[1]/span").nth(0)).to_contain_text("Online Lecture (Latvian) \u00b7 1h \u00b7 \u20ac25", timeout=15000), "The confirmation card shows the service as 'Online Lecture (Latvian)', indicating an online (no-location) service."
        
        # --> A booking confirmation page is shown with the heading "You're booked in".
        # Assert-outcome: passed
        # Assert: The page displays the confirmation heading "You're booked in".
        await expect(page.locator("xpath=/html/body/div[1]/div/div/main/div/div[1]/span").nth(0)).to_contain_text("You're booked in", timeout=15000), "The page displays the confirmation heading \"You're booked in\"."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    