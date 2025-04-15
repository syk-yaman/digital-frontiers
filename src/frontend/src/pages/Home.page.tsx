import '@mantine/carousel/styles.css';
import { Text, Container, Image, Space, Center, Badge, Card, Group, Grid, SimpleGrid, Flex, Avatar, AspectRatio, Overlay, Box } from '@mantine/core';

import React, { useEffect, useState } from 'react';

import 'maplibre-gl/dist/maplibre-gl.css';

import './Home.page.css'
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '@/config';
import { Notifications, notifications } from '@mantine/notifications';
import axiosInstance from '@/utils/axiosInstance';
import { DatasetCard } from '@/components/DatasetCard';


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

export function HomePage() {
  const PRIMARY_COL_HEIGHT = '600px';
  const SECONDARY_COL_HEIGHT = `calc(${PRIMARY_COL_HEIGHT} / 2 - var(--mantine-spacing-md) / 2)`;

  const [dataItems, setDataItems] = useState<DatasetItem[]>([]); // Store fetched data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [imageSrc, setImageSrc] = useState('/imgs/qeop-hero7.jpg'); // Initial image source
  const [isFading, setIsFading] = useState(false);

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
          dataOwnerPhoto: item.dataOwnerPhoto || 'https://via.placeholder.com/100', // Placeholder if missing
          description: item.description,
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
                />
              ))}
            </Flex>
          </section>

          <Text mt="3rem" ta="center" className='title' c="white" >Latest showcases</Text>
          <Text ta="center" size="s" c="white" >Browse the latest showcases related to our datasets </Text>
          <Space h="md" />
          <Space h="md" />

          <Container px={0} size="100rem" pr={'5%'} pl={'5%'}>
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
              <Card style={{ backgroundColor: '#1F5754' }} p="md" radius="md" component="a" href="#" className=".card">
                <AspectRatio ratio={1920 / 1080}>
                  <Image src="https://custom-images.strikinglycdn.com/res/hrscywv4p/image/upload/c_limit,fl_lossy,h_9000,w_1200,f_auto,q_auto/370342/567505_905654.jpg" />
                </AspectRatio>
                <Text c="#d1bd51" size="xs" tt="uppercase" fw={700} mt="md">
                  September 9, 2022
                </Text>
                <Text c="white" size="xl" mt={5}>
                  Mosa, a QEOP-based Startup to Enhance Bike Parking Security with Intelligent Solution
                </Text>
                <Text c="#dedede" mt={5}>
                  As urban environments strive for sustainability, traditional bike racks and CCTV cameras often fall short in truly promoting cycling.
                  But you see the bigger picture. Whether you’re a property manager, transport planner, or landlord, you understand the transformative
                  potential of cycling and are eager to overcome the challenges that discourage two-wheeled transportation.
                  Mosa shares your commitment to innovation and creating greener, more sustainable urban spaces.
                  By integrating our intelligent, retrofit solutions, you can enhance bike parking security, encourage cycling,
                  and make a meaningful impact on your community’s future.
                </Text>
              </Card>
              <Grid gutter="md">
                <Grid.Col>
                  <Card style={{ backgroundColor: '#1F5754' }} p="md" radius="md" component="a" href="#" className=".card">
                    <AspectRatio ratio={1920 / 1080}>
                      <Image src="https://www.queenelizabetholympicpark.co.uk/sites/default/files/styles/banner_image_contained/public/banner-slide-image/school-streets_summer-2023_sensors%20%281%29.jpg?itok=HRGamTq4" />
                    </AspectRatio>
                    <Text c="#d1bd51" size="xs" tt="uppercase" fw={700} mt="md">
                      October 17, 2023
                    </Text>
                    <Text c="white" size="l" mt={5}>
                      Air Quality improves at Hackney School after School Streets Initiative Introduced
                    </Text>
                  </Card>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Card style={{ backgroundColor: '#1F5754' }} p="md" radius="md" component="a" href="#" className=".card">
                    <AspectRatio ratio={1920 / 1080}>
                      <Image src="https://cdn.prod.website-files.com/65d39eed3647e480025d413a/66d5a623c612ae2b74e5088d_product-screenshot-energy-report.png" />
                    </AspectRatio>
                    <Text c="#d1bd51" size="xs" tt="uppercase" fw={700} mt="md">
                      September 9, 2022
                    </Text>
                    <Text c="white" size="m" mt={5}>
                      MapMortar, Plan, track and scale your path to Net Zero
                    </Text>
                  </Card>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Card style={{ backgroundColor: '#1F5754' }} p="md" radius="md" component="a" href="#" className=".card">
                    <AspectRatio ratio={1920 / 1080}>
                      <Image src="https://connected-environments.org/wp-content/uploads/2019/11/echobox.jpg" />
                    </AspectRatio>
                    <Text c="#d1bd51" size="xs" tt="uppercase" fw={700} mt="md">
                      November 5, 2019
                    </Text>
                    <Text c="white" size="m" mt={5}>
                      Shazam for bats: Internet of Things for biodiversity monitoring
                    </Text>
                  </Card>
                </Grid.Col>
              </Grid>
            </SimpleGrid>
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
