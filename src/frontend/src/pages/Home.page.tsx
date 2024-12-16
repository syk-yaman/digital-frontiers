import { HeaderMegaMenu } from '@/components/Header/HeaderMegaMenu';
import { ColorSchemeToggle } from '../components/ColorSchemeToggle/ColorSchemeToggle';
import { Welcome } from '../components/Welcome/Welcome';
import { FooterLinks } from '@/components/Footer/FooterLinks';
import { Carousel } from '@mantine/carousel';
import '@mantine/carousel/styles.css';
import { Image } from '@mantine/core';

import React from 'react';
import DeckGL from '@deck.gl/react';
import { DeckProps, MapViewState } from '@deck.gl/core';
import { LineLayer, ScatterplotLayer } from '@deck.gl/layers';

import { BASEMAP } from '@deck.gl/carto';
import { Map, useControl } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';

import '../style.css'
// ✅ Types are available here
import { FeaturesGrid } from '@/components/FeaturesGrid/FeaturesGrid';
import { MapboxOverlay } from '@deck.gl/mapbox';

const INITIAL_VIEW_STATE: MapViewState = {
  longitude: -122.41669,
  latitude: 37.7853,
  zoom: 13
};

type DataType = {
  from: [longitude: number, latitude: number];
  to: [longitude: number, latitude: number];
};

function DeckGLOverlay(props: DeckProps) {
  const overlay = useControl<MapboxOverlay>(() => new MapboxOverlay(props));
  overlay.setProps(props);
  return null;
}


export function HomePage() {
  // const layers = [

  //   new Map({
  //     container: 'map',
  //     style: BASEMAP.POSITRON,
  //     interactive: true,
  //     center:[-0.12262486445294093,51.50756471490389],
  //     zoom: 12
  //   })
  // ];

  const layers = [
    new ScatterplotLayer({
      id: 'deckgl-circle',
      data: [
        { position: [0.45, 51.47] }
      ],
      getPosition: d => d.position,
      getFillColor: [255, 0, 0, 100],
      getRadius: 1000,
      beforeId: 'watername_ocean' // In interleaved mode render the layer under map labels
    })
  ];

  return (
    <>
      <HeaderMegaMenu />
      <Carousel withIndicators height={500}>
        <Carousel.Slide>
          <Image
            src="https://placehold.co/1600x500/d0d0d0/FFF?text=Placeholder"
          />
        </Carousel.Slide>
        <Carousel.Slide><Image
          src="https://placehold.co/1600x500/d0d0d0/FFF?text=Placeholder"
        /></Carousel.Slide>
        <Carousel.Slide><Image
          src="https://placehold.co/1600x500/d0d0d0/FFF?text=Placeholder"
        /></Carousel.Slide>
        {/* ...other slides */}
      </Carousel>
      <FeaturesGrid />
      <div
        style={{
          height: '500px', // Set height
          width: '800px',  // Set width
          border: '1px solid black',
          margin: '20px auto', // Center the div
          position: 'relative',
        }}
      >
        <Map
          initialViewState={{
            longitude: 0.45,
            latitude: 51.47,
            zoom: 11
          }}
          mapStyle={BASEMAP.DARK_MATTER}
        >
          <DeckGLOverlay layers={layers} overlaid />
        </Map>

      </div>

      <ColorSchemeToggle />

      <FooterLinks />
    </>
  );
}
