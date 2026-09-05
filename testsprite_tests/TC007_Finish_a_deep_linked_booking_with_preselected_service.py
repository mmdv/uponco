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
        
        # -> Open the deep link for the Men's Haircut service by navigating to /appointments/zz-schedule-preview/service/mens-haircut.
        await page.goto("http://localhost:8000/appointments/zz-schedule-preview/service/mens-haircut")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
        # -> Open the 'ZZ Schedule Preview' public booking page (the /appointments/zz-schedule-preview landing page) and verify it loads without the 429 error.
        await page.goto("http://localhost:8000/appointments/zz-schedule-preview")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
        # -> Navigate to the deep link URL for the "Men's Haircut" service and verify the preselected service is shown as locked.
        await page.goto("http://localhost:8000/appointments/zz-schedule-preview/service/mens-haircut")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
        # -> Click the 'Specialist' card header to expand the Specialist list so the available specialists (should be Specialist A and Specialist B only) can be verified.
        # Specialist Choose who you'll see button
        elem = page.get_by_role('button', name="Specialist Choose who you'll see", exact=True)
        await elem.click(timeout=10000)
        
        # -> Select 'Specialist A' from the Specialist list so the Continue button becomes enabled.
        # SA Specialist A Next available · Today 09:00... button
        elem = page.get_by_role('button', name='SA Specialist A Next available · Today 09:00 09:30 10:00 10:30', exact=True)
        await elem.click(timeout=10000)
        
        # -> Select 'Specialist A' from the Specialist list so the Continue button becomes enabled.
        # Continue button
        elem = page.get_by_role('button', name='Continue', exact=True)
        await elem.click(timeout=10000)
        
        # -> Select the day chip labeled 'Sat 12 Sep' and then pick the '10:00 AM' time slot, then click the 'Continue' button to go to the customer details form.
        # Sat 12 Sep button
        elem = page.get_by_role('button', name='Sat 12 Sep', exact=True)
        await elem.click(timeout=10000)
        
        # -> Select the day chip labeled 'Sat 12 Sep' and then pick the '10:00 AM' time slot, then click the 'Continue' button to go to the customer details form.
        # 10:00 AM button
        elem = page.get_by_role('button', name='10:00 AM', exact=True)
        await elem.click(timeout=10000)
        
        # -> Select the day chip labeled 'Sat 12 Sep' and then pick the '10:00 AM' time slot, then click the 'Continue' button to go to the customer details form.
        # Continue button
        elem = page.get_by_role('button', name='Continue', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the '10:00 AM' time slot to select a time and then click the 'Continue' button to proceed to the customer details form.
        # 10:00 AM button
        elem = page.get_by_role('button', name='10:00 AM', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the '10:00 AM' time slot to select a time and then click the 'Continue' button to proceed to the customer details form.
        # Continue button
        elem = page.get_by_role('button', name='Continue', exact=True)
        await elem.click(timeout=10000)
        
        # -> Fill the Name field with a valid name and the Email field with a unique email, then click the 'Confirm booking' button.
        # Jane Doe text field
        elem = page.locator('[id="customer_name"]')
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("Test User")
        
        # -> Fill the Name field with a valid name and the Email field with a unique email, then click the 'Confirm booking' button.
        # jane@example.com email field
        elem = page.locator('[id="customer_email"]')
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("ts3-TC013-12345@example.com")
        
        # -> Fill the Name field with a valid name and the Email field with a unique email, then click the 'Confirm booking' button.
        # Confirm booking button
        elem = page.get_by_role('button', name='Confirm booking', exact=True)
        await elem.click(timeout=10000)
        
        # --> Assertions to verify final state
        
        # --> The booking confirmation heading "You're booked in" is visible.
        # Assert-outcome: passed
        # Assert: The confirmation heading 'You're booked in' is shown.
        await expect(page.locator("xpath=/html/body/div[1]/div/div/main/div/div[1]/span").nth(0)).to_contain_text("You're booked in", timeout=15000), "The confirmation heading 'You're booked in' is shown."
        
        # --> The final booking summary shows the service remained set to "Men's Haircut".
        # Assert-outcome: passed
        # Assert: The booking summary displays the service 'Men's Haircut'.
        await expect(page.locator("xpath=/html/body/div[1]/div/div/main/div/div[2]/div/div[1]/span").nth(0)).to_contain_text("Men's Haircut", timeout=15000), "The booking summary displays the service 'Men's Haircut'."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    