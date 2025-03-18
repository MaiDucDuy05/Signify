import Home from '../pages/Home/Home';
import Meeting from '../pages/Meeting/Meeting';
import SignUp from '../pages/SignUp/SignUp';
import LogIn from '../pages/LogIn/LogIn';
import WaitingRoom from '../pages/WaitingRoom/WaitingRoom';
import DashBoard from '../pages/DashBoard/DashBoard';
import HistoryMesting from '../pages/HistoryMesting/HistoryMesting';
import Schedule from '../pages/Schedule/Schedule';
import NewMeeting from '../pages/NewMeeting/NewMeeting';

const publicRoutes = [
    { path: '/', component: Home },
    { path: '/meeting', component: Meeting },
    { path: '/signup', component: SignUp },
    { path: '/login', component: LogIn },
    { path: '/waiting-room', component: WaitingRoom },
    {path: '/dashboard', component: DashBoard },
    {path:'/history-meeting',component:HistoryMesting},
    {path:'/schedule',component:Schedule},
    {path:'/new-meeting',component:NewMeeting}
];

export default publicRoutes;