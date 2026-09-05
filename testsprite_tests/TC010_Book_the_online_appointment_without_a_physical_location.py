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
        
        # -> Click the "Online Lecture (Latvian)" service button to select the online Latvian lecture.
        # Online Lecture (Latvian) 1h · €25 Online lecture... button
        elem = page.get_by_role('button', name='Online Lecture (Latvian) 1h · €25 Online lecture delivered in Latvian by Specialist D.', exact=True)
        await elem.click(timeout=10000)
        
        # -> Open the "Online Lecture (Latvian)" service page (navigate to /appointments/zz-schedule-preview/service/online-lecture-latvian).
        await page.goto("http://localhost:8000/appointments/zz-schedule-preview/service/online-lecture-latvian")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
        # -> Click the 'Continue' button to move to the date & time step after confirming no physical location is requested and only Specialist D is listed.
        # Continue button
        elem = page.get_by_role('button', name='Continue', exact=True)
        await elem.click(timeout=10000)
        
        # -> Select booking day '12 Sep' (Sat 12 Sep) and choose the 10:00 AM time slot, then click the 'Continue' button to reach the customer details step.
        # Sat 12 Sep button
        elem = page.get_by_role('button', name='Sat 12 Sep', exact=True)
        await elem.click(timeout=10000)
        
        # -> Select booking day '12 Sep' (Sat 12 Sep) and choose the 10:00 AM time slot, then click the 'Continue' button to reach the customer details step.
        # 10:00 AM button
        elem = page.get_by_role('button', name='10:00 AM', exact=True)
        await elem.click(timeout=10000)
        
        # -> Select booking day '12 Sep' (Sat 12 Sep) and choose the 10:00 AM time slot, then click the 'Continue' button to reach the customer details step.
        # Continue button
        elem = page.get_by_role('button', name='Continue', exact=True)
        await elem.click(timeout=10000)
        
        # -> Verify no physical location is requested and that only 'Specialist D' is present, then select the '10:00 AM' time slot and click the 'Continue' button to move to the customer details step.
        # 10:00 AM button
        elem = page.get_by_role('button', name='10:00 AM', exact=True)
        await elem.click(timeout=10000)
        
        # -> Verify no physical location is requested and that only 'Specialist D' is present, then select the '10:00 AM' time slot and click the 'Continue' button to move to the customer details step.
        # Continue button
        elem = page.get_by_role('button', name='Continue', exact=True)
        await elem.click(timeout=10000)
        
        # -> Fill the 'Name surname' field with a test name and the 'Email' field with a unique test email, then click the 'Confirm booking' button.
        # Jane Doe text field
        elem = page.locator('[id="customer_name"]')
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("Test User")
        
        # -> Fill the 'Name surname' field with a test name and the 'Email' field with a unique test email, then click the 'Confirm booking' button.
        # jane@example.com email field
        elem = page.locator('[id="customer_email"]')
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("ts3-tc013-0001@example.com")
        
        # -> Fill the 'Name surname' field with a test name and the 'Email' field with a unique test email, then click the 'Confirm booking' button.
        # Confirm booking button
        elem = page.get_by_role('button', name='Confirm booking', exact=True)
        await elem.click(timeout=10000)
        
        # -> Select the '09:00 AM' time slot and click the 'Continue' button to go to the customer details form.
        # 09:00 AM button
        elem = page.get_by_role('button', name='09:00 AM', exact=True)
        await elem.click(timeout=10000)
        
        # -> Select the '09:00 AM' time slot and click the 'Continue' button to go to the customer details form.
        # Continue button
        elem = page.get_by_role('button', name='Continue', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'Confirm booking' button to submit the booking and then verify the confirmation message (expected: "You're booked in").
        # Confirm booking button
        elem = page.get_by_role('button', name='Confirm booking', exact=True)
        await elem.click(timeout=10000)
        
        # --> Assertions to verify final state
        
        # --> The booking summary shows the service, specialist and chosen time and does not show any Location row.
        # Assert-outcome: passed
        # Assert: The booking summary displays Service, Specialist and When, with no Location shown.
        await expect(page.locator("xpath=/html/body/div[1]/div/div/main/div/div[2]/div/div[1]/span").nth(0)).to_contain_text("Service Online Lecture (Latvian) \u00b7 1h \u00b7 \u20ac25 Specialist Specialist D When Sat, Sep 12, 2026 \u00b7 09:00 AM \u2013 10:00 AM", timeout=15000), "The booking summary displays Service, Specialist and When, with no Location shown."
        
        # --> A booking confirmation heading 'You're booked in' is visible.
        # Assert-outcome: passed
        # Assert: The confirmation heading 'You're booked in' is visible.
        await expect(page.locator("xpath=/html/body/div[1]/div/div/main/div/div[1]/span").nth(0)).to_contain_text("You're booked in", timeout=15000), "The confirmation heading 'You're booked in' is visible."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    