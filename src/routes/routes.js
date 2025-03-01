import Home from '../pages/Home/Home';
import Meeting from '../pages/Meeting/Meeting';
import SignUp from '../pages/SignUp/SignUp';
import LogIn from '../pages/LogIn/LogIn';
import WattingRoom from '../pages/WattingRoom/WattingRoom';
import DashBoard from '../pages/DashBoard/DashBoard';
import HistoryMesting from '../pages/HistoryMesting/HistoryMesting';

const publicRoutes = [
    { path: '/', component: Home },
    { path: '/meeting', component: Meeting },
    { path: '/signup', component: SignUp },
    { path: '/login', component: LogIn },
    { path: '/waiting-room', component: WattingRoom },
    {path: '/dashboard', component: DashBoard },
    {path:'/history-meeting',component:HistoryMesting}
];

export default publicRoutes;