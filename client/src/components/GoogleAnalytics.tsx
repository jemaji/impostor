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
        function gtag(...args: any[]) {
            console.log('📊 [GA Event]', args); // Visual confirmation for User
            window.dataLayer.push(args);
        }
        window.gtag = gtag;

        console.log('📊 [GA Init] Loading script for:', gaId);
        gtag('js', new Date());
        gtag('config', gaId);

    }, [gaId]);

    return null;
};
