import { HeaderMegaMenu } from '@/components/Header/HeaderMegaMenu';
import { ColorSchemeToggle } from '../components/ColorSchemeToggle/ColorSchemeToggle';
import { Welcome } from '../components/Welcome/Welcome';
import { FooterLinks } from '@/components/Footer/FooterLinks';
import { Carousel } from '@mantine/carousel';
import '@mantine/carousel/styles.css';
import { Text, Container, Image, Space, Title, Center, rem, SegmentedControl, Badge, ActionIcon, Button, Card, Group, Grid, SimpleGrid, Flex, Avatar, Skeleton, AspectRatio, Overlay, Box, Popover } from '@mantine/core';

import React, { useEffect, useState } from 'react';
import DeckGL from '@deck.gl/react';
import { DeckProps, MapViewState } from '@deck.gl/core';
import { LineLayer, ScatterplotLayer } from '@deck.gl/layers';

import { BASEMAP } from '@deck.gl/carto';
import { Map, useControl } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';

import { FeaturesGrid } from '@/components/FeaturesGrid/FeaturesGrid';
import { MapboxOverlay } from '@deck.gl/mapbox';
import './Home.page.css'
import { IconMap, IconList, IconHeart, IconMapPin } from '@tabler/icons-react';
import classes from './Home.page.css';

const INITIAL_VIEW_STATE: MapViewState = {
  longitude: -122.41669,
  latitude: 37.7853,
  zoom: 13
};

type DataType = {
  from: [longitude: number, latitude: number];
  to: [longitude: number, latitude: number];
};

const mockdata = {
  image:
    'https://raw.githubusercontent.com/syk-yaman/shift-digital-frontiers/refs/heads/main/src/frontend/assets/echobox.jpg',
  title: 'Park data',
  country: '1 min ago',
  description:
    'Lorem Ipsum has been the industrys standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets ',
  badges: [
    { emoji: '☀️', label: 'Sunny' },
    { emoji: '🦓', label: 'Onsite zoo' },
    { emoji: '🌊', label: 'Sea' },
  ],
};

// function DeckGLOverlay(props: DeckProps) {
//   const overlay = useControl<MapboxOverlay>(() => new MapboxOverlay(props));
//   overlay.setProps(props);
//   return null;
// }

const mockdata2 = [
  {
    title: 'Top 10 places to visit in Norway this summer',
    image:
      'https://images.unsplash.com/photo-1527004013197-933c4bb611b3?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=720&q=80',
    date: 'August 18, 2022',
  },
  {
    title: 'Best forests to visit in North America',
    image:
      'https://images.unsplash.com/photo-1448375240586-882707db888b?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=720&q=80',
    date: 'August 27, 2022',
  },
  {
    title: 'Hawaii beaches review: better than you think',
    image:
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=720&q=80',
    date: 'September 9, 2022',
  },
  {
    title: 'Mountains at night: 12 best locations to enjoy the view',
    image:
      'https://images.unsplash.com/photo-1519681393784-d120267933ba?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=720&q=80',
    date: 'September 12, 2022',
  },
];


