import React from 'react';
import './App.css';
import {BrowserRouter as Router, Routes, Route, Navigate} from "react-router-dom";
import NotFound from "./components/NotFound";
import Home from "./components/Home";
import Register from "./components/Register";
import Login from "./components/Login";
import UserProfile from "./components/UserProfile";
import EditProfile from "./components/EditProfile";
import Petitions from './components/Petitions';
import Petition from './components/Petition';
import Create from './components/Create';
import EditPetition from './components/EditPetition';
import MyPetitions from './components/MyPetitions';
import Cookies from 'js-cookie';

const userId = Cookies.get("userId");

function App() {
  return (
    <div className="App">
      <Router>
          <Routes>
            <Route path="/users/login" element={<Login />} />
            <Route path="/users/register" element={<Register/>}/>
            <Route path="/home" element={<Home/>}/>
            <Route path="" element={<Home/>}/>
            <Route path="/users/:id" element={<UserProfile />}/>
            <Route path="/users/:id/edit" element={<EditProfile />}/>
            <Route path="*" element={<NotFound/>}/>
            <Route path="/petitions" element={<Petitions/>}/>
            <Route path="/petitions/:id" element={<Petition/>}/>
            <Route path="/petitions/create" element={<Create />}/>
            <Route path="/petitions/:id/edit" element={<EditPetition />}/>
            <Route path="/user/petitions" element={<MyPetitions />}/>
          </Routes>
      </Router>
    </div>
  );
}

export default App;