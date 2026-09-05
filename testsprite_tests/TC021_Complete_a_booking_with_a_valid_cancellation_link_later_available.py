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
        
        # -> Reload the booking page and wait for the booking wizard to load so the "Choose your booking details" wizard appears.
        await page.goto("http://localhost:8000/appointments/zz-schedule-preview")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
        # -> Click the 'Service' card header, choose the 'Men's Haircut' service, expand the 'Specialist' card, choose 'Specialist A', then click the 'Continue' button to go to the date & time step.
        # Service Choose a treatment button
        elem = page.get_by_role('button', name='Service Choose a treatment', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'Service' card header, choose the 'Men's Haircut' service, expand the 'Specialist' card, choose 'Specialist A', then click the 'Continue' button to go to the date & time step.
        # Men's Haircut 30 min · €20 button
        elem = page.get_by_role('button', name="Men's Haircut 30 min · €20", exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'Service' card header, choose the 'Men's Haircut' service, expand the 'Specialist' card, choose 'Specialist A', then click the 'Continue' button to go to the date & time step.
        # Specialist Choose who you'll see button
        elem = page.get_by_role('button', name="Service Men's Haircut", exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'Service' card header, choose the 'Men's Haircut' service, expand the 'Specialist' card, choose 'Specialist A', then click the 'Continue' button to go to the date & time step.
        # SA Specialist A Next available · Tomorrow 09:00... button
        elem = page.locator('xpath=/html/body/div/div/div/main/div/div/div[2]/div/div/div/div/div[3]')
        await elem.click(timeout=10000)
        
        # -> Click the 'Service' card header, choose the 'Men's Haircut' service, expand the 'Specialist' card, choose 'Specialist A', then click the 'Continue' button to go to the date & time step.
        # Continue button
        elem = page.get_by_role('button', name='Continue', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'Specialist B' entry to select Specialist B and check whether the 'Continue' button becomes enabled or the wizard advances.
        # SB Specialist B Next available · Tomorrow 09:00... button
        elem = page.get_by_role('button', name='SB Specialist B Next available · Tomorrow 09:00 09:30 10:00 10:30', exact=True)
        await elem.click(timeout=10000)
        
        # -> Select the 'Preview studio' location and then click the 'Continue' button to proceed to the date & time step.
        # Preview studio 80668 Maverick Trail Apt. 341... button
        elem = page.locator('xpath=/html/body/div/div/div/main/div/div/div/div/div/div/div/div')
        await elem.click(timeout=10000)
        
        # -> Select the 'Preview studio' location and then click the 'Continue' button to proceed to the date & time step.
        # Continue button
        elem = page.get_by_role('button', name='Continue', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the '11:00 AM' time slot, then click the 'Continue' button to open the customer details form.
        # 11:00 AM button
        elem = page.get_by_role('button', name='11:00 AM', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the '11:00 AM' time slot, then click the 'Continue' button to open the customer details form.
        # Continue button
        elem = page.get_by_role('button', name='Continue', exact=True)
        await elem.click(timeout=10000)
        
        # -> Fill the 'Name surname' and 'Email' fields, then click the 'Confirm booking' button to submit the booking.
        # Jane Doe text field
        elem = page.locator('[id="customer_name"]')
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("TS ZZ Test")
        
        # -> Fill the 'Name surname' and 'Email' fields, then click the 'Confirm booking' button to submit the booking.
        # jane@example.com email field
        elem = page.locator('[id="customer_email"]')
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("ts-zz-8372@example.com")
        
        # -> Fill the 'Name surname' and 'Email' fields, then click the 'Confirm booking' button to submit the booking.
        # Confirm booking button
        elem = page.get_by_role('button', name='Confirm booking', exact=True)
        await elem.click(timeout=10000)
        
        # --> Assertions to verify final state
        
        # --> The booking success header 'You're booked in' is shown.
        # Assert-outcome: passed
        # Assert: The success header reads "You're booked in".
        await expect(page.locator("xpath=/html/body/div[1]/div/div/main/div/div[1]/span").nth(0)).to_have_text("You're booked in", timeout=15000), "The success header reads \"You're booked in\"."
        
        # --> A 'Book another appointment' button is visible on the success screen.
        # Assert-outcome: passed
        # Assert: The 'Book another appointment' button is present.
        await expect(page.locator("xpath=/html/body/div[1]/div/div/main/div/button").nth(0)).to_have_text("Book another appointment", timeout=15000), "The 'Book another appointment' button is present."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    