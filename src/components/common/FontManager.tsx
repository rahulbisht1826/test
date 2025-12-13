import { useEffect } from 'react';
import { usePOS } from '@/context/POSContext';

export const AVAILABLE_FONTS = [
    { name: 'Inter', url: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap', family: "'Inter', sans-serif" },
    { name: 'Roboto', url: 'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap', family: "'Roboto', sans-serif" },
    { name: 'Open Sans', url: 'https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;600;700&display=swap', family: "'Open Sans', sans-serif" },
    { name: 'Lato', url: 'https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700&display=swap', family: "'Lato', sans-serif" },
    { name: 'Poppins', url: 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap', family: "'Poppins', sans-serif" },
    { name: 'Montserrat', url: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap', family: "'Montserrat', sans-serif" },
    { name: 'Playfair Display', url: 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&display=swap', family: "'Playfair Display', serif" },
    { name: 'Merriweather', url: 'https://fonts.googleapis.com/css2?family=Merriweather:wght@300;400;700&display=swap', family: "'Merriweather', serif" },
    { name: 'Lora', url: 'https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600;700&display=swap', family: "'Lora', serif" },
    { name: 'Roboto Mono', url: 'https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@300;400;500;700&display=swap', family: "'Roboto Mono', monospace" },
    { name: 'Dancing Script', url: 'https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;500;600;700&display=swap', family: "'Dancing Script', cursive" },
    { name: 'Pacifico', url: 'https://fonts.googleapis.com/css2?family=Pacifico&display=swap', family: "'Pacifico', cursive" },
    { name: 'Oswald', url: 'https://fonts.googleapis.com/css2?family=Oswald:wght@300;400;500;600;700&display=swap', family: "'Oswald', sans-serif" },
    { name: 'Raleway', url: 'https://fonts.googleapis.com/css2?family=Raleway:wght@300;400;500;600;700&display=swap', family: "'Raleway', sans-serif" },
    { name: 'Nunito', url: 'https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;600;700&display=swap', family: "'Nunito', sans-serif" },
];

export function FontManager() {
    const { settings } = usePOS();

    useEffect(() => {
        const selectedFont = AVAILABLE_FONTS.find(f => f.name === settings.font) || AVAILABLE_FONTS[0];

        // 1. Update/Inject Link Tag
        let linkId = 'dynamic-font-link';
        let link = document.getElementById(linkId) as HTMLLinkElement;

        if (!link) {
            link = document.createElement('link');
            link.id = linkId;
            link.rel = 'stylesheet';
            document.head.appendChild(link);
        }

        link.href = selectedFont.url;

        // 2. Update Body Font Family
        document.body.style.fontFamily = selectedFont.family;
        // Also update CSS variable if used by Tailwind/shadcn
        document.documentElement.style.setProperty('--font-sans', selectedFont.family.split(',')[0].replace(/'/g, ''));

    }, [settings.font]);

    return null; // Logic only component
}
