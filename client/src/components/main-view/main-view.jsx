import axios from 'axios';
import React from 'react';

import { connect } from 'react-redux';
import { BrowserRouter as Router, Route } from "react-router-dom";
import { Link } from 'react-router-dom';
import { setMovies } from '../../actions/actions';

import MoviesList from '../movies-list/movies-list';
import { MovieCard } from '../movie-card/movie-card';
import Button from 'react-bootstrap/Button';
import { MovieView } from '../movie-view/movie-view';
import { LoginView } from '../login-view/login-view';
import { GenreView } from '../genre-view/genre-view';
import { ProfileView } from '../profile-view/profile-view';
import { UpdateProfile } from '../profile-view/profile-update';
import { DirectorView } from '../director-view/director-view';
import { RegistrationView } from '../registration-view/registration-view';

import './main-view.scss';

class MainView extends React.Component {

  constructor() {
    super();

    this.state = {
      movies: [],
      user: null,
      register: false,
      profileData: null
    };
  }
  

  componentDidMount() {
    let accessToken = localStorage.getItem('token');
    if (accessToken !== null) {
      this.setState({
        user: localStorage.getItem('user'),
        profileData: localStorage.getItem('user')
      });
      this.getMovies(accessToken);
    }
}


  getProfileData(token) {
    axios.get(`https://hoymyflix.herokuapp.com/users/${localStorage.getItem('user')}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(response => {
        this.props.setUserProfile(response.data);
      })
      .catch(function (error) {
        alert('An error occured: ' + error);
      });
  }

  onLoggedIn(authData) {
    console.log(authData);
    this.setState({
      user: authData.user.Username,
      profileData: authData.user
    });
    this.props.setLoggedInUser(authData.user);
    localStorage.setItem('token', authData.token);
    localStorage.setItem('user', authData.user.Username);
    this.getMovies(authData.token);
  }


  getMovies(token) {
    axios
      .get("https://hoymyflix.herokuapp.com/movies", {
        headers: { Authorization: `Bearer ${token}`}
    })
    .then(response => {
      this.props.setMovies(response.data);
    })
    .catch(function (error) {
      console.log(error);
    });
  }


  //one of the hooks available in React Component

  onLoggedIn(authData) {
    this.setState({
      user: authData.user.Username
    });

    localStorage.setItem('token', authData.token);
    localStorage.setItem('user', authData.user.Username);
    this.getMovies(authData.token);
  }


  onLoggedOut() {
    this.setState({
      user: null
    });

    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }


  onSignedIn(user) {
    this.setState({
      user: user,
      register: false
    });
  }
  register() {
    this.setState({
      register: true
    });
  }

  updateUser(data) {
    this.setState({
      profileData: data
    });
    localStorage.setItem('user', data.Username);
  }


  render() {
    let { movies } = this.props;
    let { profileData } = this.props;
    let { user } = this.state;

    return (
      <Router>
         <div className="main-view">
         <Link to={`/users/${user}`}>
            <Button variant="primary" type="submit">Profile
             </Button>
          </Link>
          <Button variant="primary" type="submit" onClick={() => this.onLoggedOut()}>Logout
          </Button>
          <Route exact path="/" render={() => {
             if (!user) return <LoginView onLoggedIn={user => this.onLoggedIn(user)} />;
             return <MoviesList movies={movies}/>;
         }} />
          <Route path="/movies/:movieId" render={({match}) => <MovieView movie={movies.find(m => m._id === match.params.movieId)}/>}/>
          <Route path="/register" render={() => <RegistrationView />} />
          <Route path="/users/:Username" render={() => { 
            return <ProfileView profileData={profileData} /> }} />
          <Route exact path="/user" render={() => <ProfileView movies={movies} />} />
          <Route path='/user/update' render={() => <UpdateProfile />} />
          <Route path="/genres/:name" render={({ match }) => {
            if (!movies || !movies.length) return <div className="main-view" />;
            return <GenreView genre={movies.find(m => m.Genre.Name === match.params.name).Genre} />
          }
          } />
          <Route exact path="/directors/:name" render={({ match }) => {
              if (!movies) return <div className="main-view" />;
              return ( <DirectorView director={ movies.find( m => m.Director.Name === match.params.name ).Director
                  }
                />
              );
            }}
          />
         </div>
      </Router>
    );
  }
}

let mapStateToProps = state => {
  return { movies: state.movies }
}

export default connect(mapStateToProps, { setMovies } )(MainView);

