import Head from "next/head";
import Image from "next/image";
import Link from 'next/link'
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
  const [listRender, setListRender] = useState<any>([]);
  const [pageToLoad, setPageLoad] = useState(1);
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

  const getCuratedListRestaurant = () => {
    if(currentCoordinate !== null){
      listRestaurant.forEach(function (restaurant:any) {
        const distance = Math.round(HaversineDistance(currentCoordinate[1], currentCoordinate[0], restaurant.properties.Latitude.number, restaurant.properties.Longitude.number));
        restaurant.distance = distance;
      });
      listRestaurant.sort(function(a:any, b:any) {
        return a.distance - b.distance;
      });
      setListRestaurant([...listRestaurant]);
      setInitialLoadDone(true);
    }
  };

  useEffect(() => {
    getLocation();
    console.log(posts);
  }, []);

  useEffect(() => {
    console.log(listRender);
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
        // create a HTML element for each feature
        const el = document.createElement('div');
        el.className = 'marker';
        const markerCoordinate = [item.properties.Longitude.number, item.properties.Latitude.number];
        // make a marker for each feature and add to the map

        // @ts-ignore
        new mapboxgl.Marker(el).setLngLat(markerCoordinate).addTo(map.current);
      }
    }
  }, [listRender]);

  useEffect(() => {
    console.log("masuk");
    console.log(listRestaurant);
    if(initialLoadDone){
      if(listRestaurant.length > 0){
        const newList: any[] = [];
        for (var i = 0; i < 10; i++){
          newList.push(listRestaurant[i]);
        }
        setListRender((prevState: any) => [...prevState, ...newList]);
      }
    }
  }, [initialLoadDone]);

  useEffect(() => {
    if (currentCoordinate !== null) {
      getCuratedListRestaurant();

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

  const getPathUrl = (url:String) => {
    const splitUrl =  url.split('/');
    return splitUrl[splitUrl.length - 1];

  }

  return (
    <div className={styles.container}>
      <Head>
        <title>HalalKompass - Find Halal Venue</title>
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
        <meta name="description" content="Generated by create next app" />
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
          <div className={styles.locationCity}>Jakarta</div>
          <div className={styles.locationCountry}>Indonesia</div>
          <div className={styles.iconDropdown}></div>
        </div>
        <div className={styles.searchbox}>
          <input type="text" placeholder="Search halal restaurants" />
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
                        <div className={styles.distance}>
                          {currentCoordinate !== null

                            ? `${(Math.round(
                                HaversineDistance(
                                  currentCoordinate[1],
                                  currentCoordinate[0],
                                  posts.properties.Latitude.number,
                                  posts.properties.Longitude.number
                                )*10
                              )/10).toFixed(1)} km`
                            : "Calculating..."}
                        </div>
                        <div className={styles.city}>{posts.properties.City.rich_text[0].plain_text}, {posts.properties.Province.rich_text[0].plain_text}</div>
                      </div>
                    </div>
                  </div>
            </div>
            </Link>
              ))}
        </div>
      </main>
    </div>
  );
}

export async function getStaticProps() {
  const database = await getAllDatabase(databaseId);

  // Pass data to the page via props
  return { props: { posts: database } }
}
