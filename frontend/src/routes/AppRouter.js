import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { publicRoutes, privateRoutes } from './routes.js';
import LayOut from '../layouts/Layout/Layout.js';
import { useAuth } from "../context/AuthContext.js";
import LogIn from '../pages/LogIn/LogIn.js';

function NotFoundPage() {
    return <h1>404 - Page Not Found</h1>;
}

function AppRoutes() {
    const { user} = useAuth();
    const location = useLocation();

    return (
        <Routes>
            {publicRoutes.map((route, index) => {
                const Page = route.component;
                return (
                    <Route
                        key={index}
                        path={route.path}
                        element={<LayOut><Page /></LayOut>}
                    />
                );
            })}

            {privateRoutes.map((route, index) => {
                const Page = route.component;
                return (
                    <Route
                        key={index}
                        path={route.path}
                        element={
                            user 
                                ? <LayOut><Page /></LayOut> 
                                : <LayOut><LogIn/></LayOut>
                        }
                    />
                );
            })}

            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    );
}

export default AppRoutes;
