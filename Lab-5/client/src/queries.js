import { gql } from '@apollo/client';

const LOCATION_POSTS = gql`
    query locationPosts($pageNum: Int) {
        locationPosts(pageNum: $pageNum) {
            id
            image
            name
            address
            userPosted
            liked
        }
    }
`;

const LIKED_LOCATIONS = gql`
    query likedLocations {
        likedLocations {
            id
            image
            name
            address
            userPosted
            liked
        }
    }
`;

const USER_POSTED_LOCATIONS = gql`
    query userPostedLocations {
        userPostedLocations {
            id
            image
            name
            address
            userPosted
            liked
        }
    }
`;

const UPLOAD_LOCATION = gql`
    mutation uploadLocation($image: String!, $address: String!, $name: String!) {
        uploadLocation(image: $image, address: $address, name: $name) {
            id
            image
            name
            address
            userPosted
            liked
        }
    }
`;

const UPDATE_LOCATION = gql `
    mutation updateLocation(
        $id: ID!
        $image: String
        $name: String
        $address: String
        $userPosted: Boolean
        $liked: Boolean
    ) {
        updateLocation (
            id: $id
            image: $image
            name: $name
            address: $address
            userPosted: $userPosted
            liked: $liked
        ) {
            id
            image
            name
            address
            userPosted
            liked
        }
    }
`;

const DELETE_LOCATION = gql`
    mutation deleteLocation($id:ID!) {
        deleteLocation(id: $id) {
            id
            image
            name
            address
            userPosted
            liked
        }
    }
`;



let exported = {
    LOCATION_POSTS, 
    LIKED_LOCATIONS, 
    USER_POSTED_LOCATIONS, 
    UPDATE_LOCATION, 
    UPLOAD_LOCATION, 
    DELETE_LOCATION
}


export default exported;
