import Head from "next/head";
import Image from "next/image";
import Link from 'next/link';
import Script from 'next/script';
import mapboxgl, { Map } from "mapbox-gl";
import styles from "../styles/Home.module.css";
import {getDatabase, getAllDatabase, getData} from "../lib/notion";
import React, { useRef, useState, useEffect } from "react";
import placeholderThumbnail from "../public/images/placeholder-restaurant.png";

mapboxgl.accessToken =
  "pk.eyJ1IjoiYmFib25vIiwiYSI6ImNrdW1zeWEwdTN0eG8yd284dmhwOWM0eGIifQ.bzL5KhWkOBuYEX0GZepfEw";

export const databaseId = process.env.NOTION_DATABASE_ID;

const defaultPost = {
  object: "page",
  id: "0bad7dcd-c3c4-421f-b51a-3eadd58d3655",
  created_time: "2021-09-20T14:05:00.000Z",
  last_edited_time: "2021-10-03T08:00:00.000Z",
  cover: null,
  icon: null,
  parent: {
    type: "database_id",
    database_id: "05844613-55ae-4bde-b645-849072603a75",
  },
  archived: false,
  properties: {
    Longitude: {
      number: 0,
    },
    Category: "wow",
    Latitude: {
      number: 0,
    },
    Thumbnail: [Object],
    Column: [Object],
    "﻿Name": [Object],
  },
  url: "https://www.notion.so/D-Crepes-Mall-Taman-Anggrek-0bad7dcdc3c4421fb51a3eadd58d3655",
};

