import { test, expect } from '@playwright/test';
import { createRoom } from './utils';

test.describe('Masked Input Feature', () => {
    test('should mask player inputs when round timer is enabled', async ({ browser }) => {
        // 1. Setup: Create room with 3 players
        const { host, players } = await createRoom(browser, 3);

        // 2. Enable Round Timer
        await host.getByLabel('Tiempo Global (Ronda)').check();

        // 3. Start Game
        await host.getByRole('button', { name: 'Iniciar Partida' }).click();

        // Wait for game to start
        await expect(host.getByText('RONDA', { exact: true })).toBeVisible();

        // 4. Submit word as Player 1
        const player1Page = players[0];
        const player1Input = player1Page.locator('input[placeholder="Escribe tu término..."]');
        await player1Input.fill('SecretWord1');
        await player1Page.keyboard.press('Enter');

        // 5. Verify masking
        // Player 1 should see masked input in the feed
        // The feed is the list below the input area.
        // We look for the container that has the player name and the content.

        // Check for '🙈 *****'
        await expect(player1Page.getByText('🙈 *****')).toBeVisible();

        // Ensure "SecretWord1" is NOT visible in the feed area (it might be in input before submit, but not after)
        // Note: The input is cleared after submit.
        await expect(player1Page.getByText('SecretWord1')).not.toBeVisible();

        // 6. Verify Player 2 sees masked input for Player 1
        const player2Page = players[1];
        await expect(player2Page.getByText('🙈 *****')).toBeVisible();
        await expect(player2Page.getByText('SecretWord1')).not.toBeVisible();

        // 7. Player 2 submits
        const player2Input = player2Page.locator('input[placeholder="Escribe tu término..."]');
        await player2Input.fill('SecretWord2');
        await player2Page.keyboard.press('Enter');

        // Verify both are masked
        await expect(player1Page.getByText('🙈 *****')).toHaveCount(2);
        await expect(player2Page.getByText('🙈 *****')).toHaveCount(2);

    });

    test('should NOT mask player inputs when round timer is DISABLED', async ({ browser }) => {
        // 1. Setup: Create room with 3 players
        const { host, players } = await createRoom(browser, 3);

        // 2. ENSURE Round Timer is DISABLED (default might be off, but let's be sure or check default)
        // Assuming default is off based on previous context, or we explicitly uncheck if needed.
        await host.getByLabel('Tiempo Global (Ronda)').uncheck();

        // 3. Start Game
        await host.getByRole('button', { name: 'Iniciar Partida' }).click();

        // Wait for game to start
        await expect(host.getByRole('button', { name: '👆 Pulsa ver PALABRA' })).toBeVisible();

        // 4. Submit word as Player 1
        const player1Page = players[0];
        await player1Page.locator('input[placeholder="Escribe tu término..."]').fill('VisibleWord1');
        await player1Page.keyboard.press('Enter');

        // 5. Verify NO masking
        await expect(player1Page.getByText('VisibleWord1')).toBeVisible();
        await expect(player1Page.getByText('🙈 *****')).not.toBeVisible();
    });
});
