import { HeaderMegaMenu } from '@/components/Header/HeaderMegaMenu';
import { ColorSchemeToggle } from '../components/ColorSchemeToggle/ColorSchemeToggle';
import { Welcome } from '../components/Welcome/Welcome';
import { FooterLinks } from '@/components/Footer/FooterLinks';
import { Carousel } from '@mantine/carousel';
import '@mantine/carousel/styles.css';
import { Text, Anchor, Breadcrumbs, Image, Center, rem, SegmentedControl, Space, Avatar, Badge, Group, Card, Flex } from '@mantine/core';

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

const dataItems = [
  {
    id: 1,
    image: '/imgs/echobox.jpg',
    title: 'Bats Activity in the QEOP',
    lastReading: '21 min',
    owner: 'Duncan Wilson',
    ownerAvatar: 'https://avatars.githubusercontent.com/u/145232?s=96&v=4',
    description: '15 smart bat sensors to monitor bat activity and their species in the park, using ultrasonic microphones and edge AI for classification.',
    tags: [
      { text: 'Nature', icon: '' },
      { text: 'Built environment', icon: '' },
      { text: 'Bats', icon: '' },
    ],
  },
  {
    id: 2,
    image: 'https://connected-environments.org/wp-content/uploads/2019/11/22667474203_4184760ebc_o.jpg',
    title: 'Weather Data in QEOP',
    lastReading: '25 sec',
    owner: 'Andrew Hudson-Smith',
    ownerAvatar: 'https://avatars.githubusercontent.com/u/50172263?v=4',
    description: 'The Connected Environments team currently run weather stations at 3 sites with 3 different types of weather station.',
    tags: [
      { text: 'Weather', icon: '' },
      { text: 'Climate', icon: '' },
    ],
  },
  {
    id: 3,
    image: 'https://images.squarespace-cdn.com/content/v1/60018ed1f8f42f6c20a04b4f/c1adb054-2854-4c50-a4b4-2db06ef7c4d0/solar-panels.png?format=2500w',
    title: 'PV Energy Generation',
    lastReading: '2 years ago',
    owner: 'Nick Turner',
    ownerAvatar: 'https://media.licdn.com/dms/image/v2/D4E03AQGVUDKdcXFwAg/profile-displayphoto-shrink_100_100/profile-displayphoto-shrink_100_100/0/1689191979062?e=1742428800&v=beta&t=d5QKRQza3KBVOLab0wz6czUWuFW22zxxdcZjMs8U7dQ',
    description: 'Historical PV energy generation data for the panels atop the car park by Here East, Riverside East bar/cafe next to Marshgate and Timber Lodge.',
    tags: [
      { text: 'PV', icon: '' },
      { text: 'Built environment', icon: '' },
      { text: 'Electrcity', icon: '' },
    ],
  },
];

const data = [
  {
    id: 1,
    position: [-0.0167, 51.5447], // Olympic Park Center
    title: 'London Olympic Stadium visitors data',
    image: 'https://via.placeholder.com/150',
    owner: 'London 2012 Organizing Committee',
    description: 'Data for vistors count in the stadium for 2012 Summer Olympics.',
    tags: ['Stadium', 'Visitors'],
  },
  {
    id: 2,
    position: [-0.017, 51.545], // A nearby location around the park
    title: 'LoRa packets in The Orbit',
    image: 'https://via.placeholder.com/150',
    owner: 'ArcelorMittal',
    description: 'LoRa signal A landmark observation tower in Olympic Park.',
    tags: ['Signal', 'LoRa'],
  },
  {
    id: 3,
    position: [-0.018, 51.546], // Another nearby location
    title: 'Queen Elizabeth Olympic Park visitors',
    image: 'https://via.placeholder.com/150',
    owner: 'Greater London Authority',
    description: 'A park built after the London 2012 Olympics.',
    tags: ['Park', 'Visitors'],
  },
];

type DataType = {
  from: [longitude: number, latitude: number];
  to: [longitude: number, latitude: number];
};

// function DeckGLOverlay(props: DeckProps) {
//   const overlay = useControl<MapboxOverlay>(() => new MapboxOverlay(props));
//   overlay.setProps(props);
//   return null;
// }

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

interface PopupInfo {
  position: [number, number];
  image: string;
  title: string;
  owner: string;
  description: string;
  tags: string[];
}

export function Datamenu() {
  const [popupInfo, setPopupInfo] = useState<PopupInfo | null>(null);
  const [view, setView] = useState('map');

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
      <Space h="md" />
      <Space h="md" />
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

        <SegmentedControl
          color="blue"
          value={view}
          onChange={setView}
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
      {view === 'map' && (
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
                <Group gap="sm" mb="sm">
                  <Avatar src={popupInfo.image} size={40} />
                  <div>
                    <Text fw={500}>{popupInfo.title}</Text>
                    <Text fz="sm" c="dimmed">
                      {popupInfo.owner}
                    </Text>
                  </div>
                </Group>
                <Text>{popupInfo.description}</Text>
                <Group gap="xs" mt="sm">
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
      )}

      {view === 'list' && (
        <Flex
          gap="lg"
          justify="center"
          align="center"
          style={{ maxWidth: '1600px', margin: '0 auto' }}
          wrap="wrap"
          mb={'xl'}
        >
          {dataItems.map((card) => (
            <Link
              key={card.id}
              to={`/data-item/${card.id}`}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <Card
                key={card.id}
                withBorder
                radius="md"
                p="md"
                className="card"
                style={{ border: 'none', backgroundColor: '#1F5754', width: '350px' }}
              >
                <Card.Section style={{ position: 'relative' }}>
                  {/* Image */}
                  <Image src={card.image} alt={card.title} height={180} />

                  {/* Badge positioned at the bottom-left of the image */}
                  <Badge
                    size="sm"
                    variant="dark"
                    style={{
                      position: 'absolute',
                      bottom: 10,
                      left: 10,
                      backgroundColor: '#1f5753d1',
                      color: '#c9f3f1',
                    }}
                  >
                    Last updated: {card.lastReading}
                  </Badge>
                </Card.Section>

                <Card.Section className="section" mt="md">
                  <Group justify="apart">
                    <Text c="white" fz="lg" fw={500}>
                      {card.title}
                    </Text>
                  </Group>
                  <Group mt="xs" justify="apart">
                    <Center>
                      <Avatar src={card.ownerAvatar} size={30} radius="xl" mr="xs" />
                      <Text c="white" fz="m" inline>
                        {card.owner}
                      </Text>
                    </Center>
                  </Group>

                  <Text c="white" fz="sm" mt="xs">
                    {card.description}
                  </Text>
                </Card.Section>

                <Group gap={7} mt={5}>
                  {card.tags.map((tag, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      color="#d7bf3c"
                      leftSection={tag.icon}
                    >
                      {tag.text}
                    </Badge>
                  ))}
                </Group>
              </Card>
            </Link>
          ))}
        </Flex>
      )}

    </>
  );
}


