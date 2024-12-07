import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import OnBoarding from './pages/OnBoarding';
import { BrowserRouter, Routes, Route} from 'react-router-dom'
import {useCookies} from "react-cookie";

const App = () => {
    const [ cookies, setCookies, removeCookie] = useCookies(['user']);

    const authToken = cookies.AuthToken

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/home" element={<Home />} />
                {authToken && <Route path="/dashboard" element={<Dashboard />} />}
                {authToken && <Route path="/onboarding" element={<OnBoarding />} />}
            </Routes>
        </BrowserRouter>
    )
}

export default App