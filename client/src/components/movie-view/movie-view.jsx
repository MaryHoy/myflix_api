import React from 'react';
import { Link } from "react-router-dom";
import Button from 'react-bootstrap/Button';
import axios from 'axios';
import './movie-view.scss';

export class MovieView extends React.Component {
  constructor() {
    super();
    this.state = {};
  }

  addToFavorites(e) {
    const { movie } = this.props;
    e.preventDefault();
    axios.post(
      `http://localhost:3000/users/${localStorage.getItem('user')}/Movies/${movie._id}`,
      { username: localStorage.getItem('user') },
      {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      .then(res => {
        alert(`${movie.Title} successfully added to your favorites`);
      })
      // .then(res => {
      //   window.open(`/users/${localStorage.getItem('user')}`)
      // })
      .then(res => {
        document.location.reload(true);
      })
      .catch(error => {
        alert(`${movie.Title} not added to your favorites` + error)
      });
  }

  render() {
    const { movie } = this.props;

    if (!movie) return null;

    return (
      <div
      className="container-fluid align-items-center ml-3 mt-2"
      style={{ width: "660px" }}
    >
      <div className="movie-view">
      <img className="movie-poster" src={movie.ImagePath} />
        <div className="movie-title">
          <h1 className="value">{movie.Title}</h1>
        </div>
        <div className="movie-description">
          <div className="mt-1 mb-3">{movie.Description}</div>
        </div>
        <div className="movie-genre">
          Genre:
          <Link to={`/genres/${movie.Genre.Name}`}>
            <Button variant="link">{movie.Genre.Name}</Button>
          </Link>
        </div>
        <div className="movie-director">
          Director:
          <Link to={`/directors/${movie.Director.Name}`}>
            <Button variant="link">{movie.Director.Name}</Button>
          </Link>
        </div>
        <Link to={`/movies/${movie._id}`}>
            <Button variant="primary" onClick={e => this.addToFavorites(e)}>Add to Favorites</Button>
          </Link>
        <Link to={`/`}>
          <Button variant="primary">
            Back to Movies
          </Button>
        </Link>
      </div>
      </div>
    );
  }
}