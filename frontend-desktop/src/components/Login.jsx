import { React, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';


function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
        const response = await axios.post(
            'http://localhost:3000/api/login',
            { email, password },
            {
            withCredentials: true, 
            }
        );
      
      console.log('Login successful:', response.data);
      alert('Login successful!'); 

      setEmail('');
      setPassword('');
      await new Promise(resolve => setTimeout(resolve, 100));
      navigate('/Main');
    } catch (error) {   
      console.error('Error during login:', error.response || error.message);
      setErrorMessage('Login failed. Please check your credentials');
    }
  };


  return (
    <div className="form-container">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <div className="input-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
        />
        </div>
        <div className="input-group">
        <label htmlFor="password">Password</label>
        <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
        />
        </div>
        {errorMessage && <p className="error-message">{errorMessage}</p>}

        <div className="button-group">
        <button type="submit" className="login-btn">Login</button>
        <button
            type="button"
            className="register-btn"
        >
            Register
        </button>
        </div>
    </form>
    </div>
);
}

export default Login;
