import React from 'react';
import axios from 'axios';

import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';
import './profile-view.scss'

import { Link } from "react-router-dom";

export class ProfileView extends React.Component {

  constructor() {
    super();
    this.state = {
      username: null,
      password: null,
      email: null,
      birthday: null,
      userData: null,
      favoriteMovies: []
    };
  }

  componentDidMount() {
    let accessToken = localStorage.getItem('token');
    if (accessToken !== null) {
      this.getUser(accessToken);
    }
  }

  getUser(token) {
    let username = localStorage.getItem('user');
    axios.get(`http://localhost:3000/users/${username}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(response => {
        this.setState({
          username: response.data.Username,
          password: response.data.Password,
          email: response.data.Email,
          birthday: response.data.Birthday,
          favoriteMovies: response.data.FavoriteMovies
        });
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  deleteProfile() {
    axios.delete(`http://localhost:3000/users/${localStorage.getItem('user')}`,
      {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      .then(res => {
        alert('Do you really want to delete your account?')
      })
      .then(res => {
        alert('Account was successfully deleted')
      })
      .then(res => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        this.setState({
          user: null

        });
        window.open('/', '_self');
      })
      .catch(e => {
        alert('Account could not be deleted ' + e)
      });
  }


  deleteFavoriteMovie(movieId) {
    console.log(this.props.movies);
      // send a request to the server for authentication
      axios.delete(`http://localhost:3000/users/${localStorage.getItem('user')}/Movies/${movieId}`, {
         headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      .then(res => {
        alert('Removed movie from favorites');
      })
      .catch(e => {
        alert('error removing movie' + e);
      });
    }

  handleChange(e) {
    this.setState({ [e.target.name]: e.target.value })
  }

  render() {
    const { username, email, birthday, favoriteMovies } = this.state;
    

    return (
      <Card className="profile-view" style={{ width: '32rem' }}>
        <Card.Body>
          <Card.Title className="profile-title">My Profile</Card.Title>
          <ListGroup className="list-group-flush" variant="flush">
            <ListGroup.Item>Username: {username}</ListGroup.Item>
            <ListGroup.Item>Password: ***** </ListGroup.Item>
            <ListGroup.Item>Email: {email}</ListGroup.Item>
            <ListGroup.Item>Birthday: {birthday && birthday.slice(0, 10)}</ListGroup.Item>
            <ListGroup.Item>Favorite Movies: {favoriteMovies}</ListGroup.Item>
            </ListGroup>
            <div className="text-center">
            <Link to={'/user/update'}>
                          <Button variant='primary'>Update Profile</Button>
                      </Link>
                      <Link to={'/user'}>
                          <Button variant='primary' onClick={() => this.deleteFavoriteMovie()}>Delete Favorite</Button>
                      </Link>
            <Link to={`/`}>
              <Button variant="primary" className="button-back">Back to movies</Button>
            </Link>
            <Link to={`/`}>
              <Button variant="danger" className="delete-button" onClick={() => this.deleteProfile()}>Delete my profile</Button>
              </Link>
          </div>
        </Card.Body>
      </Card>
    );
  }
}