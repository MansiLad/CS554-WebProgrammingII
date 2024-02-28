const { ApolloServer, gql } = require("apollo-server");
const redis = require('redis');
const axios = require("axios");

const redisClient = redis.createClient(6379);

(async () => {
  await redisClient.connect();
})();

const md5 = require('blueimp-md5');
const publickey = 'f9d0efdacefda4cd53dd4b476b852caf';
const privatekey = 'b849f458e7ec9ca3627b6f9a277b52ac7fd36f56';
const ts = new Date().getTime();
const stringToHash = ts + privatekey + publickey;
const hash = md5(stringToHash);
const baseUrl = 'https://gateway.marvel.com:443/v1/public/characters';
const url = baseUrl + '?ts=' + ts + '&apikey=' + publickey + '&hash=' + hash;

const typeDefs = gql`
  type Character {
    id: Int
    image: String!
    name: String!
    description: String
    comics: [Comics]
    series: [Series]
    stories: [Stories]
    events: [Events]
  }

  type CharacterList {
    count: Int
    characterList: [Character]
  }

  type Comics {
    name: String
    url: String
  }

  type Series {
    name: String
    url: String
  }

  type Stories {
    name: String
    url: String
  }

  type Events {
    name: String
    url: String
  }

  type Query {
    characterList(offset: Int): CharacterList
    characterbyID(id: Int!): Character
    collectorsList: [Character]
    searchCharacter(keyword: String): CharacterList
  }

`;

const resolvers = {
  Query: {
    characterList: async (_, args) => {
      let finaldata = {}
      let charListfromRedis = {}
      let pageNum = args.offset/20

      console.log(args)

      console.log("Page ", pageNum)

      pageNum = parseInt(typeof pageNum === "undefined" ? 0 : pageNum)

      charListfromRedis = await redisClient.GET("CharactersListPage-" + pageNum)
      if(charListfromRedis){
        console.log("Character List from redis")
        const redisData = JSON.parse(charListfromRedis)
        return redisData
      }
      const { data } = await axios.get(url + "&offset=" + pageNum * 20)
      finaldata.count = data.data.count
      let allCharacters = []
      for(let character of data.data.results) {
        let charData = {};
        charData.id = character.id
        charData.name = character.name
        charData.description = character.description
        charData.image = character.thumbnail.path + "." + character.thumbnail.extension

        let comics = []
        for (let comic of character.comics.items) {
          let comicdetail = {}
          comicdetail.url = comic.resourceURI
          comicdetail.name = comic.name
          comics.push(comicdetail)
        }
        charData.comics = comics
        
        let series = []
        for (let ser of character.series.items) {
          let serdetail = {}
          serdetail.url = ser.resourceURI
          serdetail.name = ser.name
          series.push(serdetail)
        }
        charData.series = series

        let stories = []
        for (let story of character.stories.items) {
          let storydetail = {}
          storydetail.url = story.resourceURI
          storydetail.name = story.name
          stories.push(storydetail)
          }
        charData.stories = stories

        let events = []
        for (let event of character.events.items) {
          let eventdetail = {}
          eventdetail.url = event.resourceURI
          eventdetail.name = event.name
          events.push(eventdetail)
        }
        charData.events = events
        allCharacters.push(charData)
      }
      console.log("Saving data in Redis!")
      
      finaldata.characterList = allCharacters
      await redisClient.SET("CharactersListPage-"+pageNum, JSON.stringify(finaldata))
      return finaldata
    }, 
    characterbyID: async (_, args) => {
      const id = args.id
      let singlecharfromRedis = {}

      singlecharfromRedis = await redisClient.GET("characterId-" + id)
      if(singlecharfromRedis){
        console.log("Fetching Single Character data from redis")
        let redisData = JSON.parse(singlecharfromRedis)
        return redisData
      }

      const { data } = await axios.get(url + "&id=" + id)

      let finaldata = []
      let singleCharacter = {}
      singleCharacter.id = id
      singleCharacter.name = data.data.results[0].name
      singleCharacter.description = data.data.results[0].description
      singleCharacter.image = data.data.results[0].thumbnail.path + "." + data.data.results[0].thumbnail.extension

      let comics = []
      for (let comic of data.data.results[0].comics.items) {
        let comicdetail = {}
        comicdetail.url = comic.resourceURI
        comicdetail.name = comic.name
        comics.push(comicdetail)
      }
      singleCharacter.comics = comics

      let series = []
      for (let ser of data.data.results[0].series.items) {
        let serdetail = {}
        serdetail.url = ser.resourceURI
        serdetail.name = ser.name
        series.push(serdetail)
      }
      singleCharacter.series = series

      let stories = []
      for (let story of data.data.results[0].stories.items) {
        let storydetail = {}
        storydetail.url = story.resourceURI
        storydetail.name = story.name
        stories.push(storydetail)
      }
      singleCharacter.stories = stories

      let events = []
      for (let event of data.data.results[0].events.items) {
        let eventdetail = {}
        eventdetail.url = event.resourceURI
        eventdetail.name = event.name
        events.push(eventdetail)
      }
      singleCharacter.events = events
      console.log("Saving Single Character in Redis")
      await redisClient.SET("characterId-" + id, JSON.stringify(singleCharacter));
      return singleCharacter
    },
    searchCharacter: async(_, args) => {
      let finaldata ={}

      let word = args.keyword

      const { data } = await axios.get(url + "&nameStartsWith=" + word)
      //console.log(data.data.results)

      finaldata.count = data.data.count
      let allCharacters = []
      for(let character of data.data.results) {
        let charData = {};
        charData.id = character.id
        charData.name = character.name
        charData.description = character.description
        charData.image = character.thumbnail.path + "." + character.thumbnail.extension

        let comics = []
        for (let comic of character.comics.items) {
          let comicdetail = {}
          comicdetail.url = comic.resourceURI
          comicdetail.name = comic.name
          comics.push(comicdetail)
        }
        charData.comics = comics
        
        let series = []
        for (let ser of character.series.items) {
          let serdetail = {}
          serdetail.url = ser.resourceURI
          serdetail.name = ser.name
          series.push(serdetail)
        }
        charData.series = series

        let stories = []
        for (let story of character.stories.items) {
          let storydetail = {}
          storydetail.url = story.resourceURI
          storydetail.name = story.name
          stories.push(storydetail)
          }
        charData.stories = stories

        let events = []
        for (let event of character.events.items) {
          let eventdetail = {}
          eventdetail.url = event.resourceURI
          eventdetail.name = event.name
          events.push(eventdetail)
        }
        charData.events = events
        allCharacters.push(charData)
      }
      finaldata.characterList = allCharacters
      console.log(finaldata)
      return finaldata
    }
  },
    
}

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`);
});

; 