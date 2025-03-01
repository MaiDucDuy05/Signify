import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import publicRoutes from './routes/routes';
import LayOut from './layouts/Layout/Layout';
import { AuthProvider } from "./context/AuthContext";

function NotFoundPage() {
    return <h1>404 - Page Not Found</h1>;
}

function App() {
    return (
        <AuthProvider> {/* ✅ Bọc toàn bộ App trong AuthProvider */}
            <Router>
                <div className="App">
                    <Routes>
                        {publicRoutes.map((route, index) => {
                            const Page = route.component;
                            return (
                                <Route
                                    key={index}
                                    path={route.path}
                                    element={
                                        <LayOut>
                                            <Page />
                                        </LayOut>
                                    }
                                />
                            );
                        })}
                        {/* Route cuối cùng để xử lý trang không tồn tại */}
                        <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;
