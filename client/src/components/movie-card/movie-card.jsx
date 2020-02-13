import React from 'react';
import PropTypes from 'prop-types';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import './movie-card.scss';

import { Link } from 'react-router-dom';


export class MovieCard extends React.Component {
  render() {
    const { movie } = this.props;

    return (
      <Card className="mb-3 h-100" style={{ width: '16rem' }} >
        <Card.Img variant="top" src={movie.ImagePath} />
        <Card.Body>
          <Link className="text-muted" to={`/movies/${movie._id}`}>
            <Card.Title>{movie.Title}</Card.Title>
          </Link>
          <Card.Text>{movie.Description.substring(0, 90)}...</Card.Text>
        </Card.Body>
        <Card.Footer className="bg-white border-top-0">
          <Link to={`/movies/${movie._id}`}>
            <Button variant="link" className="read-more-link pl-0">More</Button>
          </Link>
        </Card.Footer>
      </Card>
    );
  }
}

MovieCard.propTypes = {
  movie: PropTypes.shape({
    Title: PropTypes.string,
    Description: PropTypes.string,
    ImagePath: PropTypes.string
  }).isRequired
};