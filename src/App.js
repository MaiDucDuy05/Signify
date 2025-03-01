import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useRef,useState,useEffect } from 'react';
import publicRoutes from './routes/routes';
import LayOut from './layouts/Layout/Layout';

function NotFoundPage() {
    return <h1>404 - Page Not Found</h1>;
}

function App() {
    return (
        <Router>
            <div className="App">
                <Routes>
                {publicRoutes.map((route, index) => {
                        const Page = route.component;
                        let Layout = LayOut;
                        return (
                            <Route
                                key={index}
                                path={route.path}
                                element={
                                    <Layout>
                                        <Page />
                                    </Layout>
                                }
                            />
                        );
                    })}
                {/* Route cuối cùng để xử lý trang không tồn tại */}
                <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;


// import React from "react";
// import VideoChat from "./components/VideoChat/VideoChat";

// function App() {
//   return (
//     <div>
//       <VideoChat />
//     </div>
//   );
// }

// export default App;