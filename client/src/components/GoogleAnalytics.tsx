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
        if (!gaId) return;

        // Check if script already exists to avoid duplicates
        if (document.querySelector(`script[src*="googletagmanager.com/gtag/js"]`)) return;

        // Load GA Script
        const script = document.createElement('script');
        script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
        script.async = true;
        document.head.appendChild(script);

        // Initialize GA
        window.dataLayer = window.dataLayer || [];
        function gtag(...args: any[]) {
            // eslint-disable-next-line
            // @ts-ignore
            window.dataLayer.push(args);
        }
        window.gtag = gtag;
        gtag('js', new Date());
        gtag('config', gaId);

    }, [gaId]);

    return null;
};
