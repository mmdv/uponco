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
        
        # -> Open the deep link for "Men's Haircut" (navigate to /appointments/zz-schedule-preview/service/mens-haircut) and verify the service is preselected and locked on the booking page.
        await page.goto("http://localhost:8000/appointments/zz-schedule-preview/service/mens-haircut")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
        # -> Open the company booking preview page 'Choose your booking details' (ZZ Schedule Preview) to load the booking SPA and continue the flow.
        # Open URL in new tab
        page = await context.new_page()
        await page.goto("http://localhost:8000/appointments/zz-schedule-preview")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
        # -> Navigate to the Men's Haircut deep link (/appointments/zz-schedule-preview/service/mens-haircut) and check whether the service is preselected and locked.
        await page.goto("http://localhost:8000/appointments/zz-schedule-preview/service/mens-haircut")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
        # -> Check for locked deep-link markers (booking-locked-service, booking-locked-specialist, booking-locked-location) and then expand the 'Specialist' card by clicking the 'Specialist' header.
        # Specialist Choose who you'll see button
        elem = page.get_by_role('button', name="Specialist Choose who you'll see", exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'Specialist A' card to select Specialist A (then wait for the UI to reflect the selection).
        # SA Specialist A Next available · Today 09:00... button
        elem = page.get_by_role('button', name='SA Specialist A Next available · Today 09:00 09:30 10:00 10:30', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'Continue' button to go to the Pick a date & time step.
        # Continue button
        elem = page.get_by_role('button', name='Continue', exact=True)
        await elem.click(timeout=10000)
        
        # -> Select the day 'Sat 12 Sep' from the day strip, choose the '10:00 AM' time slot, and click the 'Continue' button to proceed to the customer details step.
        # Sat 12 Sep button
        elem = page.get_by_role('button', name='Sat 12 Sep', exact=True)
        await elem.click(timeout=10000)
        
        # -> Select the day 'Sat 12 Sep' from the day strip, choose the '10:00 AM' time slot, and click the 'Continue' button to proceed to the customer details step.
        # 10:00 AM button
        elem = page.get_by_role('button', name='10:00 AM', exact=True)
        await elem.click(timeout=10000)
        
        # -> Select the day 'Sat 12 Sep' from the day strip, choose the '10:00 AM' time slot, and click the 'Continue' button to proceed to the customer details step.
        # Continue button
        elem = page.get_by_role('button', name='Continue', exact=True)
        await elem.click(timeout=10000)
        
        # -> Select the day 'Tue 15 Sep', choose the '10:00 AM' time slot, then click the 'Continue' button to proceed to the customer details step.
        # Tue 15 Sep button
        elem = page.get_by_role('button', name='Tue 15 Sep', exact=True)
        await elem.click(timeout=10000)
        
        # -> Select the day 'Tue 15 Sep', choose the '10:00 AM' time slot, then click the 'Continue' button to proceed to the customer details step.
        # 10:00 AM button
        elem = page.get_by_role('button', name='10:00 AM', exact=True)
        await elem.click(timeout=10000)
        
        # -> Select the day 'Tue 15 Sep', choose the '10:00 AM' time slot, then click the 'Continue' button to proceed to the customer details step.
        # Continue button
        elem = page.get_by_role('button', name='Continue', exact=True)
        await elem.click(timeout=10000)
        
        # -> Select the '10:00 AM' time slot and then click the 'Continue' button to proceed to the customer details step.
        # 10:00 AM button
        elem = page.get_by_role('button', name='10:00 AM', exact=True)
        await elem.click(timeout=10000)
        
        # -> Select the '10:00 AM' time slot and then click the 'Continue' button to proceed to the customer details step.
        # Continue button
        elem = page.get_by_role('button', name='Continue', exact=True)
        await elem.click(timeout=10000)
        
        # -> Fill the 'Name surname' and 'Email' fields and click the 'Confirm booking' button to submit the appointment.
        # Jane Doe text field
        elem = page.locator('[id="customer_name"]')
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("TS3 Tester")
        
        # -> Fill the 'Name surname' and 'Email' fields and click the 'Confirm booking' button to submit the appointment.
        # jane@example.com email field
        elem = page.locator('[id="customer_email"]')
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("ts3-menshaircut-20260905-001@example.com")
        
        # -> Fill the 'Name surname' and 'Email' fields and click the 'Confirm booking' button to submit the appointment.
        # Confirm booking button
        elem = page.get_by_role('button', name='Confirm booking', exact=True)
        await elem.click(timeout=10000)
        
        # --> Assertions to verify final state
        
        # --> The Men's Haircut service is shown in the appointment summary (the deep link selected the service).
        # Assert-outcome: passed
        # Assert: The appointment summary shows the Men's Haircut service, duration, and price.
        await expect(page.locator("xpath=/html/body/div[1]/div/div/main/div/div[2]/div/div[1]/span").nth(0)).to_have_text("Men's Haircut \u00b7 30 min \u00b7 \u20ac20", timeout=15000), "The appointment summary shows the Men's Haircut service, duration, and price."
        
        # --> A booking confirmation screen is displayed with the heading "You're booked in".
        # Assert-outcome: passed
        # Assert: The confirmation heading 'You're booked in' is visible.
        await expect(page.locator("xpath=/html/body/div[1]/div/div/main/div/div[1]/span").nth(0)).to_have_text("You're booked in", timeout=15000), "The confirmation heading 'You're booked in' is visible."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    