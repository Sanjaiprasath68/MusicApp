import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SignupPage from './SignupPage';
import LoginPage from './LoginPage';
import App from './App';
import Protected from './Protected';


const Root = () => {

  const [isSignedIn, setIsSignedIn] = useState(null);

  const signin = () => {
    setIsSignedIn(true)
  }
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage  signin={signin}/>} />
        <Route
          path="/app"
          element={
            <Protected isSignedIn={isSignedIn}>
              <App />
            </Protected>} />
      </Routes>
    </Router>
  );
};

export default Root;
