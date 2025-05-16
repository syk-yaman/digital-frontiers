import '@mantine/carousel/styles.css';
import { Text, Container, Image, Space, Center, Badge, Card, Group, Grid, SimpleGrid, Flex, Avatar, AspectRatio, Overlay, Box, Title, Button } from '@mantine/core';

import React, { useEffect, useState } from 'react';

import 'maplibre-gl/dist/maplibre-gl.css';

import './Home.page.css'
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '@/config';
import { Notifications, notifications } from '@mantine/notifications';
import axiosInstance from '@/utils/axiosInstance';
import { DatasetCard } from '@/components/DatasetCard';
import { HomeShowcaseCard } from '@/components/HomeShowcaseCard';

const partners = [
  {
    id: 1,
    title: 'University College London',
    date: '',
    imageUrl:
      'https://www.ucl.ac.uk/brand/sites/brand/files/styles/small_image/public/ucl-logo-black-on-grey.jpg?itok=ooOI6Tcx',
  },
  {
    id: 2,
    title: 'Queen Elizabeth Park',
    date: '',
    imageUrl:
      'https://www.stratfordcross.co.uk/globalassets/uk/stratford-cross/eat-drink-shop-play/logos/amenity_logos_queen-elizabeth.jpg?width=300&height=400&upscale=false&mode=max&quality=80',
  },
  {
    id: 3,
    title: 'Greater London Authority',
    date: '',
    imageUrl:
      'https://www.siriusopensource.com/sites/default/files/2020-04/gla_0.png',
  },
  {
    id: 4,
    title: 'Amazon Web Services',
    date: '',
    imageUrl:
      'https://i0.wp.com/experientialexecutive.com/wp-content/uploads/2023/02/AWS-Logo-Gray.png',
  },
];

interface DatasetItem {
  id: number;
  name: string;
  dataOwnerName: string;
  dataOwnerEmail: string;
  dataOwnerPhoto: string;
  datasetType: string;
  description: string;
  updateFrequency: number;
  updateFrequencyUnit: string;
  dataExample: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  links: any[]; // Replace 'any' with a proper type if you know the structure
  locations: any[];
  sliderImages: { id: number; fileName: string }[];
  tags: { id: number; name: string; colour: string; icon: string }[];
  lastReading: string;
}

interface ShowcaseItem {
  id: number;
  title: string;
  description: string;
  youtubeLink?: string;
  createdAt: string;
  sliderImages: { id: number; fileName: string; isTeaser: boolean }[];
  user: {
    id: string;
    firstName: string;
    lastName: string;
    photoUrl?: string;
  };
}

