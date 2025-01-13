import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Breadcrumbs,
  Text,
  Center,
  Space,
  Badge,
  Group,
  Avatar,
  Image,
  Anchor,
  rem,
  Container,
} from '@mantine/core';
import { Carousel } from '@mantine/carousel';
import { IconClock, IconUser, IconLicense } from '@tabler/icons-react';
import { Map, Popup, useControl } from 'react-map-gl/maplibre';
import { ScatterplotLayer } from '@deck.gl/layers';
import DeckGL from '@deck.gl/react';
import { BASEMAP } from '@deck.gl/carto';
import 'maplibre-gl/dist/maplibre-gl.css';
import '../style.css';
import { L } from 'vitest/dist/chunks/reporters.D7Jzd9GS';

const INITIAL_VIEW_STATE = {
  longitude: -0.0167,
  latitude: 51.5447,
  zoom: 14.5,
};

const data = [
  {
    id: 1,
    position: [-0.0167, 51.5447],
    color: [255, 99, 71], // Random color
  },
  {
    id: 2,
    position: [-0.017, 51.545],
    color: [50, 205, 50],
  },
  {
    id: 3,
    position: [-0.018, 51.546],
    color: [0, 191, 255],
  },
];

export function Dataitem() {
  const breadcrumbs = [
    { label: 'Home', path: '/' },
    { label: 'Data Menu', path: '/data-menu' },
    { label: 'Data Item', path: '#' },
  ];

  const layers = [
    new ScatterplotLayer({
      id: 'scatterplot-layer',
      data,
      getPosition: d => d.position,
      getFillColor: d => d.color,
      getRadius: 100,
      pickable: true,
    }),
  ];

  return (
    <>
      {/* Breadcrumbs */}
      <Space h="lg" />
      <div style={{ padding: '0 40px' }}>
        <Breadcrumbs separator=">">
          {breadcrumbs.map(crumb => (
            <Link to={crumb.path} key={crumb.path} className="breadcrumb-link">
              {crumb.label}
            </Link>
          ))}
        </Breadcrumbs>
      </div>
      <Container size="lg" mt={'xl'}>
        {/* Title */}
        <Text ta="left" size="xl" fw={700} mt="md">
          Bats Activity in the QEOP
        </Text>

        {/* Badges */}
        <Group align="center" mt="md">
          {/* Badges Section */}
          <Group align="left" >
            <Badge variant="outline" color="#d7bf3c">
              Nature
            </Badge>
            <Badge variant="outline" color="#d7bf3c">
              Built environment
            </Badge>
            <Badge variant="outline" color="#d7bf3c">
              Bats
            </Badge>
          </Group>

          {/* Last Updated Section */}
          <Group style={{ marginLeft: 'auto' }}>
            <IconClock size={20} color='#FFC747' />
            <Text>Last updated: 21 min</Text>
          </Group>
        </Group>

        {/* Image Slider */}
        <Carousel mx="auto" mt="lg" withIndicators >
          <Carousel.Slide>
            <Image src="/imgs/echobox.jpg" alt="Placeholder" />
          </Carousel.Slide>
          <Carousel.Slide>
            <Image src="https://connected-environments.org/wp-content/uploads/2019/11/image.png" alt="Placeholder" />
          </Carousel.Slide>
          <Carousel.Slide>
            <Image src="https://connected-environments.org/wp-content/uploads/2019/11/image-1.png" alt="Placeholder" />
          </Carousel.Slide>
        </Carousel>

        {/* Provider Info */}
        <Center mt="lg">
          <Group>
            <IconUser size={20} />
            <Text>Provider: Example Provider</Text>
          </Group>
        </Center>

        {/* Point of Contact */}
        <Center mt="md">
          <Group>
            <IconUser size={20} />
            <Text>Contact: John Doe</Text>
          </Group>
        </Center>

        {/* License */}
        <Center mt="md">
          <Group>
            <IconLicense size={20} />
            <Text>License: Open Data</Text>
          </Group>
        </Center>

        {/* Dataset Description */}
        <Text ta="center" mt="lg" mx="auto" style={{ maxWidth: '800px' }}>
          This is a description of the dataset. It provides insights into the data collected
          and its significance.
        </Text>

        {/* Map Section */}
        <div
          style={{
            height: '500px',
            width: '90%',
            margin: '40px auto',
          }}
        >
          <Map
            initialViewState={INITIAL_VIEW_STATE}
            mapStyle={BASEMAP.DARK_MATTER}
          >
            <DeckGL layers={layers} viewState={INITIAL_VIEW_STATE} />
          </Map>
        </div>

        {/* Links Section */}
        <Center mt="lg">
          <Group>
            <Anchor href="#" target="_blank">
              View Documentation
            </Anchor>
            <Anchor href="#" target="_blank">
              Download Dataset
            </Anchor>
          </Group>
        </Center>

        {/* Screenshot Section */}
        <Center mt="lg">
          <Image src="https://via.placeholder.com/800x400" alt="Screenshot" />
        </Center>
      </Container>
    </>
  );
}
