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
        
        # -> Click the 'Men's Haircut' service to choose that on-site service.
        # Men's Haircut 30 min · €20 button
        elem = page.get_by_role('button', name="Men's Haircut 30 min · €20", exact=True)
        await elem.click(timeout=10000)
        
        # -> Open the 'Specialist' card and check that only 'Specialist A' and 'Specialist B' are listed (other specialists must be absent).
        # Specialist Choose who you'll see button
        elem = page.get_by_role('button', name="Specialist Choose who you'll see", exact=True)
        await elem.click(timeout=10000)
        
        # -> Expand the 'Service' card and select the 'Men's Haircut' service so the Specialist list should be narrowed to Specialist A and Specialist B.
        # Service Choose a treatment button
        elem = page.get_by_role('button', name='Service Choose a treatment', exact=True)
        await elem.click(timeout=10000)
        
        # -> Expand the 'Service' card and select the 'Men's Haircut' service so the Specialist list should be narrowed to Specialist A and Specialist B.
        # Men's Haircut 30 min · €20 button
        elem = page.get_by_role('button', name="Men's Haircut 30 min · €20", exact=True)
        await elem.click(timeout=10000)
        
        # -> Open the 'Specialist' card and select 'Specialist A', then click the 'Continue' button to go to the date & time step.
        # Specialist Choose who you'll see button
        elem = page.get_by_role('button', name="Specialist Choose who you'll see", exact=True)
        await elem.click(timeout=10000)
        
        # -> Open the 'Specialist' card and select 'Specialist A', then click the 'Continue' button to go to the date & time step.
        # SA Specialist A Next available · Tomorrow 09:00... button
        elem = page.get_by_role('button', name='SA Specialist A Next available · Tomorrow 09:00 09:30 10:00 10:30', exact=True)
        await elem.click(timeout=10000)
        
        # -> Open the 'Specialist' card and select 'Specialist A', then click the 'Continue' button to go to the date & time step.
        # Continue button
        elem = page.get_by_role('button', name='Continue', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the location option labeled 'Preview studio' to select it, then click the 'Continue' button to go to the date & time step.
        # Preview studio 80668 Maverick Trail Apt. 341... button
        elem = page.locator('xpath=/html/body/div/div/div/main/div/div/div/div/div/div/div/div')
        await elem.click(timeout=10000)
        
        # -> Click the location option labeled 'Preview studio' to select it, then click the 'Continue' button to go to the date & time step.
        # Continue button
        elem = page.get_by_role('button', name='Continue', exact=True)
        await elem.click(timeout=10000)
        
        # -> Select the date '12 Sep' and the '10:00 AM' time slot, then click the 'Continue' button to open the customer details form.
        # Sat 12 Sep button
        elem = page.get_by_role('button', name='Sat 12 Sep', exact=True)
        await elem.click(timeout=10000)
        
        # -> Select the date '12 Sep' and the '10:00 AM' time slot, then click the 'Continue' button to open the customer details form.
        # 10:00 AM button
        elem = page.get_by_role('button', name='10:00 AM', exact=True)
        await elem.click(timeout=10000)
        
        # -> Select the date '12 Sep' and the '10:00 AM' time slot, then click the 'Continue' button to open the customer details form.
        # Continue button
        elem = page.get_by_role('button', name='Continue', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the '10:00 AM' time slot and then click the 'Continue' button to open the customer details form.
        # 10:00 AM button
        elem = page.get_by_role('button', name='10:00 AM', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the '10:00 AM' time slot and then click the 'Continue' button to open the customer details form.
        # Continue button
        elem = page.get_by_role('button', name='Continue', exact=True)
        await elem.click(timeout=10000)
        
        # -> Fill the 'Name surname' field with a valid name and the 'Email' field with a unique email, then click the 'Confirm booking' button.
        # Jane Doe text field
        elem = page.locator('[id="customer_name"]')
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("TS2 TestUser")
        
        # -> Fill the 'Name surname' field with a valid name and the 'Email' field with a unique email, then click the 'Confirm booking' button.
        # jane@example.com email field
        elem = page.locator('[id="customer_email"]')
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("ts2-tc013-20260904-2300@example.com")
        
        # -> Fill the 'Name surname' field with a valid name and the 'Email' field with a unique email, then click the 'Confirm booking' button.
        # Confirm booking button
        elem = page.get_by_role('button', name='Confirm booking', exact=True)
        await elem.click(timeout=10000)
        
        # --> Assertions to verify final state
        
        # --> A booking success message is shown on the confirmation page.
        # Assert-outcome: passed
        # Assert: Confirms the booking success message is visible.
        await expect(page.locator("xpath=/html/body/div[1]/div/div/main/div/div[1]/span").nth(0)).to_have_text("You're booked in", timeout=15000), "Confirms the booking success message is visible."
        
        # --> The confirmed service is shown as "Men's Haircut · 30 min · €20".
        # Assert-outcome: passed
        # Assert: Verifies the service line shows the selected service and duration/price.
        await expect(page.locator("xpath=/html/body/div[1]/div/div/main/div/div[2]/div/div[1]/span").nth(0)).to_have_text("Service Men's Haircut \u00b7 30 min \u00b7 \u20ac20", timeout=15000), "Verifies the service line shows the selected service and duration/price."
        
        # --> The confirmed specialist is shown as "Specialist A".
        # Assert-outcome: passed
        # Assert: Verifies the confirmation lists the chosen specialist.
        await expect(page.locator("xpath=/html/body/div[1]/div/div/main/div/div[2]/div/div[2]/span").nth(0)).to_have_text("Specialist Specialist A", timeout=15000), "Verifies the confirmation lists the chosen specialist."
        
        # --> The confirmed location and appointment time are displayed on the confirmation card.
        # Assert-outcome: passed
        # Assert: Verifies the confirmation shows the selected location.
        await expect(page.locator("xpath=/html/body/div[1]/div/div/main/div/div[2]/div/div[3]/span").nth(0)).to_have_text("Location Preview studio", timeout=15000), "Verifies the confirmation shows the selected location."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    