export function HomePage() {
  const { image, title, description, country, badges } = mockdata;
  const features = badges.map((badge) => (
    <Badge variant="light" key={badge.label} leftSection={badge.emoji}>
      {badge.label}
    </Badge>
  ));

  const PRIMARY_COL_HEIGHT = '600px';
  const SECONDARY_COL_HEIGHT = `calc(${PRIMARY_COL_HEIGHT} / 2 - var(--mantine-spacing-md) / 2)`;

  const [imageSrc, setImageSrc] = useState('/assets/qeop-hero7.jpg'); // Initial image source
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsFading(true); // Start fading
      setTimeout(() => {
        setImageSrc('/assets/qeop-hero8.jpg'); // New image source
        setIsFading(false); // Reset fade effect
      }, 500); // Duration of the fade-out effect
    }, 3000); // Delay before image change

    return () => clearTimeout(timer); // Cleanup the timer
  }, []);


  return (
    <>
      <div style={{ backgroundColor: '#173B3B' }}>

        <Box
          style={{
            position: 'relative',
          }}
        >
          {/* Image component */}
          <Image
            src={imageSrc}
            alt="Sample"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: isFading ? 0 : 1, // Fade effect
              transition: 'opacity 0.7s linear', // Smooth transition
            }}
          />

          {/* Overlay component */}
          <Overlay
            gradient="linear-gradient(180deg,rgb(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0.0) 20%)" // Gradient overlay
            opacity={1} // Adjust opacity
            color="#fff" // Optional fallback color
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
          />

          <Overlay
            gradient="linear-gradient(0deg, #173B3B 0%, rgba(0, 0, 0, 0.0) 35%)" // Gradient overlay
            opacity={1} // Adjust opacity
            color="#fff" // Optional fallback color
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
          />
        </Box>
        <Space h="xl" />
        <Space h="xl" />

        <Text ta="center" className='title' c="white" fw={500} >A new way for data collaboration in the Queen Elizabeth Olympic Park</Text>
        <Text ta="center" size="lg" c="white" style={{ "marginLeft": "50px", "marginRight": "50px" }} >
          This platform unifies all the data in and around the park in one place. Everyone can access live data and use it, contribute data to be used, and share success stories about how they used the data—a platform to innovate, collaborate and push the digital frontiers further.
        </Text>
        <Space h="xl" />
        <Space h="xl" />
        <Space h="xl" />
        <Space h="xl" />


        <Text ta="center" className='title' fw={500} c="white" >Featured data items</Text>
        <Text ta="center" size="s" c="white" >Browse the featured data items below. You can go to the data menu section and
          use an interactive map to explore the data. </Text>
        <Space h="md" />

        <section style={{ textAlign: 'center', padding: '2rem 0' }}>
          <Flex
            gap="lg"
            justify="center"
            align="center"
            style={{ maxWidth: '1600px', margin: '0 auto' }}
            wrap="wrap"
          >
            <Card
              withBorder
              radius="md"
              p="md"
              className="card"
              style={{ border: 'none', backgroundColor: '#1F5754', width: '350px' }}
            >
              <Card.Section style={{ position: 'relative' }}>
                {/* Image */}
                <Image
                  src="https://raw.githubusercontent.com/syk-yaman/shift-digital-frontiers/refs/heads/main/src/frontend/assets/echobox.jpg"
                  alt="Bats activity in the QEOP"
                  height={180}
                />

                {/* Badge positioned at the bottom-left of the image */}
                <Badge
                  size="sm"
                  variant="light"
                  style={{
                    position: 'absolute',
                    bottom: 10,
                    left: 10,
                    backgroundColor: 'rgba(154, 255, 134, 0.8)', // Slightly transparent for aesthetics
                    color: '#000',
                  }}
                >
                  Last reading: 21 min
                </Badge>
              </Card.Section>

              <Card.Section className="section" mt="md">
                <Group justify="apart">
                  <Text c="white" fz="lg" fw={500}>
                    Bats activity in the QEOP
                  </Text>
                </Group>
                <Group mt="xs" justify="apart">
                  <Center>
                    <Avatar
                      src="https://avatars.githubusercontent.com/u/145232?s=96&v=4"
                      size={35}
                      radius="xl"
                      mr="xs"
                    />
                    <Text c="white" fz="m" inline>
                      Duncan Wilson
                    </Text>
                  </Center>
                </Group>

                <Text c="white" fz="sm" mt="xs">
                  15 smart bat sensors to monitor bat activity and their species in the park, using ultrasonic microphones and edge AI for classification.
                </Text>
              </Card.Section>

              <Group gap={7} mt={5}>
                <Badge variant="outline" color="#00C399" key="" leftSection="🌱">
                  Nature
                </Badge>
                <Badge variant="outline" color="#00C399" key="" leftSection="🏢">
                  Built enviroment
                </Badge>
                <Badge variant="outline" color="#00C399" key="" leftSection="🦇">
                  Bats
                </Badge>
              </Group>
            </Card>
            <Card
              withBorder
              radius="md"
              p="md"
              className="card"
              style={{ border: 'none', backgroundColor: '#1F5754', width: '350px' }}
            >
              <Card.Section style={{ position: 'relative' }}>
                {/* Image */}
                <Image
                  src="https://raw.githubusercontent.com/syk-yaman/shift-digital-frontiers/refs/heads/main/src/frontend/assets/echobox.jpg"
                  alt="Bats activity in the QEOP"
                  height={180}
                />

                {/* Badge positioned at the bottom-left of the image */}
                <Badge
                  size="sm"
                  variant="light"
                  style={{
                    position: 'absolute',
                    bottom: 10,
                    left: 10,
                    backgroundColor: 'rgba(154, 255, 134, 0.8)', // Slightly transparent for aesthetics
                    color: '#000',
                  }}
                >
                  Last reading: 21 min
                </Badge>
              </Card.Section>

              <Card.Section className="section" mt="md">
                <Group justify="apart">
                  <Text c="white" fz="lg" fw={500}>
                    Bats activity in the QEOP
                  </Text>
                </Group>
                <Group mt="xs" justify="apart">
                  <Center>
                    <Avatar
                      src="https://avatars.githubusercontent.com/u/145232?s=96&v=4"
                      size={35}
                      radius="xl"
                      mr="xs"
                    />
                    <Text c="white" fz="m" inline>
                      Duncan Wilson
                    </Text>
                  </Center>
                </Group>

                <Text c="white" fz="sm" mt="xs">
                  15 smart bat sensors to monitor bat activity and their species in the park, using ultrasonic microphones and edge AI for classification.
                </Text>
              </Card.Section>

              <Group gap={7} mt={5}>
                <Badge variant="outline" color="#00C399" key="" leftSection="🌱">
                  Nature
                </Badge>
                <Badge variant="outline" color="#00C399" key="" leftSection="🏢">
                  Built enviroment
                </Badge>
                <Badge variant="outline" color="#00C399" key="" leftSection="🦇">
                  Bats
                </Badge>
              </Group>
            </Card>
            <Card
              withBorder
              radius="md"
              p="md"
              className="card"
              style={{ border: 'none', backgroundColor: '#1F5754', width: '350px' }}
            >
              <Card.Section style={{ position: 'relative' }}>
                {/* Image */}
                <Image
                  src="https://raw.githubusercontent.com/syk-yaman/shift-digital-frontiers/refs/heads/main/src/frontend/assets/echobox.jpg"
                  alt="Bats activity in the QEOP"
                  height={180}
                />

                {/* Badge positioned at the bottom-left of the image */}
                <Badge
                  size="sm"
                  variant="light"
                  style={{
                    position: 'absolute',
                    bottom: 10,
                    left: 10,
                    backgroundColor: 'rgba(154, 255, 134, 0.8)', // Slightly transparent for aesthetics
                    color: '#000',
                  }}
                >
                  Last reading: 21 min
                </Badge>
              </Card.Section>

              <Card.Section className="section" mt="md">
                <Group justify="apart">
                  <Text c="white" fz="lg" fw={500}>
                    Bats activity in the QEOP
                  </Text>
                </Group>
                <Group mt="xs" justify="apart">
                  <Center>
                    <Avatar
                      src="https://avatars.githubusercontent.com/u/145232?s=96&v=4"
                      size={35}
                      radius="xl"
                      mr="xs"
                    />
                    <Text c="white" fz="m" inline>
                      Duncan Wilson
                    </Text>
                  </Center>
                </Group>

                <Text c="white" fz="sm" mt="xs">
                  15 smart bat sensors to monitor bat activity and their species in the park, using ultrasonic microphones and edge AI for classification.
                </Text>
              </Card.Section>

              <Group gap={7} mt={5}>
                <Badge variant="outline" color="#00C399" key="" leftSection="🌱">
                  Nature
                </Badge>
                <Badge variant="outline" color="#00C399" key="" leftSection="🏢">
                  Built enviroment
                </Badge>
                <Badge variant="outline" color="#00C399" key="" leftSection="🦇">
                  Bats
                </Badge>
              </Group>
            </Card>
            <Card
              withBorder
              radius="md"
              p="md"
              className="card"
              style={{ border: 'none', backgroundColor: '#1F5754', width: '350px' }}
            >
              <Card.Section style={{ position: 'relative' }}>
                {/* Image */}
                <Image
                  src="https://raw.githubusercontent.com/syk-yaman/shift-digital-frontiers/refs/heads/main/src/frontend/assets/echobox.jpg"
                  alt="Bats activity in the QEOP"
                  height={180}
                />

                {/* Badge positioned at the bottom-left of the image */}
                <Badge
                  size="sm"
                  variant="light"
                  style={{
                    position: 'absolute',
                    bottom: 10,
                    left: 10,
                    backgroundColor: 'rgba(154, 255, 134, 0.8)', // Slightly transparent for aesthetics
                    color: '#000',
                  }}
                >
                  Last reading: 21 min
                </Badge>
              </Card.Section>

              <Card.Section className="section" mt="md">
                <Group justify="apart">
                  <Text c="white" fz="lg" fw={500}>
                    Bats activity in the QEOP
                  </Text>
                </Group>
                <Group mt="xs" justify="apart">
                  <Center>
                    <Avatar
                      src="https://avatars.githubusercontent.com/u/145232?s=96&v=4"
                      size={35}
                      radius="xl"
                      mr="xs"
                    />
                    <Text c="white" fz="m" inline>
                      Duncan Wilson
                    </Text>
                  </Center>
                </Group>

                <Text c="white" fz="sm" mt="xs">
                  15 smart bat sensors to monitor bat activity and their species in the park, using ultrasonic microphones and edge AI for classification.
                </Text>
              </Card.Section>

              <Group gap={7} mt={5}>
                <Badge variant="outline" color="#00C399" key="" leftSection="🌱">
                  Nature
                </Badge>
                <Badge variant="outline" color="#00C399" key="" leftSection="🏢">
                  Built enviroment
                </Badge>
                <Badge variant="outline" color="#00C399" key="" leftSection="🦇">
                  Bats
                </Badge>
              </Group>
            </Card>
            <Card
              withBorder
              radius="md"
              p="md"
              className="card"
              style={{ border: 'none', backgroundColor: '#1F5754', width: '350px' }}
            >
              <Card.Section style={{ position: 'relative' }}>
                {/* Image */}
                <Image
                  src="https://raw.githubusercontent.com/syk-yaman/shift-digital-frontiers/refs/heads/main/src/frontend/assets/echobox.jpg"
                  alt="Bats activity in the QEOP"
                  height={180}
                />

                {/* Badge positioned at the bottom-left of the image */}
                <Badge
                  size="sm"
                  variant="light"
                  style={{
                    position: 'absolute',
                    bottom: 10,
                    left: 10,
                    backgroundColor: 'rgba(154, 255, 134, 0.8)', // Slightly transparent for aesthetics
                    color: '#000',
                  }}
                >
                  Last reading: 21 min
                </Badge>
              </Card.Section>

              <Card.Section className="section" mt="md">
                <Group justify="apart">
                  <Text c="white" fz="lg" fw={500}>
                    Bats activity in the QEOP
                  </Text>
                </Group>
                <Group mt="xs" justify="apart">
                  <Center>
                    <Avatar
                      src="https://avatars.githubusercontent.com/u/145232?s=96&v=4"
                      size={35}
                      radius="xl"
                      mr="xs"
                    />
                    <Text c="white" fz="m" inline>
                      Duncan Wilson
                    </Text>
                  </Center>
                </Group>

                <Text c="white" fz="sm" mt="xs">
                  15 smart bat sensors to monitor bat activity and their species in the park, using ultrasonic microphones and edge AI for classification.
                </Text>
              </Card.Section>

              <Group gap={7} mt={5}>
                <Badge variant="outline" color="#00C399" key="" leftSection="🌱">
                  Nature
                </Badge>
                <Badge variant="outline" color="#00C399" key="" leftSection="🏢">
                  Built enviroment
                </Badge>
                <Badge variant="outline" color="#00C399" key="" leftSection="🦇">
                  Bats
                </Badge>
              </Group>
            </Card>
            <Card
              withBorder
              radius="md"
              p="md"
              className="card"
              style={{ border: 'none', backgroundColor: '#1F5754', width: '350px' }}
            >
              <Card.Section style={{ position: 'relative' }}>
                {/* Image */}
                <Image
                  src="https://raw.githubusercontent.com/syk-yaman/shift-digital-frontiers/refs/heads/main/src/frontend/assets/echobox.jpg"
                  alt="Bats activity in the QEOP"
                  height={180}
                />

                {/* Badge positioned at the bottom-left of the image */}
                <Badge
                  size="sm"
                  variant="light"
                  style={{
                    position: 'absolute',
                    bottom: 10,
                    left: 10,
                    backgroundColor: 'rgba(154, 255, 134, 0.8)', // Slightly transparent for aesthetics
                    color: '#000',
                  }}
                >
                  Last reading: 21 min
                </Badge>
              </Card.Section>

              <Card.Section className="section" mt="md">
                <Group justify="apart">
                  <Text c="white" fz="lg" fw={500}>
                    Bats activity in the QEOP
                  </Text>
                </Group>
                <Group mt="xs" justify="apart">
                  <Center>
                    <Avatar
                      src="https://avatars.githubusercontent.com/u/145232?s=96&v=4"
                      size={35}
                      radius="xl"
                      mr="xs"
                    />
                    <Text c="white" fz="m" inline>
                      Duncan Wilson
                    </Text>
                  </Center>
                </Group>

                <Text c="white" fz="sm" mt="xs">
                  15 smart bat sensors to monitor bat activity and their species in the park, using ultrasonic microphones and edge AI for classification.
                </Text>
              </Card.Section>

              <Group gap={7} mt={5}>
                <Badge variant="outline" color="#00C399" key="" leftSection="🌱">
                  Nature
                </Badge>
                <Badge variant="outline" color="#00C399" key="" leftSection="🏢">
                  Built enviroment
                </Badge>
                <Badge variant="outline" color="#00C399" key="" leftSection="🦇">
                  Bats
                </Badge>
              </Group>
            </Card>
            <Card
              withBorder
              radius="md"
              p="md"
              className="card"
              style={{ border: 'none', backgroundColor: '#1F5754', width: '350px' }}
            >
              <Card.Section style={{ position: 'relative' }}>
                {/* Image */}
                <Image
                  src="https://raw.githubusercontent.com/syk-yaman/shift-digital-frontiers/refs/heads/main/src/frontend/assets/echobox.jpg"
                  alt="Bats activity in the QEOP"
                  height={180}
                />

                {/* Badge positioned at the bottom-left of the image */}
                <Badge
                  size="sm"
                  variant="light"
                  style={{
                    position: 'absolute',
                    bottom: 10,
                    left: 10,
                    backgroundColor: 'rgba(154, 255, 134, 0.8)', // Slightly transparent for aesthetics
                    color: '#000',
                  }}
                >
                  Last reading: 21 min
                </Badge>
              </Card.Section>

              <Card.Section className="section" mt="md">
                <Group justify="apart">
                  <Text c="white" fz="lg" fw={500}>
                    Bats activity in the QEOP
                  </Text>
                </Group>
                <Group mt="xs" justify="apart">
                  <Center>
                    <Avatar
                      src="https://avatars.githubusercontent.com/u/145232?s=96&v=4"
                      size={35}
                      radius="xl"
                      mr="xs"
                    />
                    <Text c="white" fz="m" inline>
                      Duncan Wilson
                    </Text>
                  </Center>
                </Group>

                <Text c="white" fz="sm" mt="xs">
                  15 smart bat sensors to monitor bat activity and their species in the park, using ultrasonic microphones and edge AI for classification.
                </Text>
              </Card.Section>

              <Group gap={7} mt={5}>
                <Badge variant="outline" color="#00C399" key="" leftSection="🌱">
                  Nature
                </Badge>
                <Badge variant="outline" color="#00C399" key="" leftSection="🏢">
                  Built enviroment
                </Badge>
                <Badge variant="outline" color="#00C399" key="" leftSection="🦇">
                  Bats
                </Badge>
              </Group>
            </Card>
            <Card
              withBorder
              radius="md"
              p="md"
              className="card"
              style={{ border: 'none', backgroundColor: '#1F5754', width: '350px' }}
            >
              <Card.Section style={{ position: 'relative' }}>
                {/* Image */}
                <Image
                  src="https://raw.githubusercontent.com/syk-yaman/shift-digital-frontiers/refs/heads/main/src/frontend/assets/echobox.jpg"
                  alt="Bats activity in the QEOP"
                  height={180}
                />

                {/* Badge positioned at the bottom-left of the image */}
                <Badge
                  size="sm"
                  variant="light"
                  style={{
                    position: 'absolute',
                    bottom: 10,
                    left: 10,
                    backgroundColor: 'rgba(154, 255, 134, 0.8)', // Slightly transparent for aesthetics
                    color: '#000',
                  }}
                >
                  Last reading: 21 min
                </Badge>
              </Card.Section>

              <Card.Section className="section" mt="md">
                <Group justify="apart">
                  <Text c="white" fz="lg" fw={500}>
                    Bats activity in the QEOP
                  </Text>
                </Group>
                <Group mt="xs" justify="apart">
                  <Center>
                    <Avatar
                      src="https://avatars.githubusercontent.com/u/145232?s=96&v=4"
                      size={35}
                      radius="xl"
                      mr="xs"
                    />
                    <Text c="white" fz="m" inline>
                      Duncan Wilson
                    </Text>
                  </Center>
                </Group>

                <Text c="white" fz="sm" mt="xs">
                  15 smart bat sensors to monitor bat activity and their species in the park, using ultrasonic microphones and edge AI for classification.
                </Text>
              </Card.Section>

              <Group gap={7} mt={5}>
                <Badge variant="outline" color="#00C399" key="" leftSection="🌱">
                  Nature
                </Badge>
                <Badge variant="outline" color="#00C399" key="" leftSection="🏢">
                  Built enviroment
                </Badge>
                <Badge variant="outline" color="#00C399" key="" leftSection="🦇">
                  Bats
                </Badge>
              </Group>
            </Card>
          </Flex>
        </section>

        <Text ta="center" className='title' c="white" >Latest showcases</Text>
        <Space h="md" />
        <Text ta="center" size="s" c="white" >Browse the latest showcases related to our datasets </Text>
        <Space h="md" />

        <Container px={0} size="100rem">
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            <Card style={{ backgroundColor: '#1F5754' }} p="md" radius="md" component="a" href="#" className=".card">
              <AspectRatio ratio={1920 / 1080}>
                <Image src="https://connected-environments.org/wp-content/uploads/2019/11/2017-11-20-11_33_05-ViLoVive.png" />
              </AspectRatio>
              <Text c="dimmed" size="xs" tt="uppercase" fw={700} mt="md">
                September 9, 2022
              </Text>
              <Text className=".title2" mt={5}>
                Lorem Ipsum has been the industrys standard dummy text ever since the 1500s
              </Text>
              <Text className=".title" mt={5}>
                Lorem Ipsum has been the industrys standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheetsLorem Ipsum has been the industrys standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets
              </Text>
            </Card>
            <Grid gutter="md">
              <Grid.Col>
                <Card style={{ backgroundColor: '#1F5754' }} p="md" radius="md" component="a" href="#" className=".card">
                  <AspectRatio ratio={1920 / 1080}>
                    <Image src="https://connected-environments.org/wp-content/uploads/2019/11/2017-11-20-11_33_05-ViLoVive.png" />
                  </AspectRatio>
                  <Text c="dimmed" size="xs" tt="uppercase" fw={700} mt="md">
                    September 9, 2022
                  </Text>
                  <Text className=".title" mt={5}>
                    Hawaii beaches review: better than you think
                  </Text>
                </Card>
              </Grid.Col>
              <Grid.Col span={6}>
                <Card style={{ backgroundColor: '#1F5754' }} p="md" radius="md" component="a" href="#" className=".card">
                  <AspectRatio ratio={1920 / 1080}>
                    <Image src="https://connected-environments.org/wp-content/uploads/2019/11/2017-11-20-11_33_05-ViLoVive.png" />
                  </AspectRatio>
                  <Text c="dimmed" size="xs" tt="uppercase" fw={700} mt="md">
                    September 9, 2022
                  </Text>
                  <Text className=".title" mt={5}>
                    Lorem Ipsum has been the industrys standard dummy text ever since the 1500s
                  </Text>
                </Card>
              </Grid.Col>
              <Grid.Col span={6}>
                <Card style={{ backgroundColor: '#1F5754' }} p="md" radius="md" component="a" href="#" className=".card">
                  <AspectRatio ratio={1920 / 1080}>
                    <Image src="https://connected-environments.org/wp-content/uploads/2019/11/2017-11-20-11_33_05-ViLoVive.png" />
                  </AspectRatio>
                  <Text c="dimmed" size="xs" tt="uppercase" fw={700} mt="md">
                    September 9, 2022
                  </Text>
                  <Text className=".title" mt={5}>
                    Lorem Ipsum has been the industrys standard dummy text ever since the 1500s
                  </Text>
                </Card>
              </Grid.Col>
            </Grid>
          </SimpleGrid>
        </Container>

        <Text mt="3rem" ta="center" className='title' c="white" >Partners</Text>
        <Space h="md" />
        <Text ta="center" size="s" c="white" >Those are our partners in this platform</Text>
        <Space h="md" />

        <Container py="xl">
          <SimpleGrid cols={{ base: 1, sm: 4 }}>
            <Card style={{ backgroundColor: '#1F5754' }} key={"article.title"} p="md" radius="md" component="a" href="#" className={".card"}>
              <AspectRatio ratio={1920 / 1080}>
                <Image src={"https://www.ucl.ac.uk/brand/sites/brand/files/styles/small_image/public/ucl-logo-black-on-grey.jpg?itok=ooOI6Tcx"} />
              </AspectRatio>
              <Text c="dimmed" size="xs" tt="uppercase" fw={700} mt="md">
                {"UCL"}
              </Text>
              <Text className={".title"} mt={5}>
                {"Uninersity College London"}
              </Text>
            </Card>

            <Card style={{ backgroundColor: '#1F5754' }} key={"article.title"} p="md" radius="md" component="a" href="#" className={".card"}>
              <AspectRatio ratio={1920 / 1080}>
                <Image src={"https://www.stratfordcross.co.uk/globalassets/uk/stratford-cross/eat-drink-shop-play/logos/amenity_logos_queen-elizabeth.jpg?width=300&height=400&upscale=false&mode=max&quality=80"} />
              </AspectRatio>
              <Text c="dimmed" size="xs" tt="uppercase" fw={700} mt="md">
                {"article.date"}
              </Text>
              <Text className={".title"} mt={5}>
                {"article.title"}
              </Text>
            </Card>

            <Card style={{ backgroundColor: '#1F5754' }} key={"article.title"} p="md" radius="md" component="a" href="#" className={".card"}>
              <AspectRatio ratio={1920 / 1080}>
                <Image src={"https://www.stratfordcross.co.uk/globalassets/uk/stratford-cross/eat-drink-shop-play/logos/amenity_logos_queen-elizabeth.jpg?width=300&height=400&upscale=false&mode=max&quality=80"} />
              </AspectRatio>
              <Text c="dimmed" size="xs" tt="uppercase" fw={700} mt="md">
                {"article.date"}
              </Text>
              <Text className={".title"} mt={5}>
                {"article.title"}
              </Text>
            </Card>

            <Card style={{ backgroundColor: '#1F5754' }} key={"article.title"} p="md" radius="md" component="a" href="#" className={".card"}>
              <AspectRatio ratio={1920 / 1080}>
                <Image src={"https://www.stratfordcross.co.uk/globalassets/uk/stratford-cross/eat-drink-shop-play/logos/amenity_logos_queen-elizabeth.jpg?width=300&height=400&upscale=false&mode=max&quality=80"} />
              </AspectRatio>
              <Text c="dimmed" size="xs" tt="uppercase" fw={700} mt="md">
                {"article.date"}
              </Text>
              <Text className={".title"} mt={5}>
                {"article.title"}
              </Text>
            </Card>

          </SimpleGrid>
        </Container>

      </div>
      {/* <ColorSchemeToggle /> */}

    </>
  );
}
