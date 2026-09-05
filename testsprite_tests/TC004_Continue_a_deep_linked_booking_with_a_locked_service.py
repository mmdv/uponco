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
        
        # -> Open the 'Men's Haircut' deep link so the service is preselected and locked (navigate to the Men's Haircut deep link).
        await page.goto("http://localhost:8000/appointments/zz-schedule-preview/service/mens-haircut")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
        # -> Click the 'Continue' button at the bottom of the wizard to open the "Pick a date & time" step.
        # Continue button
        elem = page.get_by_role('button', name='Continue', exact=True)
        await elem.click(timeout=10000)
        
        # -> Select the day '5 September', choose the 10:00 AM time slot, and click the 'Continue' button to open the customer details form.
        # Tmrw 5 Sep button
        elem = page.get_by_role('button', name='Tmrw 5 Sep', exact=True)
        await elem.click(timeout=10000)
        
        # -> Select the day '5 September', choose the 10:00 AM time slot, and click the 'Continue' button to open the customer details form.
        # 10:00 AM button
        elem = page.get_by_role('button', name='10:00 AM', exact=True)
        await elem.click(timeout=10000)
        
        # -> Select the day '5 September', choose the 10:00 AM time slot, and click the 'Continue' button to open the customer details form.
        # Continue button
        elem = page.get_by_role('button', name='Continue', exact=True)
        await elem.click(timeout=10000)
        
        # -> Fill the 'Name surname' field, fill the 'Email' field with a unique test email, then click the 'Confirm booking' button.
        # Jane Doe text field
        elem = page.locator('[id="customer_name"]')
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("TS Test")
        
        # -> Fill the 'Name surname' field, fill the 'Email' field with a unique test email, then click the 'Confirm booking' button.
        # jane@example.com email field
        elem = page.locator('[id="customer_email"]')
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("ts-mens-090426-827@example.com")
        
        # -> Fill the 'Name surname' field, fill the 'Email' field with a unique test email, then click the 'Confirm booking' button.
        # Confirm booking button
        elem = page.get_by_role('button', name='Confirm booking', exact=True)
        await elem.click(timeout=10000)
        
        # -> Select the available time '09:00 AM' and click the 'Continue' button to open the customer details form.
        # 09:00 AM button
        elem = page.get_by_role('button', name='09:00 AM', exact=True)
        await elem.click(timeout=10000)
        
        # -> Select the available time '09:00 AM' and click the 'Continue' button to open the customer details form.
        # Continue button
        elem = page.get_by_role('button', name='Continue', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'Confirm booking' button to submit the booking and verify the success screen shows "You're booked in" and that the booking came from the preselected Men's Haircut.
        # Confirm booking button
        elem = page.get_by_role('button', name='Confirm booking', exact=True)
        await elem.click(timeout=10000)
        
        # --> Assertions to verify final state
        
        # --> Confirmation page shows the booking success header "You're booked in".
        # Assert-outcome: passed
        # Assert: Booking success header 'You're booked in' is shown.
        await expect(page.locator("xpath=/html/body/div[1]/div/div/main/div/div[1]/span").nth(0)).to_have_text("You're booked in", timeout=15000), "Booking success header 'You're booked in' is shown."
        
        # --> Confirmation shows the booked service as "Service Men's Haircut · 30 min · €20", matching the deep-linked service.
        # Assert-outcome: passed
        # Assert: Confirmation lists the booked service, duration, and price.
        await expect(page.locator("xpath=/html/body/div[1]/div/div/main/div/div[2]/div/div[1]/span").nth(0)).to_have_text("Service Men's Haircut \u00b7 30 min \u00b7 \u20ac20", timeout=15000), "Confirmation lists the booked service, duration, and price."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    