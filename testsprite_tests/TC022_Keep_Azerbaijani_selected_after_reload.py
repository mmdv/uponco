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
        
        # -> Open the header menu (click the header control/gear area) to reveal language options.
        # Share and appearance button
        elem = page.get_by_role('button', name='Share and appearance', exact=True)
        await elem.click(timeout=10000)
        
        # -> Open the 'Language' dropdown in the header menu (the control currently showing 'English').
        # English button
        elem = page.locator('xpath=/html/body/div[2]/div/div[2]/button')
        await elem.click(timeout=10000)
        
        # -> Select 'Azərbaycan' from the Language dropdown to change the page language to Azerbaijani.
        # Azərbaycan option
        elem = page.get_by_role('option', name='Azərbaycan', exact=True)
        await elem.click(timeout=10000)
        
        # -> Reload the booking page (the "Görüş təyin edin · ZZ Schedule" page) to verify the Azerbaijani language choice persists after a refresh.
        await page.goto("http://localhost:8000/appointments/zz-schedule-preview")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
        # -> Open the header menu (gear/share control) to access the language selector and switch the site back to English.
        # Paylaş və görünüş button
        elem = page.get_by_role('button', name='Paylaş və görünüş', exact=True)
        await elem.click(timeout=10000)
        
        # -> Open the 'Dil' (Language) dropdown in the header menu so the 'English' option can be selected.
        # Azərbaycan button
        elem = page.locator('xpath=/html/body/div[2]/div/div[2]/button')
        await elem.click(timeout=10000)
        
        # -> Click the 'English' option in the language dropdown to switch the booking page back to English and verify the UI updates.
        # English option
        elem = page.get_by_role('option', name='English', exact=True)
        await elem.click(timeout=10000)
        
        # --> Assertions to verify final state
        
        # --> Azerbaijani language persisted and the booking wizard showed Azerbaijani copy after the page was reloaded.
        # Assert-outcome: passed
        # Assert: Booking wizard header contains the Azerbaijani phrase 'Görüş təyin edin'.
        await expect(page.locator("xpath=/html/body/div[1]").nth(0)).to_contain_text("G\u00f6r\u00fc\u015f t\u0259yin edin", timeout=15000), "Booking wizard header contains the Azerbaijani phrase 'G\u00f6r\u00fc\u015f t\u0259yin edin'."
        
        # --> The booking page (wizard with Service and Specialist cards) remained displayed throughout the test.
        # Assert-outcome: passed
        # Assert: The Service card (booking wizard) is visible with the 'Choose a treatment' label.
        await expect(page.locator("xpath=/html/body/div[1]/div/div/main/div/div/div[1]/button").nth(0)).to_contain_text("Choose a treatment", timeout=15000), "The Service card (booking wizard) is visible with the 'Choose a treatment' label."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    