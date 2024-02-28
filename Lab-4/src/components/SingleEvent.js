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

const SingleEvent = () => {
    const [eventData, setEventData] = useState(undefined);
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
        //console.log('Event useEffect fired');
        async function fetchData() {
          try {
            const {data: event} = await axios.get(
              `https://app.ticketmaster.com/discovery/v2/events/${id}?apikey=j4seKRXKtlDrFGapW4DMmcwIZvJqOFRH`
            );
            setEventData(event);
            setloading(false);
            console.log(event);
          } catch (e) {
            console.log(e);
          }
        }
        fetchData();
      }, [id]);

      let summary = null;
      const regex = /(<([^>]+)>)/gi;
      if (eventData && eventData.summary) {
        summary = eventData && eventData.summary.replace(regex, '');
      } else {
        summary = 'No Summary';
      }
    
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
            <CardHeader className={classes.titleHead} title={eventData.name} />
            <CardMedia
              className={classes.media}
              component='img'
              image={eventData.images && eventData.images[1].url
                ? eventData.images[1].url
                : noImage}
              title='show image' />
              <CardContent>
                  <Typography variant='body2' color='textSecondary' component='span'>
                    <dl>
                      <p>
                        <dt className='title'>Venue: {eventData._embedded.venues[0].name}, {eventData._embedded.venues[0].city.name}, {eventData._embedded.venues[0].state.stateCode}</dt>
                      </p>
                      <p>
                        <dt className='title'>Type: </dt> 
                        {eventData.classifications[0].segment.name}, {eventData.classifications[0].genre.name}, {eventData.classifications[0].subGenre.name}
                      </p>
                      <p><dt className='title'> Ticket are on {eventData.dates.status.code}</dt></p>

                      <p>
                        <dt className='title'>Event Date: </dt>
                        {
                          eventData && eventData.dates.start.dateTime ? (
                            <dd>{formatDate(eventData.dates.start.dateTime)}</dd>
                          ) : (
                            <dd>N/A</dd>
                          )
                        }
                      </p>
                      <p>
                        <dt className='title'>Time Zone: </dt>
                        {
                          eventData && eventData.dates.timezone ? (
                            <dd>{eventData.dates.timezone}</dd>
                          ) : (
                            <dd>N/A</dd>
                          )
                        }
                      </p>
                      <p>
                        <dt className='title'>Public Sales Dates:</dt>
                      </p>
                      <p>
                        <p>Start Date: 
                          {eventData && eventData.sales.public.startDateTime ? (
                            <dd>{formatDate(eventData.sales.public.startDateTime)}</dd>
                          ) : (
                            <dd>N/A</dd>
                          )}
                        </p>
                        <p>End Date: 
                          {eventData && eventData.sales.public.endDateTime ? (
                            <dd>{formatDate(eventData.sales.public.endDateTime)}</dd>
                          ) : (
                            <dd>N/A</dd>
                          )}
                        </p>
                      </p>
                      <p>
                        <dt className='title'>Pre-Sales Dates:</dt>
                      </p>
                      <p>
                        <p>Start Date: 
                          {eventData && eventData.sales.presales[0].startDateTime ? (
                            <dd>{formatDate(eventData.sales.presales[0].startDateTime)}</dd>
                          ) : (
                            <dd>N/A</dd>
                          )}
                        </p>
                        <p>End Date: 
                          {eventData && eventData.sales.presales[0].endDateTime ? (
                            <dd>{formatDate(eventData.sales.presales[0].endDateTime)}</dd>
                          ) : (
                            <dd>N/A</dd>
                          )}
                        </p>
                      </p>
                      <p>
                        <dt className='title'>Price: </dt>
                      </p>
                      <p>Min: {eventData.priceRanges[0].currency} {eventData.priceRanges[0].min}</p>
                      <p>Max: {eventData.priceRanges[0].currency} {eventData.priceRanges[0].max}</p>
                      
                      
                    </dl>
                    {/* <Link to='/events'>Back to all events...</Link> */}
                  </Typography>
                </CardContent> 
            </Card></>
        )
    }
};

export default SingleEvent;