import React, {useState} from 'react'
import axios from 'axios'
import {useNavigate} from 'react-router-dom'
import { useCookies } from 'react-cookie'

const AuthModal = ({setShowModal, isSignUp}) => {
    const [email, setEmail] = useState(null)
    const [password, setPassword] = useState(null)
    const [confirmPassword, setConfirmPassword] = useState(null)
    const [error, setError] = useState(null)
    const [cookies, setCookie, removeCookie] = useCookies(['user'])

    let navigate = useNavigate()

    console.log(email, password, confirmPassword)


    const handleClick = () => {
        setShowModal(false)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            // Check if passwords match (only for sign-up)
            if (isSignUp && (password !== confirmPassword)) {
                setError('Passwords do not match')
                return
            }

            console.log('Making a POST request to signup/login...')

            // Make POST request to backend (either signup or login)
            const response = await axios.post(`http://localhost:8000/${isSignUp ? 'signup' : 'login'}`, {
                email,
                password
            })

            // setCookie('Email', response.data.email)
            setCookie('UserId', response.data.userId)
            setCookie('AuthToken', response.data.token)


            console.log('Response from the API:', response)

            // Check if the response was successful
            const success = response.status === 201

            // Navigate based on sign-up or login
            if (success && isSignUp) {
                console.log('Redirecting to onboarding...')
                navigate('/onboarding')
            }
            if (success && !isSignUp) {
                console.log('Redirecting to dashboard...')
                navigate('/dashboard')
            }

            window.location.reload();

        } catch (error) {
            console.log('Error during signup/login:', error)
        }
    }



    return (


        <div className="auth-modal">
            <div className="close-icon" onClick={handleClick}>⨂</div>
            <h2>{isSignUp ? 'CREATE ACCOUNT' : 'LOG IN'}</h2>
            <form onSubmit={handleSubmit}>

                <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="email"
                    required={true}
                    onChange={(e) => setEmail(e.target.value)}/>

                <input
                    type="password"
                    id="password"
                    name="password"
                    placeholder="password"
                    required={true}
                    onChange={(e) => setPassword(e.target.value)}/>

                {isSignUp &&
                    <input
                        type="password"
                        id="password-check"
                        name="password-check"
                        placeholder="confirm password"
                        required={true}
                        onChange={(e) => setConfirmPassword(e.target.value)}/>}


                <input className="secondary-button" type="submit"/>

                <p>{error}</p>

            </form>


        </div>


    )
}

export default AuthModal