import { test, expect } from '@playwright/test';
import { createRoom } from './utils';

test('Round history should be visible in subsequent rounds', async ({ browser }) => {
    // 1. Create Room and Players
    const { room, host, players } = await createRoom(browser, 3);

    // 2. Start Game
    await host.click('button:has-text("Empezar Partida")');
    await expect(host.locator('text=Ronda Actual (1)')).toBeVisible();

    // 3. Round 1: Submit Words
    const round1Words = ['Apple', 'Banana', 'Cherry'];

    // Players submit
    for (let i = 0; i < players.length; i++) {
        await players[i].fill('input[placeholder="Escribe tu término..."]', round1Words[i]);
        await players[i].click('button:has-text("Enviar")');
    }

    // 4. Verify Masking during Round 1 (Optional but good)
    // Note: Host is also a player in this setup usually, check one perspective that hasn't submitted or has submitted
    // The UI shows "Esperando..." after submit, or "******" if looking at feed. 
    // Let's just proceed to voting.

    // 5. Wait for Voting Phase
    await expect(host.locator('text=Vota al Impostor')).toBeVisible();

    // 6. Verify Round 1 Revealed in Feed (Voting Phase)
    // In Voting Phase, history is below.
    await expect(host.locator('text=Rondas Anteriores')).toBeVisible();
    // Round 1 is technically "Current" in voting, but let's see how it's rendered. 
    // Actually, in `VotingPhase.tsx`, the list is: `sortedRounds.filter(r => r < gameState.round)`
    // So Round 1 (current round) is NOT in "Rondas Anteriores" during Voting Phase 1?
    // Correct, it's only in the main voting list.

    // 7. Vote to end Round 1
    // Everyone votes for Player 2 (Banana) to kick/skip
    const player2Id = await players[1].evaluate(() => window.socket.id);
    for (const p of players) {
        // Vote Skip to be safe/faster
        await p.click('button:has-text("Saltar Votación")');
    }

    // 8. Round 2 Starts
    await expect(host.locator('text=Ronda 2')).toBeVisible();

    // 9. CHECK HISTORY: Round 1 should be visible in "Rondas Anteriores"
    await expect(host.locator('text=Rondas Anteriores')).toBeVisible();

    // Verify Round 1 toggle is present
    const round1Btn = host.locator('button', { hasText: 'Ronda 1' });
    await expect(round1Btn).toBeVisible();

    // Expand if needed (it might be collapsed)
    if (await round1Btn.innerText().then(t => t.includes('▼'))) {
        await round1Btn.click();
    }

    // Verify Round 1 words are visible and UNMASKED
    for (const word of round1Words) {
        await expect(host.locator(`text=${word}`)).toBeVisible();
    }

    // 10. Round 2: Submit Words
    const round2Words = ['Dog', 'Cat', 'Bird'];
    for (let i = 0; i < players.length; i++) {
        await players[i].fill('input[placeholder="Escribe tu término..."]', round2Words[i]);
        await players[i].click('button:has-text("Enviar")');
    }

    // 11. Verify Round 2 is Masked (in Feed) while Round 1 is visible
    // The feed shows current round masked
    await expect(host.locator('text=🙈 *****')).toBeVisible(); // At least one masked input

    // But Round 1 should STILL be visible
    await expect(host.locator('text=Apple')).toBeVisible();
});
