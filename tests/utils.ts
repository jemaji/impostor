import { Browser, Page, expect } from '@playwright/test';

export async function createHost(browser: Browser, name: string = 'HostPlayer'): Promise<{ page: Page, roomCode: string }> {
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto('/');
    await expect(page.getByText('Crear Sala')).toBeVisible();

    await page.getByPlaceholder('Tu Nombre').fill(name);
    await page.getByRole('button', { name: 'Crear Partida' }).click();

    await expect(page.getByText('SALA', { exact: false })).toBeVisible();

    const roomCodeElement = page.locator('#room-code');
    const roomCodeText = await roomCodeElement.innerText();
    const roomCode = roomCodeText.trim();

    return { page, roomCode };
}

export async function joinPlayer(browser: Browser, roomCode: string, name: string): Promise<Page> {
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto('/');
    // Wait for wake up message to disappear if present
    await expect(page.getByText('Despertando Servidor...')).toBeHidden({ timeout: 10000 });

    await page.getByRole('button', { name: 'Unirse' }).click();

    await page.getByPlaceholder('Tu Nombre').fill(name);
    await page.getByPlaceholder('Código de Sala').fill(roomCode);

    const joinButton = page.getByRole('button', { name: 'Entrar' });
    await expect(joinButton).toBeEnabled();
    await joinButton.click();

    // Wait until joined (lobby visible)
    try {
        await expect(page.getByText('SALA', { exact: false })).toBeVisible({ timeout: 15000 });
    } catch (e) {
        // Check for common error messages if join fails
        const errorMsg = await page.getByRole('alert').textContent().catch(() => null);
        if (errorMsg) {
            throw new Error(`Failed to join room: ${errorMsg}`);
        }
        throw e;
    }


    return page;
}

export async function joinPlayers(browser: Browser, roomCode: string, names: string[]): Promise<Page[]> {
    const pages: Page[] = [];
    for (const name of names) {
        const page = await joinPlayer(browser, roomCode, name);
        pages.push(page);
    }
    return pages;
}
