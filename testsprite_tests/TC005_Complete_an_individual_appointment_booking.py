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
        
        # -> Select the 'Men's Haircut' service and then choose 'Specialist A' from the Specialist list.
        # Service Choose a treatment button
        elem = page.get_by_role('button', name='Service Choose a treatment', exact=True)
        await elem.click(timeout=10000)
        
        # -> Reload the 'ZZ Schedule Preview' booking page (http://localhost:8000/appointments/zz-schedule-preview) to try to recover from the 'Too Many Requests' error.
        await page.goto("http://localhost:8000/appointments/zz-schedule-preview")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
        # -> Click the 'Men's Haircut' service button to select that service.
        # Men's Haircut 30 min · €20 button
        elem = page.get_by_role('button', name="Men's Haircut 30 min · €20", exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'Specialist' card header to expand it, then verify the list shows only 'Specialist A' and 'Specialist B' (and that other specialists are absent).
        # Specialist Choose who you'll see button
        elem = page.get_by_role('button', name="Specialist Choose who you'll see", exact=True)
        await elem.click(timeout=10000)
        
        # -> Expand the 'Service' card and (re)select 'Men's Haircut' so the Specialist list should narrow to only 'Specialist A' and 'Specialist B'.
        # Service Choose a treatment button
        elem = page.get_by_role('button', name='Service Choose a treatment', exact=True)
        await elem.click(timeout=10000)
        
        # -> Expand the 'Service' card and (re)select 'Men's Haircut' so the Specialist list should narrow to only 'Specialist A' and 'Specialist B'.
        # Men's Haircut 30 min · €20 button
        elem = page.get_by_role('button', name="Men's Haircut 30 min · €20", exact=True)
        await elem.click(timeout=10000)
        
        # -> Expand the 'Specialist' card and verify it lists only 'Specialist A' and 'Specialist B' (and that other specialists are not present).
        # Specialist Choose who you'll see button
        elem = page.get_by_role('button', name="Specialist Choose who you'll see", exact=True)
        await elem.click(timeout=10000)
        
        # -> Verify the Specialist list shows only 'Specialist A' and 'Specialist B' (no 'Specialist C', 'Specialist D', 'Sam Idris', or 'Preview Owner'), then select 'Specialist A' and pick location 'Preview studio'.
        # SA Specialist A Next available · Today 09:00... button
        elem = page.get_by_role('button', name='SA Specialist A Next available · Today 09:00 09:30 10:00 10:30', exact=True)
        await elem.click(timeout=10000)
        
        # -> Verify the Specialist list shows only 'Specialist A' and 'Specialist B' (no 'Specialist C', 'Specialist D', 'Sam Idris', or 'Preview Owner'), then select 'Specialist A' and pick location 'Preview studio'.
        # Location Pick where to visit button
        elem = page.get_by_role('button', name='Location Pick where to visit', exact=True)
        await elem.click(timeout=10000)
        
        # -> Verify the Specialist list shows only 'Specialist A' and 'Specialist B' (no 'Specialist C', 'Specialist D', 'Sam Idris', or 'Preview Owner'), then select 'Specialist A' and pick location 'Preview studio'.
        # Preview studio 80668 Maverick Trail Apt. 341... button
        elem = page.locator('xpath=/html/body/div/div/div/main/div/div/div/div/div/div/div/div')
        await elem.click(timeout=10000)
        
        # -> Open the 'Location' card and click the 'Preview studio' option, then press the 'Continue' button to proceed to the date & time selection.
        # Location Pick where to visit button
        elem = page.get_by_role('button', name='Location Pick where to visit', exact=True)
        await elem.click(timeout=10000)
        
        # -> Open the 'Location' card and click the 'Preview studio' option, then press the 'Continue' button to proceed to the date & time selection.
        # Preview studio 80668 Maverick Trail Apt. 341... button
        elem = page.locator('xpath=/html/body/div/div/div/main/div/div/div/div/div/div/div/div')
        await elem.click(timeout=10000)
        
        # -> Open the 'Location' card and click the 'Preview studio' option, then press the 'Continue' button to proceed to the date & time selection.
        # Continue button
        elem = page.get_by_role('button', name='Continue', exact=True)
        await elem.click(timeout=10000)
        
        # -> Select the day '15 Sep' and the time slot '10:00 AM', then click the 'Continue' button to go to the customer details form.
        # Tue 15 Sep button
        elem = page.get_by_role('button', name='Tue 15 Sep', exact=True)
        await elem.click(timeout=10000)
        
        # -> Select the day '15 Sep' and the time slot '10:00 AM', then click the 'Continue' button to go to the customer details form.
        # 10:00 AM button
        elem = page.get_by_role('button', name='10:00 AM', exact=True)
        await elem.click(timeout=10000)
        
        # -> Select the day '15 Sep' and the time slot '10:00 AM', then click the 'Continue' button to go to the customer details form.
        # Continue button
        elem = page.get_by_role('button', name='Continue', exact=True)
        await elem.click(timeout=10000)
        
        # -> Select the day '15 Sep' and the time '10:00 AM', then click the 'Continue' button to open the customer details form.
        # Tue 15 Sep button
        elem = page.get_by_role('button', name='Tue 15 Sep', exact=True)
        await elem.click(timeout=10000)
        
        # -> Select the day '15 Sep' and the time '10:00 AM', then click the 'Continue' button to open the customer details form.
        # 10:00 AM button
        elem = page.get_by_role('button', name='10:00 AM', exact=True)
        await elem.click(timeout=10000)
        
        # -> Select the day '15 Sep' and the time '10:00 AM', then click the 'Continue' button to open the customer details form.
        # Continue button
        elem = page.get_by_role('button', name='Continue', exact=True)
        await elem.click(timeout=10000)
        
        # -> Fill the 'Name surname' field and the 'Email' field, then click the 'Confirm booking' button.
        # Jane Doe text field
        elem = page.locator('[id="customer_name"]')
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("TS3 TC013")
        
        # -> Fill the 'Name surname' field and the 'Email' field, then click the 'Confirm booking' button.
        # jane@example.com email field
        elem = page.locator('[id="customer_email"]')
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("ts3-tc013-20260905-001@example.com")
        
        # -> Fill the 'Name surname' field and the 'Email' field, then click the 'Confirm booking' button.
        # Confirm booking button
        elem = page.get_by_role('button', name='Confirm booking', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the '09:00 AM' time slot and then click the 'Continue' button to open the customer-details form.
        # 09:00 AM button
        elem = page.get_by_role('button', name='09:00 AM', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the '09:00 AM' time slot and then click the 'Continue' button to open the customer-details form.
        # Continue button
        elem = page.get_by_role('button', name='Continue', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'Confirm booking' button and verify the booking success screen displays "You're booked in".
        # Confirm booking button
        elem = page.get_by_role('button', name='Confirm booking', exact=True)
        await elem.click(timeout=10000)
        
        # --> Assertions to verify final state
        
        # --> Booking success screen is shown with the confirmation heading "You're booked in".
        # Assert-outcome: passed
        # Assert: Confirms the booking confirmation heading is visible.
        await expect(page.locator("xpath=/html/body/div[1]/div/div/main/div/div[1]/span").nth(0)).to_contain_text("You're booked in", timeout=15000), "Confirms the booking confirmation heading is visible."
        # Assert-outcome: passed
        # Assert: Verifies the booked service and its duration/price are shown on the confirmation.
        await expect(page.locator("xpath=/html/body/div[1]/div/div/main/div/div[2]/div/div[1]/span").nth(0)).to_contain_text("Men's Haircut \u00b7 30 min \u00b7 \u20ac20", timeout=15000), "Verifies the booked service and its duration/price are shown on the confirmation."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    