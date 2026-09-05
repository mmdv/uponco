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
        
        # -> Reload the 'ZZ Schedule Preview' booking page and wait for the booking UI to appear so the booking flow can be tested.
        await page.goto("http://localhost:8000/appointments/zz-schedule-preview")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
        # -> Click the 'Service' card header to expand the Service selection panel so a service can be chosen.
        # Service Choose a treatment button
        elem = page.get_by_role('button', name='Service Choose a treatment', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'Men's Haircut' service option.
        # Men's Haircut 30 min · €20 button
        elem = page.get_by_role('button', name="Men's Haircut 30 min · €20", exact=True)
        await elem.click(timeout=10000)
        
        # -> Select the 'Specialist A' option by clicking the Specialist A list item to choose the specialist.
        # SA Specialist A Next available · Tomorrow 09:00... button
        elem = page.get_by_role('button', name='SA Specialist A Next available · Tomorrow 09:00 09:30 10:00 10:30', exact=True)
        await elem.click(timeout=10000)
        
        # -> Expand the 'Specialist' card and select 'Specialist A' so the 'Continue' button becomes enabled.
        # Specialist Choose who you'll see button
        elem = page.get_by_role('button', name="Specialist Choose who you'll see", exact=True)
        await elem.click(timeout=10000)
        
        # -> Expand the 'Specialist' card and select 'Specialist A' so the 'Continue' button becomes enabled.
        # SA Specialist A Next available · Tomorrow 09:00... button
        elem = page.get_by_role('button', name='SA Specialist A Next available · Tomorrow 09:00 09:30 10:00 10:30', exact=True)
        await elem.click(timeout=10000)
        
        # -> Reveal more service options and find the 'Online Lecture (Latvian)' service on the page
        await page.mouse.wheel(0, 300)
        
        # -> Expand the 'Service' card and locate the 'Online Lecture (Latvian)' service so it can be selected.
        # Service Men's Haircut button
        elem = page.get_by_role('button', name="Service Men's Haircut", exact=True)
        await elem.click(timeout=10000)
        
        # -> Scroll the service list to reveal and locate the 'Online Lecture (Latvian)' service button so it can be selected.
        await page.mouse.wheel(0, 300)
        
        # -> Reveal and locate the 'Online Lecture (Latvian)' service in the Service list so it can be selected.
        await page.mouse.wheel(0, 300)
        
        # -> Reveal the Service list and locate the 'Online Lecture (Latvian)' service so it can be selected.
        await page.mouse.wheel(0, 300)
        
        # -> Reveal the 'Online Lecture (Latvian)' service in the Service list by scrolling so it can be clicked.
        await page.mouse.wheel(0, 300)
        
        # -> Reveal the 'Online Lecture (Latvian)' service in the Service list by scrolling the page so the service button becomes visible.
        await page.mouse.wheel(0, 300)
        
        # -> Open the deep link for the 'Online Lecture (Latvian)' service so the online service is selected and Continue can enable.
        await page.goto("http://localhost:8000/appointments/zz-schedule-preview/service/online-lecture-latvian")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
        # --> Assertions to verify final state
        
        # --> The page shows a visible Continue button in the footer so the booking can proceed to customer details.
        await page.locator("xpath=/html/body/div/div/div/footer/button").nth(0).scroll_into_view_if_needed()
        # Assert-outcome: passed
        # Assert: The Continue button is visible in the footer.
        await expect(page.locator("xpath=/html/body/div/div/div/footer/button").nth(0)).to_be_visible(timeout=15000), "The Continue button is visible in the footer."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    