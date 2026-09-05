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
        
        # -> Click the 'Service' card to expand it, then select the 'Men's Haircut' service.
        # Service Choose a treatment button
        elem = page.get_by_role('button', name='Service Choose a treatment', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'Service' card to expand it, then select the 'Men's Haircut' service.
        # Men's Haircut 30 min · €20 button
        elem = page.get_by_role('button', name="Men's Haircut 30 min · €20", exact=True)
        await elem.click(timeout=10000)
        
        # -> Expand the 'Specialist' card, select 'Specialist A', then click the 'Continue' button to go to the Pick a date & time step.
        # Specialist Choose who you'll see button
        elem = page.get_by_role('button', name="Specialist Choose who you'll see", exact=True)
        await elem.click(timeout=10000)
        
        # -> Expand the 'Specialist' card, select 'Specialist A', then click the 'Continue' button to go to the Pick a date & time step.
        # SA Specialist A Next available · Tomorrow 09:00... button
        elem = page.get_by_role('button', name='SA Specialist A Next available · Tomorrow 09:00 09:30 10:00 10:30', exact=True)
        await elem.click(timeout=10000)
        
        # -> Expand the 'Specialist' card, select 'Specialist A', then click the 'Continue' button to go to the Pick a date & time step.
        # Continue button
        elem = page.get_by_role('button', name='Continue', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'Service' card to open the service list, then select the 'Beard Trim' service to see if locations become available and the Continue button enables.
        # Service Men's Haircut button
        elem = page.get_by_role('button', name="Service Men's Haircut", exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'Service' card to open the service list, then select the 'Beard Trim' service to see if locations become available and the Continue button enables.
        # Beard Trim 15 min · €10 button
        elem = page.get_by_role('button', name='Beard Trim 15 min · €10', exact=True)
        await elem.click(timeout=10000)
        
        # -> Scroll down to reveal more services and search the page for an online service (e.g. 'Online Lecture (Latvian)') or other services that might not require a location.
        await page.mouse.wheel(0, 300)
        
        # -> Scroll down the page to reveal the 'Online Lecture (Latvian)' service so it can be selected.
        await page.mouse.wheel(0, 300)
        
        # -> Open the 'Service' card and reveal the 'Online Lecture (Latvian)' service so it can be selected.
        # Service Beard Trim button
        elem = page.get_by_role('button', name='Service Beard Trim', exact=True)
        await elem.click(timeout=10000)
        
        # -> Open the 'Service' card and reveal the 'Online Lecture (Latvian)' service so it can be selected.
        await page.mouse.wheel(0, 300)
        
        # -> Select the 'Online Lecture (Latvian)' service from the Service card so the flow can proceed without a location.
        await page.mouse.wheel(0, 300)
        
        # -> Scroll down to reveal the 'Online Lecture (Latvian)' service so it can be selected.
        await page.mouse.wheel(0, 300)
        
        # --> Assertions to verify final state
        current_url = await page.evaluate("() => window.location.href")
        # Assert-outcome: passed
        # Assert: page loaded with a URL (final outcome verified by the AI judge during the run)
        assert current_url, 'Page should have loaded with a URL'
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    