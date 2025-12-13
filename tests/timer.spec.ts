import { test, expect } from '@playwright/test';
import { createHost, joinPlayers } from './utils';

test.describe('Timer Scenarios', () => {
    test.setTimeout(10000);

    test('Scenario: 4 Players with Common Timer', async ({ browser }) => {
        // 1. Host creates room
        console.log('Creating host...');
        const { page: hostPage, roomCode } = await createHost(browser, 'HostPlayer');
        console.log('Host created room:', roomCode);

        // 2. 3 Players join
        console.log('Joining players...');
        const [player2Page, player3Page, player4Page] = await joinPlayers(browser, roomCode, ['Player2', 'Player3', 'Player4']);
        console.log('Players joined.');

        // Verify players joined
        await expect(hostPage.getByText('Player2')).toBeVisible({ timeout: 10000 });
        await expect(hostPage.getByText('Player3')).toBeVisible({ timeout: 10000 });
        await expect(hostPage.getByText('Player4')).toBeVisible({ timeout: 10000 });
        console.log('All players visible.');

        // 3. Host enables Round Timer
        // Locate the checkbox via the label text (including emoji)
        console.log('Enabling timer...');
        await hostPage.getByText('⏳ Tiempo Global (Ronda)').click();

        // Optional: Change time to 30s. 
        // We ensure the input is visible.
        const roundTimeInput = hostPage.getByLabel('⏳ Tiempo Global (Ronda)').locator('..').locator('input[type="number"]');
        // Or simply find the input that appeared.
        // Since we just clicked the round timer, let's look for the input in that section.
        // Using a more generic approach but safer:
        // The input has a default value of 60.
        const input = hostPage.locator('input[type="number"][value="60"]');
        await expect(input).toBeVisible();
        await input.fill('30');
        console.log('Timer enabled and set to 30s.');

        // 4. Start Game
        console.log('Starting game...');
        await hostPage.getByRole('button', { name: 'Comenzar Partida' }).click();

        // 5. Verify Game Started and Timer Visible
        await expect(hostPage.getByText('👆 Pulsa ver ROL')).toBeVisible({ timeout: 10000 });
        console.log('Game started.');

        // Verify "RONDA" timer label or element is visible
        // The text "RONDA" is inside the span in GameCanvas.
        // It might be small font: "RONDA"
        console.log('Verifying timer visibility...');
        await expect(hostPage.getByRole('heading', { name: 'RONDA' })).toBeVisible();
        await expect(player2Page.getByRole('heading', { name: 'RONDA' })).toBeVisible();
        console.log('Timer label visible.');

        // Verify the timer value (should be around 30)
        // We look for the circle timer text which is absolute positioned.
        // It is a span with the number.
        // Because of the delay, it might be 29 or 30.
        await expect(hostPage.locator('.animate-pulse-slow span')).toHaveText(/^(30|29|28)$/);
        console.log('Timer value verified.');
    });
});
