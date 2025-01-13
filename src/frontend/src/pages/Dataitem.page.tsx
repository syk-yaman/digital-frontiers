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
  Button,
  TextInput,
} from '@mantine/core';
import { Carousel } from '@mantine/carousel';
import { IconClock, IconUser, IconLicense, IconCopy } from '@tabler/icons-react';
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
    id: 3,
    position: [-0.0175, 51.5449], // Random point near London Stadium
    color: [0, 191, 255], // DeepSkyBlue color
  },
  {
    id: 4,
    position: [-0.0169, 51.5454], // Random point near London Stadium
    color: [255, 165, 0], // Orange color
  },

  {
    id: 6,
    position: [-0.0185, 51.5453], // Random point near London Stadium
    color: [255, 215, 0], // Gold color
  },
  {
    id: 7,
    position: [-0.0158, 51.5445], // Random point near London Stadium
    color: [128, 0, 128], // Purple color
  },

  {
    id: 10,
    position: [-0.0165, 51.5449], // Random point near London Stadium
    color: [72, 61, 139], // DarkSlateBlue color
  },
  {
    id: 11,
    position: [-0.0172, 51.5456], // Random point near London Stadium
    color: [255, 99, 71], // Tomato color
  },
  {
    id: 12,
    position: [-0.0182, 51.5444], // Random point near London Stadium
    color: [50, 205, 50], // LimeGreen color
  },

  {
    id: 16,
    position: [-0.0202, 51.5441], // Random point along River Lea
    color: [255, 215, 0], // Gold color
  },
  {
    id: 17,
    position: [-0.0197, 51.5435], // Random point along River Lea
    color: [128, 0, 128], // Purple color
  },
  {
    id: 18,
    position: [-0.021, 51.5446], // Random point along River Lea
    color: [255, 20, 147], // DeepPink color
  },
  {
    id: 19,
    position: [-0.0205, 51.5453], // Random point along River Lea
    color: [255, 105, 180], // HotPink color
  },
];




export function Dataitem() {
  const mqttAddress = 'mqtt.cetools.org';
  const mqttPort = '1884';
  const topic = '/';
  const visualisationLink = 'https://grafana.cetools.org/';

  // Function to copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

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
      getRadius: 20,
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
        <Group mt={'xs'} align="center" style={{ width: '100%' }}>
          {/* Provider */}
          <Group>
            <IconUser size={20} color="#d7bf3c" />
            <Text>Provider: UCL</Text>
          </Group>

          {/* Point of Contact */}
          <Group>
            <IconUser size={20} color="#d7bf3c" />
            <Text>Contact: Duncan Wilson</Text>
          </Group>

          {/* License */}
          <Group>
            <IconLicense size={20} color="#d7bf3c" />
            <Text>License: Open Data</Text>
          </Group>
        </Group>

        <Text mt='xl' ta="center" className='title' c="white" >Description</Text>


        {/* Dataset Description */}
        <Text ta="left" mt="lg" mx="auto" >
          Nature Smart brings together environmental researchers and technologists to develop the world’s first end-to-end open source system for monitoring bats, to be deployed and tested in the Queen Elizabeth Olympic Park, east London.
          <br />< br />
          Bats are considered to be a good indicator species, reflecting the general health of the natural environment – so a healthy bat population suggests a healthy biodiversity in the local area. In this project we are exploring bat activity in one of the most iconic and high profile of London’s regeneration areas, the Queen Elizabeth Olympic Park. We have developed a network of 15 smart bat monitors and installed them across the park in different habitats. It is hoped that this exploratory network of devices will provide the most detailed picture yet of bat life throughout this large urban area.
          <br />< br />

          Each smart bat monitor – Echo Box – works like “Shazam for bats”. It captures the soundscape of its surroundings through an ultrasonic microphone, then processes this data, turning it into an image called a spectrogram. Deep learning algorithms then scan the spectrogram image, identifying possible bat calls. We are also working towards identifying the species most likely to have made each call.
          <br />< br />

          Measuring bat activity in the Queen Elizabeth Olympic Park provides a very interesting real-world use case that involves large amounts of sensor data – in this case acoustic data. Rather than sending all of this data to the cloud for processing, each Echo Box device will process the data itself on its own chip, removing the cost of sending large amounts of data to the cloud. We call this “edge processing” since the processing is done on devices at the edge of the network.
          <br />< br />

          Inside each Echo Box is an Intel Edison with Arduino breakout, plus a Dodotronic Ultramic 192K microphone. To capture, process and identify bat calls each Echo Box performs the following 4 steps:
          <br />< br />

          First – a microphone on each device, capable of handling ultrasonic frequencies, can capture all audio from the environment up to 96kHz. Most bats calls occur at frequencies above 20kHz (the limit of human hearing) with some species going as high as 125kHz (although none of these species are found in the park).
          <br />< br />

          Second – every 6 seconds, a 3 second sample of audio is recorded and stored as a sound file. This means that audio from the environment is captured as 3 second snapshots at a consistent sample rate across all smart bat monitors.
          <br />< br />

          Third – the recorded audio is then turned into a spectrogram image using a method called Fast Fourier Transform. The spectrogram image shows the amplitude of sounds across the different frequencies over time. Bat calls can clearly be seen on the spectrogram as bright patterns (indicating a loud noise) at high frequencies.
          <br />< br />

          Finally – image processing techniques, called Convolutional Neural Networks (CNN), are applied to the spectrogram images to look for patterns that resemble bat calls. If any suspected bat calls are found in the image, then we are working towards applying the same CNN techniques again to each individual bat call to look at its shape in more detail and determine what species of bat it most likely is.
        </Text>

        <Text mt='xl' ta="center" className='title' c="white" >Dataset locations</Text>

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
          <Group align="center" >
            {/* MQTT Address */}
            <Group>
              <TextInput
                label="MQTT Address"
                value={mqttAddress}
                readOnly
                style={{ width: 300 }}
              />
              <Button
                variant="outline"
                onClick={() => copyToClipboard(mqttAddress)}
              >
                Copy
              </Button>
            </Group>

            {/* MQTT Port */}
            <Group >
              <TextInput
                label="MQTT Port"
                value={mqttPort}
                readOnly
                style={{ width: 300 }}
              />
              <Button
                variant="outline"
                onClick={() => copyToClipboard(mqttPort)}
              >
                Copy
              </Button>
            </Group>

            {/* Topic */}
            <Group >
              <TextInput
                label="Topic"
                value={topic}
                readOnly
                style={{ width: 300 }}
              />
              <Button
                variant="outline"
                onClick={() => copyToClipboard(topic)}
              >
                Copy
              </Button>
            </Group>

            {/* Visualisation Link */}
            <Group >
              <TextInput
                label="Visualisation Link"
                value={visualisationLink}
                readOnly
                style={{ width: 300 }}
              />
              <Button
                variant="outline"
                onClick={() => copyToClipboard(visualisationLink)}
              >
                Copy
              </Button>
            </Group>

            {/* Links Section */}

          </Group>
        </Center>

        <Text mt='xl' ta="center" className='title' c="white" >Data sample</Text>

        {/* Screenshot Section */}
        <Center mb="xl" mt="lg">
          <Image src="/imgs/bats-data.png" alt="Screenshot" />
        </Center>
      </Container>
    </>
  );
}
