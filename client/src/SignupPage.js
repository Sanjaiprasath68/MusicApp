import React, { useState } from 'react';
import { Form, Button, Container, Row, Col, Card } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const SignupPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();

    // Password length validation
    if (password.length < 8) {
      alert('Password must be 8 characters or longer.');
      return;
    }

    try {
      // Send signup data to backend
      const response = await axios.post('http://localhost:5000/signup', { email, password });
      console.log('Signup response:', response.data);

      // Reset form fields
      setEmail('');
      setPassword('');

      // Navigate to login page after successful signup
      navigate('/login');
    } catch (error) {
      console.error('Signup error:', error);
      // Handle signup error
    }
  };

  return (
    <Container>
      <Row className="justify-content-center mt-5">
        <Col md={6}>
          <Card>
            <Card.Body>
              <h2 className="text-center mb-4">Sign Up</h2>
              <Form onSubmit={handleSignup}>
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
                    minLength={8} // Minimum password length requirement
                    required
                  />
                </Form.Group>

                <Button variant="primary" type="submit" className="w-100 mt-3">
                  Sign Up
                </Button>
              </Form>
              <p className="text-center mt-3">Already have an account? <a href="/login">Login here</a></p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default SignupPage;
