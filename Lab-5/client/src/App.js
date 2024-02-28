import "./App.css";
import React from 'react';
import { BrowserRouter as Router, Link, Route, Routes } from "react-router-dom";
import AllPlaces from "./components/AllPlaces";
import MyLikesPlaces from "./components/MyLikePlaces";
import MyPlaces from "./components/MyPlaces";
import UploadPlace from "./components/UploadPlace";
import { Button } from "@material-ui/core";
import {
  ApolloClient,
  HttpLink,
  InMemoryCache,
  ApolloProvider,
} from "@apollo/client";

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: new HttpLink({
    uri: "http://localhost:4000",
  }),
});

function App() {
  return (
    <ApolloProvider client={client}>
      <Router>
        <div className="App-header">
          <header className="App">
            <h1 className="App-title">BoreSquare</h1>
            <Button variant="contained" style={{ marginRight: '10px' }}>
              <Link className="showlink" to="/">
                All Places
              </Link>
            </Button>
            <Button variant="contained" style={{ marginRight: '10px' }}>
              <Link className="showlink" to="/my-likes">
                My Liked Places
              </Link>
            </Button>
            <Button variant="contained" style={{ marginRight: '10px' }}>
              <Link className="showlink" to="/my-locations">
                My Locations
              </Link>
            </Button>
            <Button variant="contained" style={{ marginRight: '10px' }}>
              <Link className="showlink" to="/new-location">
                Upload Location
              </Link> 
            </Button>
             
          </header> 
          <br/>
          <br/>
          <div className="App-body">
            <Routes>
              <Route exact path="/" element={<AllPlaces/>} />
              <Route path="/my-likes" element={<MyLikesPlaces/>} />
              <Route path="/my-locations" element={<MyPlaces/>} />
              <Route path="/new-location" element={<UploadPlace/>} />
            </Routes>
          </div>
        </div>
      </Router>
    </ApolloProvider>
  );
}

export default App;
