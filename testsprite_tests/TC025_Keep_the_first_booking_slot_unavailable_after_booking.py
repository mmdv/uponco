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
        
        # -> Click the 'Private Pilates Lesson' service option to choose that individual service.
        # Private Pilates Lesson 1h · €40 One-on-one... button
        elem = page.get_by_role('button', name='Private Pilates Lesson 1h · €40 One-on-one pilates lesson with Specialist C.', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'Specialist C' option in the Specialist list to select Specialist C.
        # SC Specialist C Next available · Tomorrow 09:00... button
        elem = page.get_by_role('button', name='SC Specialist C Next available · Tomorrow 09:00 09:30 10:00 10:30', exact=True)
        await elem.click(timeout=10000)
        
        # -> Scroll down to reveal the Location card or the date & time picker so the 'Pick a date & time' controls can be selected.
        await page.mouse.wheel(0, 300)
        
        # -> Scroll down to reveal the 'Location' card so 'Preview studio' can be selected.
        await page.mouse.wheel(0, 300)
        
        # -> Open the 'Service' card, select 'Private Pilates Lesson', then open the 'Specialist' card and select 'Specialist C' so the Location card appears.
        # Service Choose a treatment button
        elem = page.get_by_role('button', name='Service Choose a treatment', exact=True)
        await elem.click(timeout=10000)
        
        # -> Open the 'Service' card, select 'Private Pilates Lesson', then open the 'Specialist' card and select 'Specialist C' so the Location card appears.
        # Private Pilates Lesson 1h · €40 One-on-one... button
        elem = page.get_by_role('button', name='Private Pilates Lesson 1h · €40 One-on-one pilates lesson with Specialist C.', exact=True)
        await elem.click(timeout=10000)
        
        # -> Open the 'Service' card, select 'Private Pilates Lesson', then open the 'Specialist' card and select 'Specialist C' so the Location card appears.
        # Specialist Choose who you'll see button
        elem = page.get_by_role('button', name='Service Private Pilates Lesson', exact=True)
        await elem.click(timeout=10000)
        
        # -> Open the 'Service' card, select 'Private Pilates Lesson', then open the 'Specialist' card and select 'Specialist C' so the Location card appears.
        # SC Specialist C Next available · Tomorrow 09:00... button
        elem = page.get_by_role('button', name='SC Specialist C Next available · Tomorrow 09:00 09:30 10:00 10:30', exact=True)
        await elem.click(timeout=10000)
        
        # -> Open the 'Service' card, select 'Private Pilates Lesson', then open the 'Specialist' card and select 'Specialist C' so the Location card appears.
        await page.mouse.wheel(0, 300)
        
        # -> Select the 'Preview studio' location and then click the 'Continue' button to proceed to the 'Pick a date & time' step.
        # Preview studio 80668 Maverick Trail Apt. 341... button
        elem = page.locator('xpath=/html/body/div/div/div/main/div/div/div/div/div/div/div/div')
        await elem.click(timeout=10000)
        
        # -> Select the 'Preview studio' location and then click the 'Continue' button to proceed to the 'Pick a date & time' step.
        # Continue button
        elem = page.get_by_role('button', name='Continue', exact=True)
        await elem.click(timeout=10000)
        
        # -> Select the '09:00 AM' time slot and click the 'Continue' button to open the customer details form.
        # 09:00 AM button
        elem = page.get_by_role('button', name='09:00 AM', exact=True)
        await elem.click(timeout=10000)
        
        # -> Select the '09:00 AM' time slot and click the 'Continue' button to open the customer details form.
        # Continue button
        elem = page.get_by_role('button', name='Continue', exact=True)
        await elem.click(timeout=10000)
        
        # -> Fill the 'Name surname' and 'Email' fields with a valid name and unique email, then click the 'Confirm booking' button.
        # Jane Doe text field
        elem = page.locator('[id="customer_name"]')
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("TS Testuser")
        
        # -> Fill the 'Name surname' and 'Email' fields with a valid name and unique email, then click the 'Confirm booking' button.
        # jane@example.com email field
        elem = page.locator('[id="customer_email"]')
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("ts-zz-0904-8462@example.com")
        
        # -> Fill the 'Name surname' and 'Email' fields with a valid name and unique email, then click the 'Confirm booking' button.
        # Confirm booking button
        elem = page.get_by_role('button', name='Confirm booking', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'Book another appointment' button on the success screen to start a new booking.
        # Book another appointment button
        elem = page.get_by_role('button', name='Book another appointment', exact=True)
        await elem.click(timeout=10000)
        
        # -> Select the 'Private Pilates Lesson' service and then select 'Specialist C' so the Location card appears and the flow can proceed to pick the same date.
        # Private Pilates Lesson 1h · €40 One-on-one... button
        elem = page.get_by_role('button', name='Private Pilates Lesson 1h · €40 One-on-one pilates lesson with Specialist C.', exact=True)
        await elem.click(timeout=10000)
        
        # -> Select the 'Private Pilates Lesson' service and then select 'Specialist C' so the Location card appears and the flow can proceed to pick the same date.
        # SC Specialist C Next available · Tomorrow 11:00... button
        elem = page.get_by_role('button', name='SC Specialist C Next available · Tomorrow 11:00 11:30 12:00 12:30', exact=True)
        await elem.click(timeout=10000)
        
        # -> Select the 'Private Pilates Lesson' service and then select 'Specialist C' so the Location card appears and the flow can proceed to pick the same date.
        await page.mouse.wheel(0, 300)
        
        # -> Select the 'Private Pilates Lesson' service and then choose 'Specialist C' so the Location and date/time controls appear.
        # Private Pilates Lesson 1h · €40 One-on-one... button
        elem = page.get_by_role('button', name='Private Pilates Lesson 1h · €40 One-on-one pilates lesson with Specialist C.', exact=True)
        await elem.click(timeout=10000)
        
        # -> Select the 'Private Pilates Lesson' service and then choose 'Specialist C' so the Location and date/time controls appear.
        # SC Specialist C Next available · Tomorrow 11:00... button
        elem = page.get_by_role('button', name='SC Specialist C Next available · Tomorrow 11:00 11:30 12:00 12:30', exact=True)
        await elem.click(timeout=10000)
        
        # -> Select the 'Private Pilates Lesson' service and then choose 'Specialist C' so the Location and date/time controls appear.
        await page.mouse.wheel(0, 300)
        
        # -> Select the 'Private Pilates Lesson' service, choose 'Specialist C', reveal the location/date controls, and proceed to the 'Pick a date & time' step.
        # Service Choose a treatment button
        elem = page.get_by_role('button', name='Service Choose a treatment', exact=True)
        await elem.click(timeout=10000)
        
        # -> Select the 'Private Pilates Lesson' service, choose 'Specialist C', reveal the location/date controls, and proceed to the 'Pick a date & time' step.
        # Private Pilates Lesson 1h · €40 One-on-one... button
        elem = page.get_by_role('button', name='Private Pilates Lesson 1h · €40 One-on-one pilates lesson with Specialist C.', exact=True)
        await elem.click(timeout=10000)
        
        # -> Select the 'Private Pilates Lesson' service, choose 'Specialist C', reveal the location/date controls, and proceed to the 'Pick a date & time' step.
        # SC Specialist C Next available · Tomorrow 11:00... button
        elem = page.get_by_role('button', name='SC Specialist C Next available · Tomorrow 11:00 11:30 12:00 12:30', exact=True)
        await elem.click(timeout=10000)
        
        # -> Select the 'Private Pilates Lesson' service, choose 'Specialist C', reveal the location/date controls, and proceed to the 'Pick a date & time' step.
        await page.mouse.wheel(0, 300)
        
        # -> Click the 'Specialist C' option to reveal the date & time controls.
        # SC Specialist C Next available · Tomorrow 11:00... button
        elem = page.get_by_role('button', name='SC Specialist C Next available · Tomorrow 11:00 11:30 12:00 12:30', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'Specialist C' option to reveal the date & time controls.
        await page.mouse.wheel(0, 300)
        
        # --> Assertions to verify final state
        
        # --> The previously booked 09:00 slot for Specialist C is no longer listed in the specialist's next-available times.
        # Assert-outcome: passed
        # Assert: Specialist C's summary shows next-available times starting at 11:00, which does not include 09:00.
        await expect(page.locator("xpath=/html/body/div/div/div/main/div/div/div[3]/div/div/div/div/div").nth(0)).to_have_text("SC\nSpecialist C\nNext available \u00b7 Tomorrow\n11:00\n11:30\n12:00\n", timeout=15000), "Specialist C's summary shows next-available times starting at 11:00, which does not include 09:00."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    