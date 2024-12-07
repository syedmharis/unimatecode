import TinderCard from 'react-tinder-card'
import {useEffect, useState} from 'react'
import ChatContainer from '../components/ChatContainer'
import {useCookies} from 'react-cookie'
import axios from 'axios'

const Dashboard = () => {
    const [user, setUser] = useState(null)
    const [genderedUsers, setGenderedUsers] = useState(null)
    const [majorInterest, setMajorInterest] = useState(null)
    const [ethnicityInterest, setEthnicityInterest] = useState(null)
    const [lastDirection, setLastDirection] = useState()
    const [viewMore, setViewMore] = useState(false); // State for "View More"
    const [cookies, setCookie, removeCookie] = useCookies(['user'])

    const userId = cookies.UserId

    const handleViewMore = () => {
        setViewMore(!viewMore); // Toggle View More
    };


    const getUser = async () => {
        try {
            const response = await axios.get('http://localhost:8000/user', {
                params: {userId}
            })
            setUser(response.data)
        } catch (error) {
            console.log(error)
        }
    }
    const getGenderedUsers = async () => {
        try {
            const response = await axios.get('http://localhost:8000/gendered-users', {
                params: {gender: user?.gender_interest}
            })
            setGenderedUsers(response.data)
        } catch (error) {
            console.log(error)
        }
    }

    // Fetch Users Filtered by Major
    const getMajorFilteredUsers = async () => {
        try {
            const response = await axios.get('http://localhost:8000/majored-users', {
                params: {
                    major: user?.major_interest // Pass the selected major filter
                },
            })
            setMajorInterest(response.data);
        } catch (error) {
            console.log(error);
        }
    };

    const getEthnicityFilteredUsers = async () => {
        try {
            const response = await axios.get('http://localhost:8000/ethnicity-users', {
                params: {
                    ethnicity: user?.ethnicity_interest // Pass the selected major filter
                },
            })
            setEthnicityInterest(response.data);
        } catch (error) {
            console.log(error);
        }
    };
    useEffect(() => {
        getUser()

    }, [])

    useEffect(() => {
        if (user) {
            getGenderedUsers()
        }
    }, [user])

    useEffect(() => {
        if (user) {
            console.log('Fetching users with majorInterest:', majorInterest);
            getMajorFilteredUsers()
        }

    }, [user]);

    useEffect(() => {
        if (user) {
            console.log('Fetching users with ethnicityInterest:', ethnicityInterest);
            getEthnicityFilteredUsers()
        }

    }, [user]);

    const updateMatches = async (matchedUserId) => {
        try {
            await axios.put('http://localhost:8000/addmatch', {
                userId,
                matchedUserId
            })
            getUser()
        } catch (err) {
            console.log(err)
        }
    }

    console.log(user)


    const swiped = (direction, swipedUserId) => {
        if (direction === 'right') {
            updateMatches(swipedUserId)
        }
        setLastDirection(direction)
    }

    const outOfFrame = (name) => {
        console.log(name + ' left the screen!')
    }

    const matchedUserIds = user?.matches.map(({user_id}) => user_id).concat(userId)

    // const filteredGenderedUsers = genderedUsers?.filter(genderedUser => !matchedUserIds.includes(genderedUser.user_id))
    //
    // const filteredMajorUsers = majorInterest?.filter(majorInterest => !matchedUserIds.includes(majorInterest.user_id));

    const filteredGenderedUsers = genderedUsers?.filter(
        (genderedUser) => !matchedUserIds.includes(genderedUser.user_id)
    );

    // const filteredGenderedUsers = user?.gender_interest === 'everyone'
    //     ? genderedUsers // No filtering for gender
    //     : genderedUsers?.filter(
    //         (genderedUser) =>
    //             genderedUser.gender_identity === user?.gender_interest && // Match the selected gender
    //             !matchedUserIds.includes(genderedUser.user_id) // Exclude already matched users
    //     );
    //
    // const filteredEthnicityUsers = user?.ethnicity_interest === 'everyone'
    //     ? genderedUsers // Include all users if "everyone" is selected
    //     : ethnicityInterest?.filter(
    //         (ethnicityUser) => !matchedUserIds.includes(ethnicityUser.user_id)
    //     );





    const filteredMajorUsers = majorInterest?.filter(
        (majorUser) => !matchedUserIds.includes(majorUser.user_id)
    );

    const filteredEthnicityUsers = ethnicityInterest?.filter(
        (ethnicityUser) => !matchedUserIds.includes(ethnicityUser.user_id)
    );

    const filteredUsers = filteredGenderedUsers?.filter((user) =>
        filteredMajorUsers?.some((majorUser) => majorUser.user_id === user.user_id) &&
        filteredEthnicityUsers?.some((ethnicityUser) => ethnicityUser.user_id === user.user_id)
    );



// // Combine both filters (intersection)
//     const filteredUsers = filteredGenderedUsers?.filter((user) =>
//         filteredMajorUsers?.some((majorUser) => majorUser.user_id === user.user_id)
//     );

    console.log('Combined Filtered Users:', filteredUsers);



    console.log('filteredGenderedUsers ', filteredGenderedUsers)
    console.log('filteredMajorUsers ', filteredMajorUsers)
    return (
        <>
            {user &&
                <div className="dashboard">
                    <ChatContainer user={user}/>
                    {/*<div className="swipe-container">*/}
                    {/*    <div className="card-container">*/}

                    {/*        {filteredGenderedUsers?.map((genderedUser) =>*/}
                    {/*            <TinderCard*/}
                    {/*                className="swipe"*/}
                    {/*                key={genderedUser.user_id}*/}
                    {/*                onSwipe={(dir) => swiped(dir, genderedUser.user_id)}*/}
                    {/*                onCardLeftScreen={() => outOfFrame(genderedUser.first_name)}*/}
                    {/*            >*/}
                    {/*                <div*/}
                    {/*                    style={{*/}
                    {/*                        backgroundImage: 'url(' + genderedUser.url + ')',*/}
                    {/*                    }}*/}
                    {/*                    className={`card ${viewMore ? 'darkened' : ''}`} // Apply darkened class when "View More" is active*/}
                    {/*                >*/}
                    {/*                    <div className="card-content">*/}
                    {/*                        <h3>{genderedUser.first_name}</h3>*/}

                    {/*                        /!* Hide this section when "View More" is clicked *!/*/}
                    {/*                        {!viewMore && (*/}
                    {/*                            <div className="default-info">*/}
                    {/*                                <p><strong>Ethnicity:</strong> {genderedUser.ethnicity}</p>*/}
                    {/*                                <p><strong>Major:</strong> {genderedUser.major}</p>*/}
                    {/*                                <p><strong>About Me:</strong> {genderedUser.about_me}</p>*/}
                    {/*                            </div>*/}
                    {/*                        )}*/}

                    {/*                        <button onClick={handleViewMore} className="view-more-button">*/}
                    {/*                            {viewMore ? 'View Less' : 'View More'}*/}
                    {/*                        </button>*/}

                    {/*                        /!* View More Content - show this when "View More" is clicked *!/*/}
                    {/*                        {viewMore && (*/}
                    {/*                            <div className="view-more-content">*/}
                    {/*                                <p><strong>Karaoke Song:</strong> {genderedUser.funPrompt1}</p>*/}
                    {/*                                <p><strong>Superpower:</strong> {genderedUser.funPrompt2}</p>*/}
                    {/*                                <p><strong>Spontaneous Thing:</strong> {genderedUser.funPrompt3}</p>*/}
                    {/*                                <p><strong>Guilty Pleasure Show:</strong> {genderedUser.funPrompt4}</p>*/}
                    {/*                            </div>*/}
                    {/*                        )}*/}
                    {/*                    </div>*/}
                    {/*                </div>*/}
                    {/*            </TinderCard>*/}
                    {/*        )}*/}


                    {/*        )}*/}
                    {/*        <div className="swipe-info">*/}
                    {/*            {lastDirection ? <p>You swiped {lastDirection}</p> : <p/>}*/}
                    {/*        </div>*/}
                    {/*    </div>*/}
                    {/*</div>*/}
                    <div className="swipe-container">
                        <div className="card-container">
                            {filteredUsers?.map((user) => (
                                <TinderCard
                                    className="swipe"
                                    key={user.user_id}
                                    onSwipe={(dir) => swiped(dir, user.user_id)}
                                    onCardLeftScreen={() => outOfFrame(user.first_name)}
                                >
                                    <div
                                        style={{
                                            backgroundImage: 'url(' + user.url + ')',
                                        }}
                                        className={`card ${viewMore ? 'darkened' : ''}`} // Apply darkened class when "View More" is active
                                    >
                                        <div className="card-content">
                                            <h3>{user.first_name}</h3>

                                            {!viewMore && (
                                                <div className="default-info">
                                                    <p><strong>Ethnicity:</strong> {user.ethnicity}</p>
                                                    <p><strong>Major:</strong> {user.major}</p>
                                                    <p><strong>About Me:</strong> {user.about_me}</p>
                                                </div>
                                            )}

                                            <button onClick={handleViewMore} className="view-more-button">
                                                {viewMore ? 'View Less' : 'View More'}
                                            </button>

                                            {viewMore && (
                                                <div className="view-more-content">
                                                    <p><strong>Karaoke Song:</strong> {user.funPrompt1}</p>
                                                    <p><strong>Superpower:</strong> {user.funPrompt2}</p>
                                                    <p><strong>Spontaneous Thing:</strong> {user.funPrompt3}</p>
                                                    <p><strong>Guilty Pleasure Show:</strong> {user.funPrompt4}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </TinderCard>
                            ))}
                            <div className="swipe-info">
                                {lastDirection ? <p>You swiped {lastDirection}</p> : <p/>}
                            </div>
                        </div>
                    </div>

                </div>}
        </>
    )
}
export default Dashboard
