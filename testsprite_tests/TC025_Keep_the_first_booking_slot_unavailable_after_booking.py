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
        
        # -> Reload the 'ZZ Schedule Preview' booking page to recover from the 'Too Many Requests' error and load the booking wizard.
        await page.goto("http://localhost:8000/appointments/zz-schedule-preview")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
        # -> Expand the 'Service' card and click the 'Men's Haircut' service option.
        # Service Choose a treatment button
        elem = page.get_by_role('button', name='Service Choose a treatment', exact=True)
        await elem.click(timeout=10000)
        
        # -> Expand the 'Service' card and click the 'Men's Haircut' service option.
        # Men's Haircut 30 min · €20 button
        elem = page.get_by_role('button', name="Men's Haircut 30 min · €20", exact=True)
        await elem.click(timeout=10000)
        
        # -> Expand the 'Specialist' card header so the specialist options are visible and can be verified (expect only 'Specialist A' and 'Specialist B').
        # Specialist Choose who you'll see button
        elem = page.get_by_role('button', name="Specialist Choose who you'll see", exact=True)
        await elem.click(timeout=10000)
        
        # -> Select 'Specialist A' from the Specialist list and click the 'Continue' button to proceed to the Pick a date & time step.
        # SA Specialist A Next available · Today 09:00... button
        elem = page.get_by_role('button', name='SA Specialist A Next available · Today 09:00 09:30 10:00 10:30', exact=True)
        await elem.click(timeout=10000)
        
        # -> Select 'Specialist A' from the Specialist list and click the 'Continue' button to proceed to the Pick a date & time step.
        # Continue button
        elem = page.get_by_role('button', name='Continue', exact=True)
        await elem.click(timeout=10000)
        
        # -> Select the 'Preview studio' location so the Continue button enables, then click the 'Continue' button to go to Pick a date & time.
        # Preview studio 80668 Maverick Trail Apt. 341... button
        elem = page.locator('xpath=/html/body/div/div/div/main/div/div/div/div/div/div/div/div')
        await elem.click(timeout=10000)
        
        # -> Select the 'Preview studio' location so the Continue button enables, then click the 'Continue' button to go to Pick a date & time.
        # Continue button
        elem = page.get_by_role('button', name='Continue', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the '12 Sep' day chip (label '12 Sep'), choose the '10:00 AM' time slot, then click the 'Continue' button to go to the customer details step.
        # Sat 12 Sep button
        elem = page.get_by_role('button', name='Sat 12 Sep', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the '12 Sep' day chip (label '12 Sep'), choose the '10:00 AM' time slot, then click the 'Continue' button to go to the customer details step.
        # 10:00 AM button
        elem = page.get_by_role('button', name='10:00 AM', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the '12 Sep' day chip (label '12 Sep'), choose the '10:00 AM' time slot, then click the 'Continue' button to go to the customer details step.
        # Continue button
        elem = page.get_by_role('button', name='Continue', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the '10:00 AM' time slot, then click the 'Continue' button to open the customer details form.
        # 10:00 AM button
        elem = page.get_by_role('button', name='10:00 AM', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the '10:00 AM' time slot, then click the 'Continue' button to open the customer details form.
        # Continue button
        elem = page.get_by_role('button', name='Continue', exact=True)
        await elem.click(timeout=10000)
        
        # -> Fill the Name field with 'Test User', fill the Email field with 'ts3-zz-4721@example.com', then click the 'Confirm booking' button to submit the booking.
        # Jane Doe text field
        elem = page.locator('[id="customer_name"]')
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("Test User")
        
        # -> Fill the Name field with 'Test User', fill the Email field with 'ts3-zz-4721@example.com', then click the 'Confirm booking' button to submit the booking.
        # jane@example.com email field
        elem = page.locator('[id="customer_email"]')
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("ts3-zz-4721@example.com")
        
        # -> Fill the Name field with 'Test User', fill the Email field with 'ts3-zz-4721@example.com', then click the 'Confirm booking' button to submit the booking.
        # Confirm booking button
        elem = page.get_by_role('button', name='Confirm booking', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'Confirm booking' button to submit the booking and reach the "You're booked in" success screen.
        # Confirm booking button
        elem = page.get_by_role('button', name='Confirm booking', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the back arrow button to return to the start of the booking wizard so a new booking can be started.
        # Back button
        elem = page.get_by_role('button', name='Back', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'Continue' button to go to the 'Pick a date & time' step and verify available times for 12 Sep 2026.
        # Continue button
        elem = page.get_by_role('button', name='Continue', exact=True)
        await elem.click(timeout=10000)
        
        # --> Assertions to verify final state
        
        # --> The booking page displays the message "The selected time slot is no longer available." indicating the previously booked slot is unavailable.
        # Assert-outcome: passed
        # Assert: The page displays the slot-unavailable notification.
        await expect(page.locator("xpath=/html/body/div/section").nth(0)).to_contain_text("The selected time slot is no longer available.", timeout=15000), "The page displays the slot-unavailable notification."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    