import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import '../css/app.css';
import { AppRouter } from './src/router/AppRouter';
import { ThemeProvider } from './src/theme/ThemeProvider';
import { AuthProvider } from './src/app/providers/AuthProvider';

function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <BrowserRouter>
                    <AppRouter />
                </BrowserRouter>
            </AuthProvider>
        </ThemeProvider>
    );
}

const rootElement = document.getElementById('app');

if (rootElement) {
    ReactDOM.createRoot(rootElement).render(
        <React.StrictMode>
            <App />
        </React.StrictMode>,
    );
}
