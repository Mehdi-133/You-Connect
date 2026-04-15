import { Outlet } from 'react-router-dom';

export function MarketingLayout() {
    return (
        <div className="page-shell">
            <Outlet />
        </div>
    );
}
