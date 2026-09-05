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
        
        # -> Open the 'Group Pilates Class' service page by navigating to /appointments/zz-schedule-preview/service/group-pilates-class.
        await page.goto("http://localhost:8000/appointments/zz-schedule-preview/service/group-pilates-class")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
        # -> Click the 'Continue' button to proceed to the date & time selection step.
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
        
        # -> Fill the 'Name surname' field and the 'Email' field, then click the 'Confirm booking' button to complete the booking.
        # Jane Doe text field
        elem = page.locator('[id="customer_name"]')
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("Test User")
        
        # -> Fill the 'Name surname' field and the 'Email' field, then click the 'Confirm booking' button to complete the booking.
        # jane@example.com email field
        elem = page.locator('[id="customer_email"]')
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("ts-gp-20260905-583@example.com")
        
        # -> Fill the 'Name surname' field and the 'Email' field, then click the 'Confirm booking' button to complete the booking.
        # Confirm booking button
        elem = page.get_by_role('button', name='Confirm booking', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'Book another appointment' button to return to the booking flow and re-open the same Group Pilates Class day/time.
        # Book another appointment button
        elem = page.get_by_role('button', name='Book another appointment', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'Continue' button to open the 'Pick a date & time' step and re-open the 2026-09-05 10:00 AM slot to verify availability and remaining-spots.
        # Continue button
        elem = page.get_by_role('button', name='Continue', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the '10:00 AM' time slot to confirm it is selectable and still shows '9 left'.
        # 10:00 AM 9 left button
        elem = page.get_by_role('button', name='10:00 AM 9 left', exact=True)
        await elem.click(timeout=10000)
        
        # --> Assertions to verify final state
        
        # --> The 10:00 AM group class slot is still present and selectable.
        await page.locator("xpath=/html/body/div[1]/div/div/main/div/div/section[2]/div/button[2]").nth(0).scroll_into_view_if_needed()
        # Assert-outcome: passed
        # Assert: The 10:00 AM slot is visible and selectable.
        await expect(page.locator("xpath=/html/body/div[1]/div/div/main/div/div/section[2]/div/button[2]").nth(0)).to_be_visible(timeout=15000), "The 10:00 AM slot is visible and selectable."
        
        # --> The remaining-spots count for 10:00 AM is lower than other visible slots (shows 9 left vs 10 left).
        # Assert-outcome: passed
        # Assert: The 10:00 AM slot label reads '9 left'.
        await expect(page.locator("xpath=/html/body/div[1]/div/div/main/div/div/section[2]/div/button[2]").nth(0)).to_have_text("10:00 AM\n9 left", timeout=15000), "The 10:00 AM slot label reads '9 left'."
        # Assert-outcome: passed
        # Assert: Another visible slot label reads '10 left', showing a higher remaining count.
        await expect(page.locator("xpath=/html/body/div[1]/div/div/main/div/div/section[2]/div/button[1]").nth(0)).to_have_text("09:00 AM\n10 left", timeout=15000), "Another visible slot label reads '10 left', showing a higher remaining count."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    