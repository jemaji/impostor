import { test, expect } from '@playwright/test';
import { createHost, joinPlayers } from './utils';

test.describe('Game Scenarios', () => {
    test.setTimeout(10000);

    test('Scenario: 4 Players Happy Path', async ({ browser }) => {
        // 1. Host creates room
        const { page: hostPage, roomCode } = await createHost(browser, 'HostPlayer');

        // 2. 3 Players join
        const [player2Page, player3Page, player4Page] = await joinPlayers(browser, roomCode, ['Player2', 'Player3', 'Player4']);


        // Verify all players visible to host
        await expect(hostPage.getByText('Player2')).toBeVisible({ timeout: 10000 });
        await expect(hostPage.getByText('Player3')).toBeVisible({ timeout: 10000 });
        await expect(hostPage.getByText('Player4')).toBeVisible({ timeout: 10000 });

        // 3. Start Game
        await hostPage.getByRole('button', { name: 'Comenzar Partida' }).click();

        // Verify game started
        await expect(hostPage.getByText('👆 Pulsa ver ROL')).toBeVisible({ timeout: 10000 });
        await expect(player2Page.getByPlaceholder('Escribe tu término...')).toBeVisible({ timeout: 10000 });
        await expect(player3Page.getByPlaceholder('Escribe tu término...')).toBeVisible({ timeout: 10000 });
        await expect(player4Page.getByPlaceholder('Escribe tu término...')).toBeVisible({ timeout: 10000 });
    });

    test('Scenario: 7 Players Happy Path', async ({ browser }) => {
        // 1. Host creates room
        const { page: hostPage, roomCode } = await createHost(browser, 'HostPlayer');

        // 2. 6 Players join
        const [player2Page, player3Page, player4Page, player5Page, player6Page, player7Page] = await joinPlayers(browser, roomCode, ['Player2', 'Player3', 'Player4', 'Player5', 'Player6', 'Player7']);


        // Verify all players visible to host
        await expect(hostPage.getByText('Player2')).toBeVisible({ timeout: 30000 });
        await expect(hostPage.getByText('Player3')).toBeVisible({ timeout: 30000 });
        await expect(hostPage.getByText('Player4')).toBeVisible({ timeout: 30000 });
        await expect(hostPage.getByText('Player5')).toBeVisible({ timeout: 30000 });
        await expect(hostPage.getByText('Player6')).toBeVisible({ timeout: 30000 });
        await expect(hostPage.getByText('Player7')).toBeVisible({ timeout: 30000 });

        // 3. Start Game
        await hostPage.getByRole('button', { name: 'Comenzar Partida' }).click();

        // Verify game started
        await expect(hostPage.getByText('👆 Pulsa ver ROL')).toBeVisible({ timeout: 30000 });
        await expect(player2Page.getByPlaceholder('Escribe tu término...')).toBeVisible({ timeout: 30000 });
        await expect(player3Page.getByPlaceholder('Escribe tu término...')).toBeVisible({ timeout: 30000 });
        await expect(player4Page.getByPlaceholder('Escribe tu término...')).toBeVisible({ timeout: 30000 });
        await expect(player5Page.getByPlaceholder('Escribe tu término...')).toBeVisible({ timeout: 30000 });
        await expect(player6Page.getByPlaceholder('Escribe tu término...')).toBeVisible({ timeout: 30000 });
        await expect(player7Page.getByPlaceholder('Escribe tu término...')).toBeVisible({ timeout: 30000 });
    });
});
