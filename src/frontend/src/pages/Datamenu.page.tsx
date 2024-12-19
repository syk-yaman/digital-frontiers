import { HeaderMegaMenu } from '@/components/Header/HeaderMegaMenu';
import { ColorSchemeToggle } from '../components/ColorSchemeToggle/ColorSchemeToggle';
import { Welcome } from '../components/Welcome/Welcome';
import { FooterLinks } from '@/components/Footer/FooterLinks';
import { Carousel } from '@mantine/carousel';
import '@mantine/carousel/styles.css';
import { Text, Anchor, Breadcrumbs, Image, Center, rem, SegmentedControl, Space, Avatar, Badge, Group } from '@mantine/core';

import React, { useState } from 'react';
import DeckGL from '@deck.gl/react';
import { DeckProps, MapViewState } from '@deck.gl/core';
import { LineLayer, ScatterplotLayer } from '@deck.gl/layers';

import { BASEMAP } from '@deck.gl/carto';
import { Map, Popup, useControl } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';

import '../style.css'
import './Datamenu.page.css';

// ✅ Types are available here
import { FeaturesGrid } from '@/components/FeaturesGrid/FeaturesGrid';
import { MapboxOverlay } from '@deck.gl/mapbox';
import { Link } from 'react-router-dom';
import { IconEye, IconCode, IconExternalLink, IconMap, IconList } from '@tabler/icons-react';

const INITIAL_VIEW_STATE = {
  longitude: -0.0167, // Longitude for Olympic Park
  latitude: 51.5447, // Latitude for Olympic Park
  zoom: 14.5, // Zoom in closer to Olympic Park
};

const data = [
  {
    id: 1,
    position: [-0.0167, 51.5447], // Olympic Park Center
    title: 'London Olympic Stadium',
    image: 'https://via.placeholder.com/150',
    owner: 'London 2012 Organizing Committee',
    description: 'The stadium built for the 2012 Summer Olympics.',
    tags: ['Stadium', 'Olympics'],
  },
  {
    id: 2,
    position: [-0.017, 51.545], // A nearby location around the park
    title: 'The Orbit',
    image: 'https://via.placeholder.com/150',
    owner: 'ArcelorMittal',
    description: 'A landmark observation tower in Olympic Park.',
    tags: ['Art', 'Landmark'],
  },
  {
    id: 3,
    position: [-0.018, 51.546], // Another nearby location
    title: 'Queen Elizabeth Olympic Park',
    image: 'https://via.placeholder.com/150',
    owner: 'Greater London Authority',
    description: 'A park built after the London 2012 Olympics.',
    tags: ['Park', 'Recreation'],
  },
];

type DataType = {
  from: [longitude: number, latitude: number];
  to: [longitude: number, latitude: number];
};

function DeckGLOverlay(props: DeckProps) {
  const overlay = useControl<MapboxOverlay>(() => new MapboxOverlay(props));
  overlay.setProps(props);
  return null;
}

const breadcrumbs = [
  { label: 'Home', path: '/' },
  { label: 'Data Menu', path: '/data-menu' },
];

const items = [
  { title: 'Mantine', href: '#' },
  { title: 'Mantine hooks', href: '#' },
  { title: 'use-id', href: '#' },
].map((item, index) => (
  <Anchor href={item.href} key={index}>
    {item.title}
  </Anchor>
));

export function Datamenu() {
  const [popupInfo, setPopupInfo] = useState(null);

  const layers = [
    new ScatterplotLayer({
      id: 'deckgl-circle',
      data,
      getPosition: d => d.position,
      getFillColor: [0, 128, 255],
      getRadius: 20,
      beforeId: 'watername_ocean', // In interleaved mode render the layer under map labels
      pickable: true,
      onClick: (info) => setPopupInfo(info.object),
    })
  ];

  return (
    <>
      <div style={{ paddingLeft: '40px' }}>
        <Breadcrumbs separator=">">
          {breadcrumbs.map((crumb) => (
            <Link to={crumb.path} key={crumb.path} className="breadcrumb-link">
              {crumb.label}
            </Link>
          ))}
        </Breadcrumbs>
      </div>
      <Text ta="center" size="xl" c="blue" >Data Menu</Text>
      <Space h="md" />
      <Text ta="center" size="s" c="white" >Browse the data menu below using an interactive map. You can switch to traditional list view. </Text>
      <Center h={100}>

        <SegmentedControl color="blue"
          data={[
            {
              value: 'map',
              label: (
                <Center style={{ gap: 10 }}>
                  <IconMap style={{ width: rem(16), height: rem(16) }} />
                  <span>Map view</span>
                </Center>
              ),
            },
            {
              value: 'list',
              label: (
                <Center style={{ gap: 10 }}>
                  <IconList style={{ width: rem(16), height: rem(16) }} />
                  <span>List view</span>
                </Center>
              ),
            },
          ]}
        />
      </Center>
      <div
        style={{
          height: '900px', // Set height
          width: '90%',  // Set width
          border: '0px solid black',
          margin: '40px auto', // Center the div
          position: 'relative',
        }}
      >
        <Map
          initialViewState={INITIAL_VIEW_STATE}
          mapStyle={BASEMAP.DARK_MATTER}

          onClick={(e) => {
            // Close popup when clicking on the map
            if (!e.features) {
              setPopupInfo(null);
            }
          }}
        >
          {/* DeckGL layer for interactivity */}
          <DeckGL
            layers={layers}
            viewState={INITIAL_VIEW_STATE}
          />

          {popupInfo && (
            <Popup
              longitude={popupInfo.position[0]}
              latitude={popupInfo.position[1]}
              closeOnClick={true}
              anchor="top"
              onClose={() => setPopupInfo(null)}
            >
              <Group spacing="sm" mb="sm">
                <Avatar src={popupInfo.image} size={40} />
                <div>
                  <Text fw={500}>{popupInfo.title}</Text>
                  <Text fz="sm" c="dimmed">
                    {popupInfo.owner}
                  </Text>
                </div>
              </Group>
              <Text>{popupInfo.description}</Text>
              <Group spacing="xs" mt="sm">
                {popupInfo.tags.map((tag, index) => (
                  <Badge key={index} size="sm">
                    {tag}
                  </Badge>
                ))}
              </Group>
            </Popup>
          )}
        </Map>

      </div>


    </>
  );
}


