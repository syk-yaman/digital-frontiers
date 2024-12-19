import { HeaderMegaMenu } from '@/components/Header/HeaderMegaMenu';
import { ColorSchemeToggle } from '../components/ColorSchemeToggle/ColorSchemeToggle';
import { Welcome } from '../components/Welcome/Welcome';
import { FooterLinks } from '@/components/Footer/FooterLinks';
import { Carousel } from '@mantine/carousel';
import '@mantine/carousel/styles.css';
import { Text, Container, Image, Space, Title, Center, rem, SegmentedControl, Badge, ActionIcon, Button, Card, Group, Grid, SimpleGrid, Flex, Avatar, Skeleton, AspectRatio } from '@mantine/core';

import React from 'react';
import DeckGL from '@deck.gl/react';
import { DeckProps, MapViewState } from '@deck.gl/core';
import { LineLayer, ScatterplotLayer } from '@deck.gl/layers';

import { BASEMAP } from '@deck.gl/carto';
import { Map, useControl } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';

import { FeaturesGrid } from '@/components/FeaturesGrid/FeaturesGrid';
import { MapboxOverlay } from '@deck.gl/mapbox';
import './Home.page.css'
import { IconMap, IconList, IconHeart } from '@tabler/icons-react';
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
    'https://images.unsplash.com/photo-1437719417032-8595fd9e9dc6?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&q=80',
  title: 'Verudela Beach',
  country: 'Updated 1 min ago',
  description:
    'Completely renovated for the season 2020, Arena Verudela Bech Apartments are fully equipped and modernly furnished 4-star self-service apartments located on the Adriatic coastline by one of the most beautiful beaches in Pula.',
  badges: [
    { emoji: '☀️', label: 'Sunny' },
    { emoji: '🦓', label: 'Onsite zoo' },
    { emoji: '🌊', label: 'Sea' },
  ],
};

