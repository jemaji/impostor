import { useEffect } from 'react';

declare global {
    interface Window {
        dataLayer: any[];
        gtag: (...args: any[]) => void;
    }
}

export const GoogleAnalytics = () => {
    const gaId = import.meta.env.VITE_GA_ID;

    useEffect(() => {
        if (!gaId) {
            console.warn('⚠️ No GA ID found');
            return;
        }

        // Check if script already exists to avoid duplicates
        if (document.querySelector(`script[src*="googletagmanager.com/gtag/js"]`)) return;

        // Load GA Script
        const script = document.createElement('script');
        script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
        script.async = true;
        document.head.appendChild(script);

        // Initialize GA
        window.dataLayer = window.dataLayer || [];
        function gtag() {
            // eslint-disable-next-line
            // @ts-ignore
            window.dataLayer.push(arguments);
            // eslint-disable-next-line
            // @ts-ignore
            console.log('📊 [GA Event]', arguments);
        }
        // @ts-ignore
        window.gtag = gtag;

        console.log('📊 [GA Init] Loading script for:', gaId);
        // @ts-ignore
        gtag('js', new Date());
        // @ts-ignore
        gtag('config', gaId, { 'debug_mode': true }); // Force Debug Mode for instant tracking

    }, [gaId]);

    return null;
};
