import React, {useState, useEffect} from 'react';
import axios from 'axios';
import {Link, useParams} from 'react-router-dom';
import noImage from '../img/download.jpeg';
import {
  makeStyles,
  Card,
  CardContent,
  CardMedia,
  Typography,
  CardHeader,
} from '@material-ui/core';
import '../App.css';
const useStyles = makeStyles({
  card: {
    maxWidth: 550,
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

const SingleVenue = () => {
    const [venueData, setVenueData] = useState(undefined);
    const [loading, setloading] = useState(true)
    const classes = useStyles()

    let {id} = useParams();

    const formatDate = (showdate) => {
        var year = showdate.substring(0, 4);
        var month = showdate.substring(5, 7);
        var day = showdate.substring(8, 10);
        return month + '/' + day + '/' + year;
    };

    useEffect(() => {
        //console.log('Attraction useEffect fired');
        async function fetchData() {
          try {
            const {data: attraction} = await axios.get(
              `https://app.ticketmaster.com/discovery/v2/venues/${id}?apikey=j4seKRXKtlDrFGapW4DMmcwIZvJqOFRH`
            );
            setVenueData(attraction);
            setloading(false);
            //console.log(attraction);
          } catch (e) {
            console.log(e);
          }
        }
        fetchData();
      }, [id]);


      if (loading) {
        return (
          <div>
            <h2>Loading....</h2>
          </div>
        );
      } else {
        return (
            <>
            <Card className={classes.card} variant='outlined'>
            <CardHeader className={classes.titleHead} title={venueData.name} />
            <CardMedia
              className={classes.media}
              component='img'
              image={venueData.images && venueData.images[0].url
                ? venueData.images[0].url
                : noImage}
              title='show image' />
              <CardContent>
                  <Typography variant='body2' color='textSecondary' component='span'>
                    
                      <p> 
                        <dt class='title'>Address: </dt>
                        {venueData.address.line1}, {venueData.state.name}, {venueData.country.countryCode}
                      </p>
{/* 
                      <p className='title'>General Info: </p>
                      { venueData.generalInfo.generalRule ? (
                            <dd>{venueData.generalInfo.generalRule}</dd>
                          ) : (
                            <dd>N/A</dd>
                          )
                        } */}
                    {/* <Link to='/events'>Back to all events...</Link> */}
                  </Typography>
                </CardContent> 
            </Card></>
        )
    }
};

export default SingleVenue;