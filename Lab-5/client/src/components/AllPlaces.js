import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, gql } from "@apollo/client";
import ErrorPage from "./Error";
import queries from "../queries";
import noImage from '../img/download.jpeg';

import {
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Grid,
  Typography,
  makeStyles,
  Button
} from '@material-ui/core';

import '../App.css';
const useStyles = makeStyles({
  card: {
    maxWidth: 250,
    height: 'auto',
    marginLeft: 'auto',
    marginRight: 'auto',
    borderRadius: 5,
    border: '1px solid #1e8678',
    boxShadow: '0 19px 38px rgba(0,0,0,0.30), 0 15px 12px rgba(0,0,0,0.22);',
  },
  titleHead: {
    borderBottom: '1px solid #1e8678',
    fontWeight: 'bold',
  },
  grid: {
    flexGrow: 1,
    flexDirection: 'row',
  },
  media: {
    height: '100%',
    width: '100%',
  },
  button: {
    color: '#1e8678',
    fontWeight: 'bold',
    fontSize: 12,
  },
});


const AllPlaces = () => {
    const [pageNum, setPageNum] = useState(1);
    const classes = useStyles();

    const { loading, error, data } = useQuery(queries.LOCATION_POSTS, {
        variables: { pageNum },
        fetchPolicy: "cache-and-network",
      });

    console.log(data)

    const [updatePlace] = useMutation(queries.UPDATE_LOCATION)

    const buildCard = (place) => {
        return (
          <Grid item xs={12} sm={6} md={4} lg={3} xl={2} key={place.id}>
            <Card className={classes.card} variant='outlined'>
              <CardActionArea>
                  <CardMedia
                    className={classes.media}
                    component='img'
                    image={
                      place.image && place.image
                        ? place.image
                        : noImage
                    }
                    title='place image'
                  />
    
                  <CardContent>
                    <Typography
                      className={classes.titleHead}
                      gutterBottom
                      variant='h6'
                      component='h3'
                    >
                      {place.name}
                    </Typography>
                    <Typography variant='body2' color='textSecondary' component='p'>
                      {place.address
                        ? place.address
                        : 'No Address'}
                        <br/>
                        {place.liked ? (
                            <Button 
                                className="showlink"
                                onClick={() => {
                                updatePlace({
                                    variables: {
                                        id: place.id, 
                                        image: place.image, 
                                        userPosted: place.userPosted, 
                                        name: place.name, 
                                        address: place.address, 
                                        liked: false
                                    },
                                });
                               
                                }}
                            >
                                Unlike
                            </Button>
                        ) : (
                            <Button
                                className="showlink"
                                onClick={() => {
                                    updatePlace({
                                        variables: {
                                            id: place.id, 
                                            image: place.image, 
                                            userPosted: place.userPosted, 
                                            name: place.name, 
                                            address: place.address, 
                                            liked: true
                                        },
                                    });
                                    
                                }}
                            >
                                Like
                            </Button>
                        )}
                    </Typography>
                  </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        );
      };

    if(loading) {
        return (
            <div>
                <h2>Loading...</h2>
            </div>
        );
    } else if (error) {
        return (
            <div>
                <ErrorPage name={"All Places"} />
            </div>
        );
    } else if(!loading && data.locationPosts.length) {
        return (
                <div className="App">
                    <Button variant="contained">
                        <Link to="/new-location" className="btn btn-primary my-2">
                            Add New Location
                        </Link>
                    </Button>
                <br/>
                <br/>
                
                    <Grid container className={classes.grid} spacing={5}>
                        {data.locationPosts.map((d) =>  buildCard(d))}
                    </Grid>
                </div>
        );
    } else {
        return (
            <div>
              <ErrorPage name={"All Places"} />
            </div>
        );
    }
}

export default AllPlaces;

