import React, {useState, useEffect} from 'react';
import axios from 'axios';
import {Link} from 'react-router-dom';
// import Pagination from './Pagination';
import noImage from '../img/download.jpeg';
import SearchVenues from './SearchVenues';

import {
  Card,
  CardActionArea,
  CardContent,
  Grid,
  Typography,
  makeStyles,
  CardMedia
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

const VenuesList = () => {
  // const regex = /(<([^>]+)>)/gi;
  const classes = useStyles();
  const [loading, setloading] = useState(true);
  const [venuesData, setVenuesData] = useState(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchData, setSearchData] = useState(undefined);
  let card = null;

  let [currentpage, setcurrentpage] = useState("https://app.ticketmaster.com/discovery/v2/venues.json?countryCode=US&page=0&size=20&apikey=j4seKRXKtlDrFGapW4DMmcwIZvJqOFRH")
  const [nextpage, setnextpage] = useState()
  const [prevpage, setprevpage] = useState()
  
  const url = new URL(currentpage);
  const params = new URLSearchParams(url.search);
  const pagenum = parseInt(params.get('page')) + 1;
  let [page, setpage] = useState(pagenum)


  useEffect(() => {
    setloading(true)
    const fetchData = async () => {
      setloading(false)
      const result = await axios.get(currentpage);
      setVenuesData(result.data._embedded.venues);
      if(result.data._links.next) {
        setnextpage("https://app.ticketmaster.com" + result.data._links.next?.href + "&apikey=j4seKRXKtlDrFGapW4DMmcwIZvJqOFRH");
      }
      if(result.data._links.prev){
        setprevpage("https://app.ticketmaster.com" + result.data._links.prev?.href + "&apikey=j4seKRXKtlDrFGapW4DMmcwIZvJqOFRH");
      }
      
    };

    fetchData();
  }, [currentpage]);

  useEffect(() => {
    console.log('search useEffect fired');
    async function fetchData() {
      try {
        console.log(`in fetch searchTerm: ${searchTerm}`);
        const result = await axios.get(
          `https://app.ticketmaster.com/discovery/v2/venues?apikey=j4seKRXKtlDrFGapW4DMmcwIZvJqOFRH&keyword=${searchTerm}&countryCode=US`
        );
        console.log(result.data)
        setSearchData(result.data._embedded.venues);
        //console.log(typeof(result.data._embedded.events))
        if(result.data._links.next) {
          setnextpage("https://app.ticketmaster.com" + result.data._links.next?.href + "&apikey=j4seKRXKtlDrFGapW4DMmcwIZvJqOFRH");
        }
        if(result.data._links.prev){
          setprevpage("https://app.ticketmaster.com" + result.data._links.prev?.href + "&apikey=j4seKRXKtlDrFGapW4DMmcwIZvJqOFRH");
        }
        setloading(false);
      } catch (e) {
        console.log(e);
      }
    }
    if (searchTerm) {
      console.log('searchTerm is set');
      fetchData();
    }
  }, [searchTerm]);

  const searchValue = async (value) => {
    setSearchTerm(value);
  };

  function gotonextpage() {
    setpage(page + 1)
    setcurrentpage(nextpage)
  }

  function gotoprevpage() {
    if(page > 0){
      setpage(page - 1)
    }
    if(page <= 1){
      setpage(1)
    }
    setcurrentpage(prevpage)
  }

  const buildCard = (venue) => {
    console.log(venue)
    return (
      <Grid item xs={12} sm={6} md={4} lg={3} xl={2} key={venue.id}>
        <Card className={classes.card} variant='outlined'>
          <CardActionArea>
            <Link to={`/venues/${venue.id}`}>
            <CardMedia
                className={classes.media}
                component='img'
                
                image={
                  venue.images && venue.images[0].url
                    ? venue.images[0].url
                    : noImage
                }
                title='venue image'
              /> 
              <CardContent>
                <Typography
                  className={classes.titleHead}
                  gutterBottom
                  variant='h6'
                  component='h3'
                >
                {venue.name}
                </Typography>
                <Typography variant='body2' color='textSecondary' component='p'>
                  <p>
                    {venue.city.name},  {venue.state.name}
                  </p>
                  <span>More Info</span>
                </Typography>
              </CardContent>
            </Link>
          </CardActionArea>
        </Card>
      </Grid>
    );
  };

  if (searchTerm) {
    card =
      searchData &&
      searchData.map((venues) => {
        // let event = venues;
        // console.log(event)
        return buildCard(venues);
      });
  } else {
    card =
      venuesData &&
      venuesData.map((venues) => {
        return buildCard(venues);
      });
  }
  
  if (loading) {
    return (
      <div>
        <h2>Loading....</h2>
      </div>
    );
  }
  return(
    <>
    <div>
    <SearchVenues searchValue={searchValue} />
        <br />
        <br />
      {(page !== 1) && 
        <button>
          <Link to={`/venues/page/${page-1}`} onClick={ gotoprevpage }> Previous </Link>
        </button>
      }
      <span> Page {page} </span>
      {(page >= 50) && <redirect to="/404" />}
      {gotonextpage && 
        <button>
          <Link to={`/venues/page/${page+1}`} onClick={ gotonextpage }> Next </Link>
        </button>
      }
    </div>
    <br />
    <br />

    <Grid container className={classes.grid} spacing={4}>
      {card}
    </Grid>
    </>
  );

};


export default VenuesList;