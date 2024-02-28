import React from 'react';
import './App.css';
import EventsList from './components/EventsList';
import AttractionsList from './components/AttractionsList';
import VenuesList from './components/VenuesList';
import Home from './components/Home';
import SingleEvent from './components/SingleEvent';
import SingleAttraction from './components/SingleAttraction';
import SingleVenue from './components/SingleVenue';
import NotFoundPage from './components/PagenotFound';
import { redirect } from 'react-router-dom';


import {BrowserRouter as Router, Route, Link, Routes} from 'react-router-dom';

const App = () => {
  return (
    <Router>
      <div className='App'>
        <header className='App-header'>
          <h1 className='App-title'>
            Welcome to the React.js Ticket Master API 
          </h1>
          <Link className='showlink' to='/'>
            Home
          </Link>

          <Link className='showlink' to='/events/page/1'> 
          Events
          </Link>

          <Link className='showlink' to='/attractions/page/1'> 
          Attractions
          </Link>

          <Link className='showlink' to='/venues/page/1'> 
          Venues
          </Link>
        </header>
        </div>
        <br />
        <div className='App-body'>
          <Routes>
            <Route path='/' element={<Home />} />
            
            <Route path='/events/page/:pageNum' element={<EventsList />} />
            <Route path='/events/:id' element={<SingleEvent/>} />

            <Route path='/attractions/page/:pageNum' element={< AttractionsList />} />
            <Route path='/attractions/:id' element={<SingleAttraction/>} />

            <Route path='/venues/page/:pageNum' element={<VenuesList />} />
            <Route path='/venues/:id' element={<SingleVenue/>} />

            <Route path="*" element = {<NotFoundPage/>} />
            <Route path="/404" element = {<NotFoundPage/>} />
            </Routes>
      </div>
    </Router>
  );
};

export default App;
