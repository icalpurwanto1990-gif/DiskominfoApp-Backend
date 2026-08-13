import './bootstrap';
import '../css/app.css';

import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { RadioPlayerProvider } from './Components/RadioPlayerContext';

const appName = import.meta.env.VITE_APP_NAME || 'Portal Diskominfo';

createInertiaApp({
    title: (title) => title ? `${title} - ${appName}` : appName,
    resolve: (name) => resolvePageComponent(`./Pages/${name}.jsx`, import.meta.glob('./Pages/**/*.jsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);
        root.render(
            <RadioPlayerProvider>
                <App {...props} />
            </RadioPlayerProvider>
        );
    },
    progress: {
        color: '#10b981', // Emerald theme color
    },
});