export function HomePage() {
  const PRIMARY_COL_HEIGHT = '600px';
  const SECONDARY_COL_HEIGHT = `calc(${PRIMARY_COL_HEIGHT} / 2 - var(--mantine-spacing-md) / 2)`;

  const [dataItems, setDataItems] = useState<DatasetItem[]>([]); // Store fetched data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [imageSrc, setImageSrc] = useState('/imgs/qeop-hero7.jpg'); // Initial image source
  const [isFading, setIsFading] = useState(false);

  const [latestShowcases, setLatestShowcases] = useState<ShowcaseItem[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsFading(true); // Start fading
      setTimeout(() => {
        setImageSrc('/imgs/qeop-hero8.jpg'); // New image source
        setIsFading(false); // Reset fade effect
      }, 500); // Duration of the fade-out effect
    }, 3000); // Delay before image change

    axiosInstance
      .get(`/datasets/recent`)
      .then((response) => {
        // Transform API response to match `dataItems` format
        const formattedData = response.data.map((item: DatasetItem) => ({
          id: item.id,
          sliderImages: item.sliderImages,
          name: item.name,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          dataOwnerName: item.dataOwnerName,
          dataOwnerPhoto: item.dataOwnerPhoto,
          description: item.description,
          datasetType: item.datasetType,
          tags: item.tags.map((tag) => ({
            name: tag.name,
            icon: '',
          })),
        }));

        setDataItems(formattedData);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        setError(error.message);
        notifications.show({
          title: 'Error',
          message: 'Failed to connect to server.',
          color: 'red',
        });
        setLoading(false);
      });

    // Fetch latest showcases
    axiosInstance.get('/showcases/latest')
      .then((response) => {
        setLatestShowcases(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching latest showcases:', error);
        notifications.show({
          title: 'Error',
          message: 'Failed to load latest showcases',
          color: 'red',
        });
        setLoading(false);
      });

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

        <div style={{ marginRight: '5%', marginLeft: '5%' }}>

          <Text ta="center" className='title' c="white" fw={500} >
            A Data Platform for <span style={{ color: '#FFC747' }}>Digital Innovators</span> to Collaborate, Test and Showcase</Text>
          <Text ta="center" size="lg" c="white" style={{ "marginLeft": "50px", "marginRight": "50px" }} >
            Digital Frontiers provides innovators with a set of curated data streams and product showcasing tools. <br />All data is hyperlocal, co-located in Queen Elizabeth Olympic Park and is ready for plug and play collaboration.
          </Text>
          <Space h="xl" />
          <Space h="xl" />
          <Space h="xl" />
          <Space h="xl" />


          <Text ta="center" className='title' c="white" >Featured datasets</Text>
          <Text ta="center" size="s" c="white" >Browse the featured datasets below. You can go to the data menu section and
            use an interactive map to explore the data. </Text>
          <Space h="md" />

          <section style={{ textAlign: 'left', padding: '2rem 0' }}>
            <Flex
              gap="lg"
              justify="center"
              align="center"
              style={{ maxWidth: '1600px', margin: '0 auto' }}
              wrap="wrap"
            >
              {dataItems.map((card) => (
                <DatasetCard
                  key={card.id}
                  id={card.id}
                  name={card.name}
                  dataOwnerName={card.dataOwnerName}
                  dataOwnerPhoto={card.dataOwnerPhoto}
                  description={card.description}
                  createdAt={card.createdAt}
                  sliderImages={card.sliderImages}
                  tags={card.tags}
                  isControlled={card.datasetType === 'controlled'}
                />
              ))}
            </Flex>
          </section>

          <Text mt="3rem" ta="center" className='title' c="white" >Latest showcases</Text>
          <Text ta="center" size="s" c="white" >Browse the latest showcases related to our datasets </Text>
          <Space h="md" />
          <Space h="md" />

          <Container px={0} size="100rem" pr={'5%'} pl={'5%'}>
            {latestShowcases.length > 0 ? (
              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                {/* First showcase - larger card */}
                {latestShowcases.length > 0 && (
                  <Card
                    style={{ backgroundColor: '#1F5754' }}
                    p="md"
                    radius="md"
                    component={Link}
                    to={`/showcase/${latestShowcases[0].id}`}
                    className=".card"
                  >
                    <AspectRatio ratio={1920 / 1080}>
                      <Image
                        src={
                          latestShowcases[0].sliderImages?.length > 0
                            ? `${API_BASE_URL}/uploads/${latestShowcases[0].sliderImages[0].fileName}`
                            : "/imgs/showcase-default.jpeg"
                        }
                      />
                    </AspectRatio>
                    <Text c="#d1bd51" size="xs" tt="uppercase" fw={700} mt="md">
                      {new Date(latestShowcases[0].createdAt).toLocaleDateString()}
                    </Text>
                    <Text c="white" size="xl" mt={5}>
                      {latestShowcases[0].title}
                    </Text>
                    <Text c="#dedede" mt={5}>
                      {latestShowcases[0].description.length > 300
                        ? `${latestShowcases[0].description.substring(0, 300)}...`
                        : latestShowcases[0].description
                      }
                    </Text>
                  </Card>
                )}

                {/* Right side grid for three smaller showcases */}
                <Grid gutter="md">
                  {/* Second showcase - top slot */}
                  {latestShowcases.length > 1 && (
                    <Grid.Col>
                      <Card
                        style={{ backgroundColor: '#1F5754' }}
                        p="md"
                        radius="md"
                        component={Link}
                        to={`/showcase/${latestShowcases[1].id}`}
                        className=".card"
                      >
                        <AspectRatio ratio={1920 / 1080}>
                          <Image
                            src={
                              latestShowcases[1].sliderImages?.length > 0
                                ? `${API_BASE_URL}/uploads/${latestShowcases[1].sliderImages[0].fileName}`
                                : "/imgs/showcase-default.jpeg"
                            }
                          />
                        </AspectRatio>
                        <Text c="#d1bd51" size="xs" tt="uppercase" fw={700} mt="md">
                          {new Date(latestShowcases[1].createdAt).toLocaleDateString()}
                        </Text>
                        <Text c="white" size="l" mt={5}>
                          {latestShowcases[1].title}
                        </Text>
                      </Card>
                    </Grid.Col>
                  )}

                  {/* Bottom grid for two small cards side by side */}
                  <Grid.Col span={6}>
                    {latestShowcases.length > 2 && (
                      <Card
                        style={{ backgroundColor: '#1F5754' }}
                        p="md"
                        radius="md"
                        component={Link}
                        to={`/showcase/${latestShowcases[2].id}`}
                        className=".card"
                      >
                        <AspectRatio ratio={1920 / 1080}>
                          <Image
                            src={
                              latestShowcases[2].sliderImages?.length > 0
                                ? `${API_BASE_URL}/uploads/${latestShowcases[2].sliderImages[0].fileName}`
                                : "/imgs/showcase-default.jpeg"
                            }
                          />
                        </AspectRatio>
                        <Text c="#d1bd51" size="xs" tt="uppercase" fw={700} mt="md">
                          {new Date(latestShowcases[2].createdAt).toLocaleDateString()}
                        </Text>
                        <Text
                          c="white"
                          size="m"
                          mt={5}
                          style={{
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {latestShowcases[2].title}
                        </Text>
                      </Card>
                    )}
                  </Grid.Col>
                  <Grid.Col span={6}>
                    {latestShowcases.length > 3 && (
                      <Card
                        style={{ backgroundColor: '#1F5754' }}
                        p="md"
                        radius="md"
                        component={Link}
                        to={`/showcase/${latestShowcases[3].id}`}
                        className=".card"
                      >
                        <AspectRatio ratio={1920 / 1080}>
                          <Image
                            src={
                              latestShowcases[3].sliderImages?.length > 0
                                ? `${API_BASE_URL}/uploads/${latestShowcases[3].sliderImages[0].fileName}`
                                : "/imgs/showcase-default.jpeg"
                            }
                          />
                        </AspectRatio>
                        <Text c="#d1bd51" size="xs" tt="uppercase" fw={700} mt="md">
                          {new Date(latestShowcases[3].createdAt).toLocaleDateString()}
                        </Text>
                        <Text
                          c="white"
                          size="m"
                          mt={5}
                          style={{
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {latestShowcases[3].title}
                        </Text>
                      </Card>
                    )}
                  </Grid.Col>
                </Grid>
              </SimpleGrid>
            ) : (
              <Text ta="center" c="white">No showcases available yet</Text>
            )}

            <Group justify="center" mt="xl">
              <Button
                component={Link}
                to="/showcases"
                variant="outline"
                color="#FFC747"
                size="md"
              >
                View All Showcases
              </Button>
            </Group>
          </Container>

          <Text mt="3rem" ta="center" className='title' c="white" >Partners</Text>
          <Container py="xl">
            <SimpleGrid cols={{ base: 1, sm: 4 }}>
              {partners.map((partner) => (
                <Card
                  key={partner.id}
                  style={{ backgroundColor: '#1F5754' }}
                  p="md"
                  radius="md"
                  component="a"
                  href="#"
                  className={'.card'}
                >
                  <AspectRatio ratio={1920 / 1080}>
                    <Image src={partner.imageUrl} />
                  </AspectRatio>
                  <Text c="white" size="xs" tt="uppercase" fw={700} mt="md">
                    {partner.date}
                  </Text>
                  <Text c="white" className={'.title'} mt={5}>
                    {partner.title}
                  </Text>
                </Card>
              ))}

            </SimpleGrid>
          </Container>
        </div >
      </div >
    </>
  );
}
