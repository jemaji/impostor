import { test, expect } from '@playwright/test';
import { createRoom } from './utils';

test.describe('Reconnection', () => {
    test('Host should rejoin room after reload', async ({ browser }) => {
        // 2. Create Room using helper
        const { room, host } = await createRoom(browser, { hostName: 'Host' });
        const page = host.page;
        const code = room.code;

        // 3. Wait for Lobby (Already handled by createRoom but good to double check or just proceed)
        await expect(page.locator('text=SALA')).toBeVisible();

        // 4. Reload Page
        await page.reload();

        // 5. Verify we are back in the lobby
        await expect(page.locator('text=SALA')).toBeVisible({ timeout: 10000 });
        await expect(page.locator('#room-code')).toHaveText(code);
        await expect(page.getByText('Host 👑')).toBeVisible();
    });
});
