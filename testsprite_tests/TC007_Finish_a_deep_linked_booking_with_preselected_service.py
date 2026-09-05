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
        
        # -> Open the service deep link '/appointments/zz-schedule-preview/service/mens-haircut' and wait for the booking UI to load.
        await page.goto("http://localhost:8000/appointments/zz-schedule-preview/service/mens-haircut")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
        # -> Expand the 'Specialist' card so the list of specialists (e.g., 'Specialist A' and 'Specialist B') is visible for selection.
        # Specialist Specialist B button
        elem = page.get_by_role('button', name='Specialist Specialist B', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'Continue' button to move to the date & time picker (after enumerating visible specialists).
        # Continue button
        elem = page.get_by_role('button', name='Continue', exact=True)
        await elem.click(timeout=10000)
        
        # -> Select the '10:00 AM' time slot and click the 'Continue' button to open the customer details form.
        # 10:00 AM button
        elem = page.get_by_role('button', name='10:00 AM', exact=True)
        await elem.click(timeout=10000)
        
        # -> Select the '10:00 AM' time slot and click the 'Continue' button to open the customer details form.
        # Continue button
        elem = page.get_by_role('button', name='Continue', exact=True)
        await elem.click(timeout=10000)
        
        # -> Fill the 'Name' and 'Email' fields and click the 'Confirm booking' button.
        # Jane Doe text field
        elem = page.locator('[id="customer_name"]')
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("Test User")
        
        # -> Fill the 'Name' and 'Email' fields and click the 'Confirm booking' button.
        # jane@example.com email field
        elem = page.locator('[id="customer_email"]')
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("ts-zz-0905-1234@example.com")
        
        # -> Fill the 'Name' and 'Email' fields and click the 'Confirm booking' button.
        # Confirm booking button
        elem = page.get_by_role('button', name='Confirm booking', exact=True)
        await elem.click(timeout=10000)
        
        # -> Select the '09:00 AM' time slot and click the 'Continue' button to open the customer details form.
        # 09:00 AM button
        elem = page.get_by_role('button', name='09:00 AM', exact=True)
        await elem.click(timeout=10000)
        
        # -> Select the '09:00 AM' time slot and click the 'Continue' button to open the customer details form.
        # Continue button
        elem = page.get_by_role('button', name='Continue', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'Confirm booking' button to submit the booking and verify the 'You're booked in' confirmation appears.
        # Confirm booking button
        elem = page.get_by_role('button', name='Confirm booking', exact=True)
        await elem.click(timeout=10000)
        
        # -> Select the '6 Sep' day chip, choose the '12:00 PM' time slot, then click the 'Continue' button to open the customer details form.
        # Sun 6 Sep button
        elem = page.get_by_role('button', name='Sun 6 Sep', exact=True)
        await elem.click(timeout=10000)
        
        # -> Select the '6 Sep' day chip, choose the '12:00 PM' time slot, then click the 'Continue' button to open the customer details form.
        # 12:00 PM button
        elem = page.get_by_role('button', name='09:00 AM', exact=True)
        await elem.click(timeout=10000)
        
        # -> Select the '6 Sep' day chip, choose the '12:00 PM' time slot, then click the 'Continue' button to open the customer details form.
        # Continue button
        elem = page.get_by_role('button', name='Continue', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the '12:00 PM' time slot and then click the 'Continue' button to open the customer details form.
        # 12:00 PM button
        elem = page.get_by_role('button', name='12:00 PM', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the '12:00 PM' time slot and then click the 'Continue' button to open the customer details form.
        # Continue button
        elem = page.get_by_role('button', name='Continue', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'Confirm booking' button to submit the booking and verify a 'You're booked in' confirmation appears.
        # Confirm booking button
        elem = page.get_by_role('button', name='Confirm booking', exact=True)
        await elem.click(timeout=10000)
        
        # --> Assertions to verify final state
        
        # --> A booking confirmation reading "You're booked in" is visible on the page.
        # Assert-outcome: passed
        # Assert: Booking confirmation heading equals "You're booked in".
        await expect(page.locator("xpath=/html/body/div[1]/div/div/main/div/div[1]/span").nth(0)).to_have_text("You're booked in", timeout=15000), "Booking confirmation heading equals \"You're booked in\"."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    