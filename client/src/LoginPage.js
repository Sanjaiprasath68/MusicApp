import React, { useState } from 'react';
import { Form, Button, Container, Row, Col, Card } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const LoginPage = ({ signin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // Send login data to backend for validation
      const response = await axios.post('https://music-app-api-seven.vercel.app/login', { email, password });
      console.log('Login response:', response.data);

      // Reset form fields
      setEmail('');
      setPassword('');

      // Navigate to app page after successful login
      navigate('/app');
      signin(); // Optional: Trigger sign-in state change in parent component
    } catch (error) {
      console.error('Login error:', error);
      // Handle login error
      alert('Invalid credentials. Please try again.');
    }
  };

  return (
    <Container>
      <Row className="justify-content-center mt-5">
        <Col md={6}>
          <Card>
            <Card.Body>
              <h2 className="text-center mb-4">Login</h2>
              <Form onSubmit={handleLogin}>
                <Form.Group controlId="formBasicEmail">
                  <Form.Label>Email address</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Enter email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group controlId="formBasicPassword">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </Form.Group>

                <Button variant="primary" type="submit" className="w-100 mt-3">
                  Login
                </Button>
              </Form>
              <p className="text-center mt-3">Don't have an account? <a href="/">Sign up here</a></p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default LoginPage;
