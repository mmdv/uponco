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
        
        # -> Open the 'Online Lecture (Latvian)' service page (navigate to the Online Lecture (Latvian) deep link).
        await page.goto("http://localhost:8000/appointments/zz-schedule-preview/service/online-lecture-latvian")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
        # -> Click the 'Continue' button to move from 'Choose your booking details' to the 'Pick a date & time' step
        # Continue button
        elem = page.get_by_role('button', name='Continue', exact=True)
        await elem.click(timeout=10000)
        
        # -> Select the 09:00 AM time slot and click the 'Continue' button to open the customer details form.
        # 09:00 AM button
        elem = page.get_by_role('button', name='09:00 AM', exact=True)
        await elem.click(timeout=10000)
        
        # -> Select the 09:00 AM time slot and click the 'Continue' button to open the customer details form.
        # Continue button
        elem = page.get_by_role('button', name='Continue', exact=True)
        await elem.click(timeout=10000)
        
        # -> Fill the 'Name surname' and 'Email' fields, then click the 'Confirm booking' button to submit the booking.
        # Jane Doe text field
        elem = page.locator('[id="customer_name"]')
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("Test User")
        
        # -> Fill the 'Name surname' and 'Email' fields, then click the 'Confirm booking' button to submit the booking.
        # jane@example.com email field
        elem = page.locator('[id="customer_email"]')
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("ts-onlinelecture-20260904-001@example.com")
        
        # -> Fill the 'Name surname' and 'Email' fields, then click the 'Confirm booking' button to submit the booking.
        # Confirm booking button
        elem = page.get_by_role('button', name='Confirm booking', exact=True)
        await elem.click(timeout=10000)
        
        # --> Assertions to verify final state
        
        # --> A booking success screen is shown with the header "You're booked in".
        # Assert-outcome: passed
        # Assert: Verifies the booking success header text is visible.
        await expect(page.locator("xpath=/html/body/div[1]/div/div/main/div/div[1]/span").nth(0)).to_have_text("You're booked in", timeout=15000), "Verifies the booking success header text is visible."
        
        # --> The appointment recap shows the Online Lecture (Latvian) service, confirming the booking was for an online (no-location) service.
        # Assert-outcome: passed
        # Assert: Verifies the appointment recap shows the Online Lecture (Latvian) service (an online service with no physical location).
        await expect(page.locator("xpath=/html/body/div[1]/div/div/main/div/div[2]/div/div[1]/span").nth(0)).to_have_text("Online Lecture (Latvian) \u00b7 1h \u00b7 \u20ac25", timeout=15000), "Verifies the appointment recap shows the Online Lecture (Latvian) service (an online service with no physical location)."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    