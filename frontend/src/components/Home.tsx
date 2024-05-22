import Logout from "./Logout";
import NavBar from './NavBar';

const backgroundImageStyle = {
    backgroundImage: '../background.jpeg', // Replace with your image URL
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    height: '100vh',
    width: '100%',
    color: 'white', // Adjust text color for better visibility
};

const Home = () => {

    return (
        <div style={backgroundImageStyle}>
            <NavBar></NavBar>
            <div>
                Test
            </div>
        </div>
    )
}

export default Home;