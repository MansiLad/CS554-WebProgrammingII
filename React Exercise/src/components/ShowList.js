import React, {useState, useEffect} from 'react';
import axios from 'axios';
import {Link, useParams} from 'react-router-dom';
import SearchShows from './SearchShows';
import noImage from '../img/download.jpeg';
import {
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Grid,
  Typography,
  makeStyles,
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
const ShowList = () => {
  const regex = /(<([^>]+)>)/gi;
  const classes = useStyles();
  const [loading, setLoading] = useState(true);
  const [searchData, setSearchData] = useState(undefined);
  const [showsData, setShowsData] = useState(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  let card = null;

  let [page, setPage] = useState(0);
  let [shows, setShows] = useState([]);

  let {pageNum} = useParams();
  console.log("page")
/*   console.log(pageNum)
  if (isNaN(pageNum)){  
    pageNum = 0
  } else {
    pageNum = Number(pageNum)
  }
 */
  page = isNaN(pageNum) ? 0 : Number(pageNum) 
  console.log(pageNum)


  useEffect(() => {
    console.log('on load useeffect');
    async function fetchData() {
      try {
        const {data} = await axios.get('http://api.tvmaze.com/shows');
        setShowsData(data);
        setLoading(false);
      } catch (e) {
        console.log(e);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    console.log('search useEffect fired');
    async function fetchData() {
      try {
        console.log(`in fetch searchTerm: ${searchTerm}`);
        const {data} = await axios.get(
          'http://api.tvmaze.com/search/shows?q=' + searchTerm
        );
        setSearchData(data);
        setLoading(false);
      } catch (e) {
        console.log(e);
      }
    }
    if (searchTerm) {
      console.log('searchTerm is set');
      fetchData();
    }
  }, [searchTerm]);

  //console.log(page)

  useEffect(() => {
    async function fetchShows() {
      try {
        let res = await fetch(`http://api.tvmaze.com/shows?page=${page}`);
        const data = await res.json();
        setShowsData(data);
        //setLoading(false);
        console.log(data)
      } catch (e) {
        console.log(e)
      }
    }
    fetchShows();
    //setPage(parseInt(pageNum));
  }, [page]);

  const prevPage = () => {
    if (page > 0) {
      setPage(page - 1);
    }
    if(page <= 0){
      setPage(0)
    }
  };

  const nextPage = () => {
    setPage(page + 1);
  };

  const searchValue = async (value) => {
    setSearchTerm(value);
  };
  const buildCard = (show) => {
    return (
      <Grid item xs={12} sm={6} md={4} lg={3} xl={2} key={show.id}>
        <Card className={classes.card} variant='outlined'>
          <CardActionArea>
            <Link to={`/shows/${show.id}`}>
              <CardMedia
                className={classes.media}
                component='img'
                image={
                  show.image && show.image.original
                    ? show.image.original
                    : noImage
                }
                title='show image'
              />

              <CardContent>
                <Typography
                  className={classes.titleHead}
                  gutterBottom
                  variant='h6'
                  component='h3'
                >
                  {show.name}
                </Typography>
                <Typography variant='body2' color='textSecondary' component='p'>
                  {show.summary
                    ? show.summary.replace(regex, '').substring(0, 139) + '...'
                    : 'No Summary'}
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
      searchData.map((shows) => {
        let {show} = shows;
        return buildCard(show);
      });
  } else {
    card =
    showsData &&
    showsData.map((show) => {
        return buildCard(show);
      });
  }

  if (loading) {
    return (
      <div>
        <h2>Loading....</h2>
      </div>
    );
  } else {
    return (
      <div>
        <SearchShows searchValue={searchValue} />
        <br />

{/*         <button class="btnclass">
            <Link to={`/shows/page/${page - 1}`} onClick={prevPage}>
              Previous{""}
            </Link>
        </button>
        
        <button class="btnclass">
            <Link to={`/shows/page/${page + 1}`} onClick={nextPage}>
              Next{""}
            </Link>
        </button> */}

      <div>
        
        
          <> <button>
              <Link to={`/shows/page/${page - 1}`} onClick={prevPage}>Previous{""}</Link>
            </button><span> Page {page + 1} </span><button>
                <Link to={`/shows/page/${page + 1}`} onClick={nextPage}>Next{""}</Link>
              </button></>
        
      </div>
      <br />
        <Grid container className={classes.grid} spacing={5}>
          {card}
        </Grid>
      </div>
    );
  }
};

export default ShowList;
