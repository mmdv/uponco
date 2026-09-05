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
        
        # -> Open the 'Group Pilates Class' service page (navigate to the Group Pilates Class service URL).
        await page.goto("http://localhost:8000/appointments/zz-schedule-preview/service/group-pilates-class")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
        # -> Open the ZZ Schedule Preview booking start page (Appointments — ZZ Schedule Preview) to retry the booking flow.
        await page.goto("http://localhost:8000/appointments/zz-schedule-preview")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
        # -> Expand the 'Service' card and select the 'Group Pilates Class' service.
        # Service Choose a treatment button
        elem = page.get_by_role('button', name='Service Choose a treatment', exact=True)
        await elem.click(timeout=10000)
        
        # -> Expand the 'Service' card and select the 'Group Pilates Class' service.
        # Group Pilates Class 1h · €15 Group pilates... button
        elem = page.get_by_role('button', name='Group Pilates Class 1h · €15 Group pilates session led by Specialist C.', exact=True)
        await elem.click(timeout=10000)
        
        # -> Expand the 'Specialist' card and select 'Specialist C', then click the 'Continue' button to go to the date & time picker.
        # Specialist Choose who you'll see button
        elem = page.get_by_role('button', name="Specialist Choose who you'll see", exact=True)
        await elem.click(timeout=10000)
        
        # -> Expand the 'Specialist' card and select 'Specialist C', then click the 'Continue' button to go to the date & time picker.
        # SC Specialist C Next available · Today 09:00... button
        elem = page.get_by_role('button', name='SC Specialist C Next available · Today 09:00 09:30 10:00 10:30', exact=True)
        await elem.click(timeout=10000)
        
        # -> Expand the 'Specialist' card and select 'Specialist C', then click the 'Continue' button to go to the date & time picker.
        # Continue button
        elem = page.get_by_role('button', name='Continue', exact=True)
        await elem.click(timeout=10000)
        
        # -> Open the 'Group Pilates Class' service page (the service details / date & time view).
        await page.goto("http://localhost:8000/appointments/zz-schedule-preview/service/group-pilates-class")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
        # -> Click the 'Continue' button to go to the "Pick a date & time" step so a booking day and time can be selected.
        # Continue button
        elem = page.get_by_role('button', name='Continue', exact=True)
        await elem.click(timeout=10000)
        
        # -> Select the 12 September day and the 10:00 AM time slot, then click the 'Continue' button to open the customer details form.
        # Sat 12 Sep button
        elem = page.get_by_role('button', name='Sat 12 Sep', exact=True)
        await elem.click(timeout=10000)
        
        # -> Select the 12 September day and the 10:00 AM time slot, then click the 'Continue' button to open the customer details form.
        # 10:00 AM 10 left button
        elem = page.get_by_role('button', name='10:00 AM 10 left', exact=True)
        await elem.click(timeout=10000)
        
        # -> Select the 12 September day and the 10:00 AM time slot, then click the 'Continue' button to open the customer details form.
        # Continue button
        elem = page.get_by_role('button', name='Continue', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the '10:00 AM' time slot, then click the 'Continue' button to open the customer details form.
        # 10:00 AM 10 left button
        elem = page.get_by_role('button', name='10:00 AM 10 left', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the '10:00 AM' time slot, then click the 'Continue' button to open the customer details form.
        # Continue button
        elem = page.get_by_role('button', name='Continue', exact=True)
        await elem.click(timeout=10000)
        
        # -> Fill the 'Name surname' and 'Email' fields and click the 'Confirm booking' button to create one booking for Sat, Sep 12, 2026 · 10:00 AM.
        # Jane Doe text field
        elem = page.locator('[id="customer_name"]')
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("TS3 Tester")
        
        # -> Fill the 'Name surname' and 'Email' fields and click the 'Confirm booking' button to create one booking for Sat, Sep 12, 2026 · 10:00 AM.
        # jane@example.com email field
        elem = page.locator('[id="customer_email"]')
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("ts3-tc013-20260905-01@example.com")
        
        # -> Fill the 'Name surname' and 'Email' fields and click the 'Confirm booking' button to create one booking for Sat, Sep 12, 2026 · 10:00 AM.
        # Confirm booking button
        elem = page.get_by_role('button', name='Confirm booking', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'Book another appointment' button to return to the booking wizard and re-open the Group Pilates Class booking flow.
        # Book another appointment button
        elem = page.get_by_role('button', name='Book another appointment', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'Continue' button to open the "Pick a date & time" step so the previously booked day and time can be inspected.
        # Continue button
        elem = page.get_by_role('button', name='Continue', exact=True)
        await elem.click(timeout=10000)
        
        # -> Select the '12 Sep' day chip and the '10:00 AM' time slot, then click the 'Continue' button to open the customer details form.
        # Sat 12 Sep button
        elem = page.get_by_role('button', name='Sat 12 Sep', exact=True)
        await elem.click(timeout=10000)
        
        # -> Select the '12 Sep' day chip and the '10:00 AM' time slot, then click the 'Continue' button to open the customer details form.
        # 10:00 AM 10 left button
        elem = page.get_by_role('button', name='10:00 AM 9 left', exact=True)
        await elem.click(timeout=10000)
        
        # -> Select the '12 Sep' day chip and the '10:00 AM' time slot, then click the 'Continue' button to open the customer details form.
        # Continue button
        elem = page.get_by_role('button', name='Continue', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the '10:00 AM' time slot, then click the 'Continue' button to open the customer details form and confirm the slot is selectable.
        # 10:00 AM 9 left button
        elem = page.get_by_role('button', name='10:00 AM 9 left', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the '10:00 AM' time slot, then click the 'Continue' button to open the customer details form and confirm the slot is selectable.
        # Continue button
        elem = page.get_by_role('button', name='Continue', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'Back' button to return to the 'Pick a date & time' step and verify the 10:00 AM slot still shows reduced remaining spots and is selectable.
        # Back button
        elem = page.get_by_role('button', name='Back', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the '10:00 AM' time slot and then click the 'Continue' button to open the customer details form, and verify the slot shows '9 left' on the page.
        # 10:00 AM 9 left button
        elem = page.get_by_role('button', name='10:00 AM 9 left', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the '10:00 AM' time slot and then click the 'Continue' button to open the customer details form, and verify the slot shows '9 left' on the page.
        # Continue button
        elem = page.get_by_role('button', name='Continue', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'Back' button to return to the 'Pick a date & time' step and inspect the 10:00 AM slot for availability and a reduced remaining-spots count.
        # Back button
        elem = page.get_by_role('button', name='Back', exact=True)
        await elem.click(timeout=10000)
        
        # --> Assertions to verify final state
        
        # --> The 10:00 AM slot for Sep 12 is still available and visible on the Pick a date & time step.
        await page.locator("xpath=/html/body/div/div/div/main/div/div/section[2]/div/button[2]").nth(0).scroll_into_view_if_needed()
        # Assert-outcome: passed
        # Assert: The 10:00 AM slot is visible on the page.
        await expect(page.locator("xpath=/html/body/div/div/div/main/div/div/section[2]/div/button[2]").nth(0)).to_be_visible(timeout=15000), "The 10:00 AM slot is visible on the page."
        
        # --> The remaining-spots count for the 10:00 AM slot decreased (was 10 left, now shows 9 left).
        # Assert-outcome: passed
        # Assert: The time slot label shows '9 left', indicating one fewer spot.
        await expect(page.locator("xpath=/html/body/div/div/div/main/div/div/section[2]/div/button[2]").nth(0)).to_contain_text("9 left", timeout=15000), "The time slot label shows '9 left', indicating one fewer spot."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    