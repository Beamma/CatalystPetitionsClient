import NavBar from './NavBar';

const backgroundImageStyle = {
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
            <div style={{ height: "100vh" }}>
                <img src="https://th.bing.com/th/id/OIG4.eJagUVl8Kn7W0CZmYG0a?pid=ImgGn" style={{ width: "100%"}}></img>
            </div>
        </div>
    )
}

export default Home;