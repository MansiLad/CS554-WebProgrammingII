import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@apollo/client";
import queries from "../queries";
import validator from "validator";

import {
  Grid,
  TextField ,
  Button
} from '@material-ui/core';

const defaultFormFields = {
  image: '',
  name: '',
  address: '',
}


const UploadPlace = () => {
    const [addNewPlace] = useMutation(queries.UPLOAD_LOCATION);
    const navigate = useNavigate();
   
    const [formfields, setFormfields] = useState(defaultFormFields)
    const { image, name, address } = formfields;
    const inputStyle = { borderColor: 'white', color: 'white' };

    const handleChange = (event) => {
      const {name, value} = event.target;      
      setFormfields({...formfields, [name]: value});
    }

    const handleOnSubmit = (event) => {
      event.preventDefault();
      if(validator.isURL(image)) {
          addNewPlace({
              variables: {
                  image: image,
                  name: name,
                  address: address
              }
          })  
          navigate('/my-places');
      } else {
          alert('Url is not valid');
      }
  }
  
    return (
      <div>
        <form onSubmit={handleOnSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
            <TextField
              type="text"
              fullWidth
              className="form-control"
              id="image"
              name="image"
              required
              variant="outlined"
              label="Enter Image URL"
              inputProps={{ style: inputStyle }}
              InputLabelProps={{ style: { color: 'white' } }}
              style={{ width: "300%" }}
              onChange={handleChange}
              value={image}
            />
            </Grid>
          </Grid>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
            <TextField
              type="text"
              className="form-control"
              id="name"
              name="name"
              required
              label="Enter Name"
              inputProps={{ style: inputStyle }}
              InputLabelProps={{ style: { color: 'white' } }}
              variant="outlined"
              style={{ width: "300%" }}
              onChange={handleChange}
              value={name}
            />
            </Grid>
          </Grid>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
            <TextField
              type="text"
              className="form-control"
              fullWidth
              id="address"
              name="address"
              required
              label="Enter Address"
              inputProps={{ style: inputStyle }}
              InputLabelProps={{ style: { color: 'white' } }}
              variant="outlined"
              style={{ width: "300%" }}
              onChange={handleChange}
              value={address}
            />
            </Grid>
          </Grid>
          <br/>
          <Button variant="contained" type="submit">
            Add Place
          </Button>
        </form>
      </div>
    );
  };

export default UploadPlace;