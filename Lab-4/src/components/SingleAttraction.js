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
    const [attractionData, setAttractionData] = useState(undefined);
    const [loading, setloading] = useState(true)
    const classes = useStyles()

    let {id} = useParams();

/*     const tConvert = (time) => {
        // Check correct time format and split into components
        time = time
        .toString()
        .match(/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time];

        if (time.length > 1) {
        // If time format correct
        time = time.slice(1); // Remove full string match value
        time[5] = +time[0] < 12 ? 'AM' : 'PM'; // Set AM/PM
        time[0] = +time[0] % 12 || 12; // Adjust hours
        }
        return time.join(''); // return adjusted time or original string
    }; */

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
              `https://app.ticketmaster.com/discovery/v2/attractions/${id}?apikey=j4seKRXKtlDrFGapW4DMmcwIZvJqOFRH`
            );
            setAttractionData(attraction);
            setloading(false);
            console.log(attraction);
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
            <CardHeader className={classes.titleHead} title={attractionData.name} />
            <CardMedia
              className={classes.media}
              component='img'
              image={attractionData.images && attractionData.images[1].url
                ? attractionData.images[1].url
                : noImage}
              title='show image' />
              <CardContent>
                <Typography>
                  <p>
                  {attractionData.classifications[0].segment.name}: {attractionData.classifications[0].genre.name}, {attractionData.classifications[0].subGenre.name}
                  </p>

                  {attractionData.externalLinks &&
                  <p> To more about, follow them on their socials</p>}
                    {attractionData.externalLinks.youtube[0].url &&
                      <a href={attractionData.externalLinks.youtube[0].url} target="_blank" rel="noopener noreferrer">YouTube</a>} &ensp;
                    {attractionData.externalLinks.twitter[0].url &&
                      <a href={attractionData.externalLinks.twitter[0].url} target="_blank" rel="noopener noreferrer">Twitter</a>} &ensp;
                    {attractionData.externalLinks.itunes[0].url &&
                      <a href={attractionData.externalLinks.itunes[0].url} target="_blank" rel="noopener noreferrer">Itunes</a>} &ensp;
                    {attractionData.externalLinks.lastfm[0].url &&
                      <a href={attractionData.externalLinks.lastfm[0].url} target="_blank" rel="noopener noreferrer">LastFM</a>} &ensp;
                    {attractionData.externalLinks.facebook[0].url &&
                      <a href={attractionData.externalLinks.facebook[0].url} target="_blank" rel="noopener noreferrer">Facebook</a>} &ensp;
                    {attractionData.externalLinks.wiki[0].url &&
                      <a href={attractionData.externalLinks.wiki[0].url} target="_blank" rel="noopener noreferrer">Wikipedia</a>} &ensp;
                    {attractionData.externalLinks.spotify[0].url &&
                      <a href={attractionData.externalLinks.spotify[0].url} target="_blank" rel="noopener noreferrer">Spotify</a>} &ensp;
                    { attractionData.externalLinks.musicbrainz[0].url &&
                      <a href={attractionData.externalLinks.musicbrainz[0].url} target="_blank" rel="noopener noreferrer">Music Brainz</a>} &ensp;
                    {attractionData.externalLinks.instagram[0].url &&
                      <a href={attractionData.externalLinks.instagram[0].url} target="_blank" rel="noopener noreferrer">Instagam</a>} &ensp;
                    {attractionData.externalLinks.homepage[0].url &&
                      <a href={attractionData.externalLinks.homepage[0].url} target="_blank" rel="noopener noreferrer">HomePage</a>} &ensp;
                </Typography>
                </CardContent> 
            </Card></>
        )
    }
};

export default SingleVenue;