// @ts-ignore
export default function Home({ posts }: { posts: any } = defaultPost) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<Map | null>(null);
  const [currentCoordinate, setCurrentCoordinate] = useState<any>(null);
  const [listRestaurant, setListRestaurant] = useState<any>(posts);
  const [sortedRestaurants, setSortedRestaurants] = useState<any>([]);
  const [searchResult, setSearchResult] = useState<any>([]);
  const [listRender, setListRender] = useState<any>([]);
  const [pageToLoad, setPageToLoad] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [inputSearch, setInputSearch] = useState("");
  const [currentRegion, setCurrentRegion] = useState("");
  const [hasMore, setHasMore] = useState(true);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [zoom, setZoom] = useState(14);

  mapboxgl.accessToken =
    "pk.eyJ1IjoiYmFib25vIiwiYSI6ImNrdW1zeWEwdTN0eG8yd284dmhwOWM0eGIifQ.bzL5KhWkOBuYEX0GZepfEw";

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position: GeolocationPosition) => {
          var crd = position.coords;
          setCurrentCoordinate([crd.longitude, crd.latitude]);
        }
      );
    } else {
      console.log("Geolocation is not supported by this browser.");
    }
  };

  const getNextRestaurantList = () => {
    if(sortedRestaurants.length > 0 && isLoading){
      console.log("cuy");
      console.log(sortedRestaurants);
      const newList: any[] = [];
      for (let i = 10*(pageToLoad-1); i < 10*pageToLoad; i++){
        newList.push(sortedRestaurants[i]);
      }
      setListRender((prevState: any) => [...prevState, ...newList]);
      setPageToLoad(pageToLoad + 1);
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (!isLoading) return;
    getNextRestaurantList();
  }, [isLoading]);

  const getCuratedListRestaurant = () => {
    if(currentCoordinate !== null){
      let copyList = [...listRestaurant];
      copyList.forEach(function (restaurant:any) {
        const distance = (Math.round(
            HaversineDistance(
                currentCoordinate[1],
                currentCoordinate[0],
                restaurant.properties.Latitude.number,
                restaurant.properties.Longitude.number
            )*10
        )/10).toFixed(1);
        restaurant.distance = distance;
      });
      copyList.sort(function(a:any, b:any) {
        return a.distance - b.distance;
      });
      setSortedRestaurants([...copyList]);
      setInitialLoadDone(true);
    }
  };

  useEffect(() => {
    getLocation();
  }, []);

  useEffect(() => {
    console.log(sortedRestaurants);
  }, [sortedRestaurants]);

  useEffect(() => {
    if(listRender.length > 0){
      if (map.current) return; // initialize map only once
      map.current = new mapboxgl.Map({
        container: mapContainer.current!,
        style: "mapbox://styles/mapbox/streets-v11",
        center: currentCoordinate,
        zoom: zoom,
      });
      const marker = new mapboxgl.Marker()
          .setLngLat(currentCoordinate)
          .addTo(map.current);

      // add markers to map
      for (const item of listRender) {
        const ctaURL = '/resto/' + item.url.split("/").pop();
        // create a HTML element for each feature
        const el = document.createElement('div');
        el.className = 'marker';
        const markerCoordinate = [item.properties.Longitude.number, item.properties.Latitude.number];
        // make a marker for each feature and add to the map

        // @ts-ignore
        new mapboxgl.Marker(el).setLngLat(markerCoordinate).setPopup(
            new mapboxgl.Popup({ offset: 25 }) // add popups
                .setHTML(
                    `<div class="popupMapTitle">${item.properties.Name.title[0].plain_text}</div><a href=${ctaURL} class="popupMapCTA"></a>`
                )
        ).addTo(map.current);
      }
    }
  }, [listRender]);

  useEffect(() => {
    if(initialLoadDone){
      if(sortedRestaurants.length > 0){
        const newList: any[] = [];
        for (var i = 0; i < 15; i++){
          newList.push(sortedRestaurants[i]);
        }
        setListRender((prevState: any) => [...prevState, ...newList]);
        setPageToLoad(2);
      }
    }
  }, [initialLoadDone]);

  const getCurrentCityCountry = () => {
    fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${currentCoordinate[0]},${currentCoordinate[1]}.json?types=place&access_token=${mapboxgl.accessToken}`)
        .then((response) => response.json())
        .then((data) => {
          const placeArray = data.features[0].place_name.split(',');
          console.log(placeArray);
          setCurrentRegion(`${placeArray[0].trim()}, ${placeArray[2].trim()}`);
        });
  }

  useEffect(() => {
    if (currentCoordinate !== null) {
      getCuratedListRestaurant();
      getCurrentCityCountry();
    }
  }, [currentCoordinate]);

  const HaversineDistance = (
    lat1: number,
    long1: number,
    lat2: number,
    long2: number
  ) => {
    var R = 6371; // Radius of the Earth in miles
    var rlat1 = lat1 * (Math.PI / 180); // Convert degrees to radians
    var rlat2 = lat2 * (Math.PI / 180); // Convert degrees to radians
    var difflat = rlat2 - rlat1; // Radian difference (latitudes)
    var difflon = (long2 - long1) * (Math.PI / 180); // Radian difference (longitudes)

    var d =
      2 *
      R *
      Math.asin(
        Math.sqrt(
          Math.sin(difflat / 2) * Math.sin(difflat / 2) +
            Math.cos(rlat1) *
              Math.cos(rlat2) *
              Math.sin(difflon / 2) *
              Math.sin(difflon / 2)
        )
      );

    return d;
  };

  const handleSearch = (e: { target: { value: any; }; }) => {
    const input = e.target.value;
    setInputSearch(input);
    const data = sortedRestaurants;
    console.log(data.length);
    const regex = new RegExp('\\b' + input, 'i');
    setSearchResult(data.filter((item:any) => item.properties["Name"].title[0].plain_text.toLowerCase().match(regex)));

  }

  useEffect(() => {
    if(inputSearch !== ""){
      setIsSearching(true);
    }
    else{
      setIsSearching(false);
    }
  }, [inputSearch]);

  const resetSearchbar = () => {
    setInputSearch("");
    setIsSearching(false);
  }

  useEffect(() => {
    if(isSearching){
      document.body.style.overflow = 'hidden';
    }
    else{
      document.body.style.overflow = 'unset';
    }
  }, [isSearching]);



  const getPathUrl = (url:String) => {
    const splitUrl =  url.split('/');
    return splitUrl[splitUrl.length - 1];
  }

  const handleScroll = () => {

    const bottom = Math.ceil(window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight

    if (bottom) {
      console.log('at the bottom');
      setIsLoading(true);
    }
  };

  const highlightSearch = (text:String) => {
    //const startIndex = text.indexOf(inputSearch);
    const searchTextRegExp = new RegExp(inputSearch , "i");
    //const inputLength = inputSearch.length;
    return text.replace(searchTextRegExp , '<strong>$&</strong>');
  }

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, {
      passive: true
    });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const atOptions = {
    'key' : '0cc0eb3ff40fbc913410ef3eff2cdbac',
    'format' : 'iframe',
    'height' : 50,
    'width' : 320,
    'params' : {}
  };

  const searchResultComponent =
      searchResult.length
          ? searchResult.map((item:any) => {
            return (
                <Link href={'/resto/' + getPathUrl(item.url)} key={item.id} >
                  <div className={styles.searchResultItem}>
                    <div className={styles.searchResultItemInfo}>
                      <div className={styles.searchResultItemTitle} dangerouslySetInnerHTML={{
                        __html: highlightSearch(item.properties["Name"].title[0].plain_text)
                      }} />
                      <div className={styles.searchResultItemLocation}>{item.properties.City.rich_text[0].plain_text}, {item.properties.Province.rich_text[0].plain_text}</div>
                    </div>
                    <div className={styles.searchResultItemDistance}>{item.distance + ' km'}</div>
                  </div>
                </Link>
            );
          })
          : "";


  return (
    <div className={styles.container} >
      <Head>
        <title>HalalKompass - Find Halal Venues Near You</title>
        <meta property="og:site_name" content="HalalKompass - Find Halal Venues Near You" />
        <meta property="og:title" content="HalalKompass - Find Halal Venues Near You" />
        <meta property="og:description" content="Enjoy meals worry-free at halal venues verified for you" />
        <meta name="description" content="Enjoy meals worry-free at halal venues verified for you" />
        <meta property="og:image" content="https://res.cloudinary.com/babono/image/upload/v1659969611/halal-kompass/og-image-square_aeon5h.jpg" />
        <meta property="og:image:secure_url" itemProp="image" content="https://res.cloudinary.com/babono/image/upload/v1659969611/halal-kompass/og-image-square_aeon5h.jpg" />
        <meta property="og:type" content="website" />
        <meta name="viewport" content="width=device-width, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <script
          async
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS}`}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS}', {
            page_path: window.location.pathname,
          });
        `,
          }}
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.header}>
        <div className={styles.headerContainer}>
          <Image
            src="/images/logo-halalcompass.svg"
            height={32}
            width={154}
            alt="halal compass"
          />
        </div>
        <div className={styles.location}>
          <div className={styles.iconMap}></div>
          <div className={styles.locationCity}>{currentRegion}</div>
          <div className={styles.iconDropdown}></div>
        </div>
        {isSearching && (<div className={styles.overlay}></div>)}
        <div className={styles.searchbox}>
          <input type="text" value={inputSearch} placeholder="Search halal restaurants" onChange={handleSearch} />
          {isSearching && (<div className={styles.searchReset} onClick={() => resetSearchbar()}>
            <Image
                src="/images/ic-close.svg"
                height={24}
                width={24}
            />
          </div>)}
          {isSearching && inputSearch.length > 2? (
                <div className={styles.searchResult}>{searchResultComponent}</div>
          ) : null}

        </div>
      </div>
      <main className={styles.main}>
        <div ref={mapContainer} className="map-container" />
        <div className={styles.bottomSheet}>
          <div className={styles.bottomSheetTitle}>All Restaurant</div>
          {listRender.map((posts: any, index: number) => (
              <Link href={'/resto/' + getPathUrl(posts.url)} key={index}>
                <div className={styles.itemLink}>
                  <div className={styles.item} key={index}>
                    <div className={styles.thumbnail}>
                      <div className={styles.thumbnailImage}>
                        {posts.properties && posts.properties.Thumbnail.files[0]?.file ? (
                          <Image
                            width={100}
                            height={100}
                            alt="thumbnail"
                            src={posts.properties.Thumbnail.files[0]?.file.url}
                          />
                        ) : (
                          <Image
                            width={100}
                            height={100}
                            alt="thumbnail placeholder"
                            src={placeholderThumbnail}
                          />
                        )}
                      </div>
                    </div>
                    <div className={styles.details}>
                      <div className={styles.category}>{posts.properties.Category.select.name}</div>
                      <div className={styles.name}>
                        {posts.properties["Name"].title[0].plain_text}
                      </div>
                      <div className={styles.loc}>
                        <div className={styles.distance}>{posts.distance + ' km'}</div>
                        <div className={styles.city}>{posts.properties.City.rich_text[0].plain_text}, {posts.properties.Province.rich_text[0].plain_text}</div>
                      </div>
                    </div>
                  </div>
            </div>
            </Link>
              ))}
        </div>
      </main>
      <Script src="https://www.highperformancedisplayformat.com/0cc0eb3ff40fbc913410ef3eff2cdbac/invoke.js"/>
    </div>
  );
}

export async function getStaticProps() {
  const database = await getAllDatabase(databaseId);

  // Pass data to the page via props
  return { props: { posts: database } }
}
