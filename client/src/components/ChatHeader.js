import { useCookies } from 'react-cookie';
import {useState} from "react";
import { useNavigate } from 'react-router-dom';

const ChatHeader = ({ user }) =>{
    let navigate = useNavigate();
    const [ cookies, setCookies, removeCookie] = useCookies(['user']);
    const logout = () => {
        removeCookie('UserId', cookies.UserId);
        removeCookie('AuthToken', cookies.AuthToken);
        navigate("/home");
    }
    return (
        <div className="chat-container-header">
            <div className="profile">
                <div className="img-container">
                    <img src={user?.url} alt={"photo of" + user?.first_name}/>
                </div>
                <h3>{user.first_name}</h3>
            </div>
            <i className="log-out-icon" onClick={logout}>⬅</i>
        </div>
    )
}

export default ChatHeader