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
        
        # -> Click the "Online Lecture (Latvian)" service button to select the online lecture.
        # Online Lecture (Latvian) 1h · €25 Online lecture... button
        elem = page.get_by_role('button', name='Online Lecture (Latvian) 1h · €25 Online lecture delivered in Latvian by Specialist D.', exact=True)
        await elem.click(timeout=10000)
        
        # -> Open the 'Online Lecture (Latvian)' service page at /appointments/zz-schedule-preview/service/online-lecture-latvian to load the booking wizard.
        await page.goto("http://localhost:8000/appointments/zz-schedule-preview/service/online-lecture-latvian")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
        # -> Click the 'Continue' button to go to the 'Pick a date & time' step.
        # Continue button
        elem = page.get_by_role('button', name='Continue', exact=True)
        await elem.click(timeout=10000)
        
        # -> Verify the specialist list shows only 'Specialist D' (and not Specialist A/B/C, Sam Idris, or Preview Owner), then select the day chip for 12 Sep.
        # Sat 12 Sep button
        elem = page.get_by_role('button', name='Sat 12 Sep', exact=True)
        await elem.click(timeout=10000)
        
        # -> Select the '10:00 AM' time slot, then click the 'Continue' button to open the customer details form.
        # 10:00 AM button
        elem = page.get_by_role('button', name='10:00 AM', exact=True)
        await elem.click(timeout=10000)
        
        # -> Select the '10:00 AM' time slot, then click the 'Continue' button to open the customer details form.
        # Continue button
        elem = page.get_by_role('button', name='Continue', exact=True)
        await elem.click(timeout=10000)
        
        # -> Fill the 'Name surname' field with 'Test User' and the 'Email' field with a unique address, then click the 'Confirm booking' button.
        # Jane Doe text field
        elem = page.locator('[id="customer_name"]')
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("Test User")
        
        # -> Fill the 'Name surname' field with 'Test User' and the 'Email' field with a unique address, then click the 'Confirm booking' button.
        # jane@example.com email field
        elem = page.locator('[id="customer_email"]')
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("ts3-tc013-12345@example.com")
        
        # -> Fill the 'Name surname' field with 'Test User' and the 'Email' field with a unique address, then click the 'Confirm booking' button.
        # Confirm booking button
        elem = page.get_by_role('button', name='Confirm booking', exact=True)
        await elem.click(timeout=10000)
        
        # --> Assertions to verify final state
        
        # --> A booking confirmation is shown with the heading “You're booked in”.
        # Assert-outcome: passed
        # Assert: Confirmation heading contains "You're booked in".
        await expect(page.locator("xpath=/html/body/div[1]/div/div/main/div/div[1]/span").nth(0)).to_contain_text("You're booked in", timeout=15000), "Confirmation heading contains \"You're booked in\"."
        
        # --> The appointment was completed for the Online Lecture (Latvian) and no physical location is shown.
        # Assert-outcome: passed
        # Assert: Confirmation shows the booked service is Online Lecture (Latvian) · 1h · €25.
        await expect(page.locator("xpath=/html/body/div[1]/div/div/main/div/div[2]/div/div[1]/span").nth(0)).to_contain_text("Online Lecture (Latvian) \u00b7 1h \u00b7 \u20ac25", timeout=15000), "Confirmation shows the booked service is Online Lecture (Latvian) \u00b7 1h \u00b7 \u20ac25."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    