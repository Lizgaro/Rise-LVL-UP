from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1440, "height": 900})

        try:
            # Navigate to the app
            page.goto("http://localhost:4173")

            # Wait for main element to load
            page.wait_for_selector("text=Rise LVL UP")

            # Wait a bit for animations/fonts
            page.wait_for_timeout(1000)

            # Take screenshot
            page.screenshot(path="verification/ui_screenshot.png", full_page=True)
            print("Screenshot saved to verification/ui_screenshot.png")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error_screenshot.png")
        finally:
            browser.close()

if __name__ == "__main__":
    run()
