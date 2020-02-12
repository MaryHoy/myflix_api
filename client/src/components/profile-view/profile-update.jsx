import axios from 'axios';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import { Link } from 'react-router-dom';
import React, { useState } from 'react';


import './profile-view.scss';

export function UpdateProfile(props) {
  
  const [username, updateUsername] = useState('');
  const [password, updatePassword] = useState('');
  const [email, updateEmail] = useState('');
  const [birthday, updateDob] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log();
    axios.put(`http://localhost:3000/users/${localStorage.getItem('user')}`, {
      username: username, 
      password: password, 
      birthday: birthday, 
      email: email,
   }, {
       headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    .then(res => {
      const data = res.data;
      console.log(data);
      alert('Your profile was updated successfully!');
      window.open(`/users/${localStorage.getItem('user')}`);
    })
    .catch(error => {
      alert('Error updating user ');
    });
  };

    return (
      <Container className='updateContainer'>
        <Form className='updateForm'>
          <Form.Group controlId="formBasicEmail">
            <Form.Label>Email address</Form.Label>
            <Form.Control type="email" placeholder="Enter email" value={email} onChange={e => updateEmail(e.target.value)} />
    
          </Form.Group>

          <Form.Group controlId='formBasicUsername'>
            <Form.Label>Username</Form.Label>
            <Form.Control type="text" placeholder="Username" value={username} onChange={e => updateUsername(e.target.value)} />
            </Form.Group>
          <Form.Group controlId="formBasicPassword">
            <Form.Label>Password</Form.Label>
            <Form.Control type="password" placeholder="Password" value={password} onChange={e => updatePassword(e.target.value)} />
          </Form.Group>

          <Form.Group controlId='formBasicDob'>
          <Form.Label>Date of Birth</Form.Label>
            <Form.Control type="date" placeholder="01/01/1901" value={birthday} onChange={e => updateDob(e.target.value)} />
          </Form.Group>
          <Button className='update-btn' variant="primary" type="submit" onClick={handleSubmit}>
            Update
          </Button>
          <Link to={`/users/:Username`}>
             <Button className='back-btn' variant='primary'>Go back</Button>
           </Link>

        </Form>
      </Container>
    );
}