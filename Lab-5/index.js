const { ApolloServer, gql } = require("apollo-server");
const redis = require('redis');
const axios = require("axios");
const { v4: uuidv4 } = require('uuid');
const { promisify } = require('util');

const redisClient = redis.createClient({
  legacyMode: true,
  host: 'localhost',
  port: 6379
})
redisClient.connect().then(() => {});

const hgetallAsync = promisify(redisClient.hGetAll).bind(redisClient);

const typeDefs = gql`
  type Location {
    id: ID!
    image: String!
    name: String!
    address: String
    userPosted: Boolean!
    liked: Boolean!
  }

  type Query {
    locationPosts(pageNum: Int): [Location]
    likedLocations: [Location]
    userPostedLocations: [Location]
  }

  type Mutation {
    uploadLocation(image: String!, address: String, name: String): Location
    updateLocation(id: ID!, image: String, name: String, address: String, userPosted: Boolean, liked: Boolean): Location
    deleteLocation(id: ID!): Location
  }
`;

const resolvers = {
  Query: {
    locationPosts: async (_, args) => {  
      const checkdata = await redisClient.EXISTS("AllPlacesfromAPI")
      console.log(checkdata)
      if(checkdata) {
        const allLocations = await redisClient.GET("AllPlacesfromAPI")
        console.log(JSON.parse(allLocations))
        return JSON.parse(allLocations)
      } else {
        let allposts = [];
          let postdata = {};
          const configure = {
            method: 'GET',
            headers: {
              Accept: 'application/json',
              Authorization: 'fsq35dzcGcmdnZBt+cEfWUYRM73jjARvDNWN72h0sq3Cvy4='
            }
          };

          //optional to add ?limit=50
          const {data, headers} = await axios.get("https://api.foursquare.com/v3/places/search?limit=50", configure);
          console.log(headers)
          //page = args.pageNum
          //console.log(data.results)
          for (let post of data.results) {
              postdata = {};
              postdata.id = post.fsq_id
              let imgdata = await axios.get(`https://api.foursquare.com/v3/places/${postdata.id}/photos`, configure)
              //console.log(imgdata.data[0].prefix)
              if(imgdata.data.length !== 0) {
                 postdata.image = imgdata.data[0].prefix + "original" + imgdata.data[0].suffix
               } else {
                 postdata.image = false
              }
              //console.log(postdata.image)
              postdata.name = post.name
              postdata.address = post.location.formatted_address
              postdata.userPosted = false
              postdata.liked = false
              allposts.push(postdata)
          }
          //console.log(allposts)
          await redisClient.SET("AllPlacesfromAPI", JSON.stringify(allposts))
          return allposts
      }
    },
    likedLocations: async (_, args) => {
      let likedlocationlist = []
      const location = await new Promise((resolve, reject) =>{
        redisClient.HGETALL('LikedPlaces', (err, location) => {
          if(err){
            throw err
          }else{
            resolve(location)
          }
        })
      });

      for(let key in location){
        let jsondata = JSON.parse(location[key])
        likedlocationlist.push(jsondata)
      }
      return likedlocationlist
    },
    userPostedLocations: async (_, args) => {
      let userLocationList = []
      const location = await new Promise((resolve, reject) =>{
        redisClient.HGETALL('UserPostedPlaces', (err, location) => {
          if(err){
            throw err
          }else{
            resolve(location)
          }
        })
      });

      for(let key in location){
        let jsondata = JSON.parse(location[key])
        userLocationList.push(jsondata)
      }
      return userLocationList
    },
  },
  Mutation: {
    uploadLocation: async (_, args) => {
      const newId = uuidv4();
      const location = {
        id: newId,
        image: args.image,
        name: args.name,
        address: args.address,
        userPosted: true,
        liked: false,
      };
      await redisClient.HSET("UserPostedPlaces", newId, JSON.stringify(location))
      await redisClient.SET(newId, JSON.stringify(location));
      return location;
    },
    updateLocation: async (_, args) => {
      console.log(args)
        const updatedLocation = {
          id: args.id, 
          image: args.image, 
          name: args.name, 
          address: args.address, 
          liked: args.liked, 
          userPosted: args.userPosted
        };
        redisClient.EXISTS("LikedPlaces", function(err, reply){
          if(err){
            throw err
          } else if(reply===1){
            redisClient.HEXISTS("LikedPlaces", args.id, function(err, location){
              if (err){
                throw err
              } else if(location === 1){
                redisClient.HDEL("LikedPlaces", args.id, (err, result) => {
                  if(err) throw err;
                });
              } else{
                redisClient.HSET("LikedPlaces", args.id, JSON.stringify(updatedLocation), (err, result) => {
                  if (err)  throw err;
                });
              }
            })
          } else {
            redisClient.HSET("LikedPlaces", args.id, JSON.stringify(updatedLocation))
          }
        })
        await redisClient.SET(args.id, JSON.stringify(updatedLocation));
        return updatedLocation;
    },
    deleteLocation: async (_, args) => {
      console.log(args.id);
      const location = await new Promise((resolve, reject) => {
        redisClient.GET(args.id, (err, location) => {
          if (err) {
            reject(`Location with ID ${args.id} does not exist`);
          } else {
            resolve(location);
          }
        });
      });
      console.log(location);
      const redisData = JSON.parse(location);
      console.log(redisData)
      if (redisData.liked) {
        redisClient.HDEL('LikedPlaces', args.id);
      }
      if (redisData.userPosted) {
        redisClient.HDEL('UserPostedPlaces', args.id);
      }
      await redisClient.DEL(args.id);
      return location;
    }
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`);
});