function DeckGLOverlay(props: DeckProps) {
  const overlay = useControl<MapboxOverlay>(() => new MapboxOverlay(props));
  overlay.setProps(props);
  return null;
}

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


  return (
    <>
      <Carousel withIndicators>
        <Carousel.Slide>
          <Image
            src="https://placehold.co/1600x700/748fac/CCC?text=Placeholder"
          />
        </Carousel.Slide>
        <Carousel.Slide><Image
          src="https://placehold.co/1600x700/748fac/CCC?text=Placeholder"
        /></Carousel.Slide>
        <Carousel.Slide><Image
          src="https://placehold.co/1600x700/748fac/CCC?text=Placeholder"
        /></Carousel.Slide>
        {/* ...other slides */}
      </Carousel>

      <Space h="md" />

      <Text ta="center" className='title' c="blue">A new way to explore data in the Queen Elizabeth Olympic Park</Text>
      <Text ta="center" size="s" c="white" >Rhoncus morbi et augue nec, in id ullamcorper at sit. Condimentum sit nunc in eros scelerisque sed. Commodo in viverra nunc, ullamcorper ut. Non, amet, aliquet scelerisque nullam sagittis, pulvinar. Fermentum scelerisque sit consectetur hac mi. Mollis leo eleifend ultricies purus iaculis.</Text>
      <Space h="xl" />


      <Text ta="center" className='title' c="white" >Data menu featured items</Text>
      <Space h="md" />
      <Text ta="center" size="s" c="white" >Browse the data menu below using an interactive map. You can switch to traditional list view. </Text>
      <Space h="md" />

      <section style={{ textAlign: 'center', padding: '2rem 0' }}>
        <Flex
          gap="lg"
          justify="center"
          align="center"
          style={{ maxWidth: '1600px', margin: '0 auto' }}
          wrap="wrap"
        >
          <Card withBorder radius="md" p="md" className='card' style={{ width: '350px' }}>
            <Card.Section>
              <Image src={image} alt={title} height={180} />
            </Card.Section>

            <Card.Section className='section' mt="md">
              <Group justify="apart">
                <Text fz="lg" fw={500}>
                  {title}
                </Text>
                <Badge size="sm" variant="light" style={{ marginLeft: 'auto' }} >
                  {country}
                </Badge>
              </Group>
              <Group mt="xs" justify="apart">
                <Center>
                  <Avatar
                    src="https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-1.png"
                    size={24}
                    radius="xl"
                    mr="xs"
                  />
                  <Text fz="sm" inline>
                    Bill Wormeater
                  </Text>
                </Center>
              </Group>

              <Text fz="sm" mt="lg">
                {description}
              </Text>
            </Card.Section>

            <Card.Section className='section'>
              <Text mt="md" className='label' c="dimmed">
                Related tags
              </Text>
              <Group gap={7} mt={5}>
                {features}
              </Group>
            </Card.Section>

            <Group mt="xs">
              <Button radius="md" style={{ flex: 1 }}>
                Show details
              </Button>
              <ActionIcon variant="default" radius="md" size={36}>
                <IconHeart className='like' stroke={1.5} />
              </ActionIcon>
            </Group>
          </Card>
          <Card withBorder radius="md" p="md" className='card' style={{ width: '350px' }}>
            <Card.Section>
              <Image src={image} alt={title} height={180} />
            </Card.Section>

            <Card.Section className='section' mt="md">
              <Group justify="apart">
                <Text fz="lg" fw={500}>
                  {title}
                </Text>
                <Badge size="sm" variant="light" style={{ marginLeft: 'auto' }} >
                  {country}
                </Badge>
              </Group>
              <Group mt="xs" justify="apart">
                <Center>
                  <Avatar
                    src="https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-1.png"
                    size={24}
                    radius="xl"
                    mr="xs"
                  />
                  <Text fz="sm" inline>
                    Bill Wormeater
                  </Text>
                </Center>
              </Group>

              <Text fz="sm" mt="lg">
                {description}
              </Text>
            </Card.Section>

            <Card.Section className='section'>
              <Text mt="md" className='label' c="dimmed">
                Related tags
              </Text>
              <Group gap={7} mt={5}>
                {features}
              </Group>
            </Card.Section>

            <Group mt="xs">
              <Button radius="md" style={{ flex: 1 }}>
                Show details
              </Button>
              <ActionIcon variant="default" radius="md" size={36}>
                <IconHeart className='like' stroke={1.5} />
              </ActionIcon>
            </Group>
          </Card>
          <Card withBorder radius="md" p="md" className='card' style={{ width: '350px' }}>
            <Card.Section>
              <Image src={image} alt={title} height={180} />
            </Card.Section>

            <Card.Section className='section' mt="md">
              <Group justify="apart">
                <Text fz="lg" fw={500}>
                  {title}
                </Text>
                <Badge size="sm" variant="light" style={{ marginLeft: 'auto' }} >
                  {country}
                </Badge>
              </Group>
              <Group mt="xs" justify="apart">
                <Center>
                  <Avatar
                    src="https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-1.png"
                    size={24}
                    radius="xl"
                    mr="xs"
                  />
                  <Text fz="sm" inline>
                    Bill Wormeater
                  </Text>
                </Center>
              </Group>

              <Text fz="sm" mt="lg">
                {description}
              </Text>
            </Card.Section>

            <Card.Section className='section'>
              <Text mt="md" className='label' c="dimmed">
                Related tags
              </Text>
              <Group gap={7} mt={5}>
                {features}
              </Group>
            </Card.Section>

            <Group mt="xs">
              <Button radius="md" style={{ flex: 1 }}>
                Show details
              </Button>
              <ActionIcon variant="default" radius="md" size={36}>
                <IconHeart className='like' stroke={1.5} />
              </ActionIcon>
            </Group>
          </Card>
          <Card withBorder radius="md" p="md" className='card' style={{ width: '350px' }}>
            <Card.Section>
              <Image src={image} alt={title} height={180} />
            </Card.Section>

            <Card.Section className='section' mt="md">
              <Group justify="apart">
                <Text fz="lg" fw={500}>
                  {title}
                </Text>
                <Badge size="sm" variant="light" style={{ marginLeft: 'auto' }} >
                  {country}
                </Badge>
              </Group>
              <Group mt="xs" justify="apart">
                <Center>
                  <Avatar
                    src="https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-1.png"
                    size={24}
                    radius="xl"
                    mr="xs"
                  />
                  <Text fz="sm" inline>
                    Bill Wormeater
                  </Text>
                </Center>
              </Group>

              <Text fz="sm" mt="lg">
                {description}
              </Text>
            </Card.Section>

            <Card.Section className='section'>
              <Text mt="md" className='label' c="dimmed">
                Related tags
              </Text>
              <Group gap={7} mt={5}>
                {features}
              </Group>
            </Card.Section>

            <Group mt="xs">
              <Button radius="md" style={{ flex: 1 }}>
                Show details
              </Button>
              <ActionIcon variant="default" radius="md" size={36}>
                <IconHeart className='like' stroke={1.5} />
              </ActionIcon>
            </Group>
          </Card>
          <Card withBorder radius="md" p="md" className='card' style={{ width: '350px' }}>
            <Card.Section>
              <Image src={image} alt={title} height={180} />
            </Card.Section>

            <Card.Section className='section' mt="md">
              <Group justify="apart">
                <Text fz="lg" fw={500}>
                  {title}
                </Text>
                <Badge size="sm" variant="light" style={{ marginLeft: 'auto' }} >
                  {country}
                </Badge>
              </Group>
              <Group mt="xs" justify="apart">
                <Center>
                  <Avatar
                    src="https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-1.png"
                    size={24}
                    radius="xl"
                    mr="xs"
                  />
                  <Text fz="sm" inline>
                    Bill Wormeater
                  </Text>
                </Center>
              </Group>

              <Text fz="sm" mt="lg">
                {description}
              </Text>
            </Card.Section>

            <Card.Section className='section'>
              <Text mt="md" className='label' c="dimmed">
                Related tags
              </Text>
              <Group gap={7} mt={5}>
                {features}
              </Group>
            </Card.Section>

            <Group mt="xs">
              <Button radius="md" style={{ flex: 1 }}>
                Show details
              </Button>
              <ActionIcon variant="default" radius="md" size={36}>
                <IconHeart className='like' stroke={1.5} />
              </ActionIcon>
            </Group>
          </Card>
          <Card withBorder radius="md" p="md" className='card' style={{ width: '350px' }}>
            <Card.Section>
              <Image src={image} alt={title} height={180} />
            </Card.Section>

            <Card.Section className='section' mt="md">
              <Group justify="apart">
                <Text fz="lg" fw={500}>
                  {title}
                </Text>
                <Badge size="sm" variant="light" style={{ marginLeft: 'auto' }} >
                  {country}
                </Badge>
              </Group>
              <Group mt="xs" justify="apart">
                <Center>
                  <Avatar
                    src="https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-1.png"
                    size={24}
                    radius="xl"
                    mr="xs"
                  />
                  <Text fz="sm" inline>
                    Bill Wormeater
                  </Text>
                </Center>
              </Group>

              <Text fz="sm" mt="lg">
                {description}
              </Text>
            </Card.Section>

            <Card.Section className='section'>
              <Text mt="md" className='label' c="dimmed">
                Related tags
              </Text>
              <Group gap={7} mt={5}>
                {features}
              </Group>
            </Card.Section>

            <Group mt="xs">
              <Button radius="md" style={{ flex: 1 }}>
                Show details
              </Button>
              <ActionIcon variant="default" radius="md" size={36}>
                <IconHeart className='like' stroke={1.5} />
              </ActionIcon>
            </Group>
          </Card>
          <Card withBorder radius="md" p="md" className='card' style={{ width: '350px' }}>
            <Card.Section>
              <Image src={image} alt={title} height={180} />
            </Card.Section>

            <Card.Section className='section' mt="md">
              <Group justify="apart">
                <Text fz="lg" fw={500}>
                  {title}
                </Text>
                <Badge size="sm" variant="light" style={{ marginLeft: 'auto' }} >
                  {country}
                </Badge>
              </Group>
              <Group mt="xs" justify="apart">
                <Center>
                  <Avatar
                    src="https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-1.png"
                    size={24}
                    radius="xl"
                    mr="xs"
                  />
                  <Text fz="sm" inline>
                    Bill Wormeater
                  </Text>
                </Center>
              </Group>

              <Text fz="sm" mt="lg">
                {description}
              </Text>
            </Card.Section>

            <Card.Section className='section'>
              <Text mt="md" className='label' c="dimmed">
                Related tags
              </Text>
              <Group gap={7} mt={5}>
                {features}
              </Group>
            </Card.Section>

            <Group mt="xs">
              <Button radius="md" style={{ flex: 1 }}>
                Show details
              </Button>
              <ActionIcon variant="default" radius="md" size={36}>
                <IconHeart className='like' stroke={1.5} />
              </ActionIcon>
            </Group>
          </Card>
          <Card withBorder radius="md" p="md" className='card' style={{ width: '350px' }}>
            <Card.Section>
              <Image src={image} alt={title} height={180} />
            </Card.Section>

            <Card.Section className='section' mt="md">
              <Group justify="apart">
                <Text fz="lg" fw={500}>
                  {title}
                </Text>
                <Badge size="sm" variant="light" style={{ marginLeft: 'auto' }} >
                  {country}
                </Badge>
              </Group>
              <Group mt="xs" justify="apart">
                <Center>
                  <Avatar
                    src="https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-1.png"
                    size={24}
                    radius="xl"
                    mr="xs"
                  />
                  <Text fz="sm" inline>
                    Bill Wormeater
                  </Text>
                </Center>
              </Group>

              <Text fz="sm" mt="lg">
                {description}
              </Text>
            </Card.Section>

            <Card.Section className='section'>
              <Text mt="md" className='label' c="dimmed">
                Related tags
              </Text>
              <Group gap={7} mt={5}>
                {features}
              </Group>
            </Card.Section>

            <Group mt="xs">
              <Button radius="md" style={{ flex: 1 }}>
                Show details
              </Button>
              <ActionIcon variant="default" radius="md" size={36}>
                <IconHeart className='like' stroke={1.5} />
              </ActionIcon>
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
          <Card p="md" radius="md" component="a" href="#" className=".card">
            <AspectRatio ratio={1920 / 1080}>
              <Image src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=720&q=80" />
            </AspectRatio>
            <Text c="dimmed" size="xs" tt="uppercase" fw={700} mt="md">
              September 9, 2022
            </Text>
            <Text className=".title2" mt={5}>
              Hawaii beaches review: better than you think
            </Text>
            <Text className=".title" mt={5}>
              Hawaii beaches review: better than you think
              Hawaii beaches review: better than you think
              Hawaii beaches review: better than you think
              Hawaii beaches review: better than you think
              Hawaii beaches review: better than you think
              Hawaii beaches review: better than you think
              Hawaii beaches review: better than you think
              Hawaii beaches review: better than you think
              Hawaii beaches review: better than you think
              Hawaii beaches review: better than you think
              Hawaii beaches review: better than you think
              Hawaii beaches review: better than you think
              Hawaii beaches review: better than you think
              Hawaii beaches review: better than you think
              Hawaii beaches review: better than you think
            </Text>
          </Card>
          <Grid gutter="md">
            <Grid.Col>
              <Card p="md" radius="md" component="a" href="#" className=".card">
                <AspectRatio ratio={1920 / 1080}>
                  <Image src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=720&q=80" />
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
              <Card p="md" radius="md" component="a" href="#" className=".card">
                <AspectRatio ratio={1920 / 1080}>
                  <Image src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=720&q=80" />
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
              <Card p="md" radius="md" component="a" href="#" className=".card">
                <AspectRatio ratio={1920 / 1080}>
                  <Image src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=720&q=80" />
                </AspectRatio>
                <Text c="dimmed" size="xs" tt="uppercase" fw={700} mt="md">
                  September 9, 2022
                </Text>
                <Text className=".title" mt={5}>
                  Hawaii beaches review: better than you think
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
          <Card key={"article.title"} p="md" radius="md" component="a" href="#" className={".card"}>
            <AspectRatio ratio={1920 / 1080}>
              <Image src={"https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=720&q=80"} />
            </AspectRatio>
            <Text c="dimmed" size="xs" tt="uppercase" fw={700} mt="md">
              {"article.date"}
            </Text>
            <Text className={".title"} mt={5}>
              {"article.title"}
            </Text>
          </Card>

          <Card key={"article.title"} p="md" radius="md" component="a" href="#" className={".card"}>
            <AspectRatio ratio={1920 / 1080}>
              <Image src={"https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=720&q=80"} />
            </AspectRatio>
            <Text c="dimmed" size="xs" tt="uppercase" fw={700} mt="md">
              {"article.date"}
            </Text>
            <Text className={".title"} mt={5}>
              {"article.title"}
            </Text>
          </Card>

          <Card key={"article.title"} p="md" radius="md" component="a" href="#" className={".card"}>
            <AspectRatio ratio={1920 / 1080}>
              <Image src={"https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=720&q=80"} />
            </AspectRatio>
            <Text c="dimmed" size="xs" tt="uppercase" fw={700} mt="md">
              {"article.date"}
            </Text>
            <Text className={".title"} mt={5}>
              {"article.title"}
            </Text>
          </Card>

          <Card key={"article.title"} p="md" radius="md" component="a" href="#" className={".card"}>
            <AspectRatio ratio={1920 / 1080}>
              <Image src={"https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=720&q=80"} />
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


      {/* <ColorSchemeToggle /> */}

    </>
  );
}
