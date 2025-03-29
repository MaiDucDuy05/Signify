import { BrowserRouter as Router} from 'react-router-dom';

import { AuthProvider } from "./context/AuthContext.js";
import AppRoutes from './routes/AppRouter.js';

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="App">
                    <AppRoutes />
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;
