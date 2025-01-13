import '@mantine/carousel/styles.css';
import { Text, Container, Image, Space, Center, Badge, Card, Group, Grid, SimpleGrid, Flex, Avatar, AspectRatio, Overlay, Box } from '@mantine/core';

import React, { useEffect, useState } from 'react';

import 'maplibre-gl/dist/maplibre-gl.css';

import './Home.page.css'

const cardData = [
  {
    id: 1,
    image: '/imgs/echobox.jpg',
    title: 'Bats activity in the QEOP',
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
    image: '/imgs/echobox.jpg',
    title: 'Bats activity in the QEOP',
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
    id: 3,
    image: '/imgs/echobox.jpg',
    title: 'Bats activity in the QEOP',
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
];

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

export function HomePage() {
  const PRIMARY_COL_HEIGHT = '600px';
  const SECONDARY_COL_HEIGHT = `calc(${PRIMARY_COL_HEIGHT} / 2 - var(--mantine-spacing-md) / 2)`;

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

          <Text ta="center" className='title' c="white" fw={500} >A new way for data collaboration in the Queen Elizabeth Olympic Park</Text>
          <Text ta="center" size="lg" c="white" style={{ "marginLeft": "50px", "marginRight": "50px" }} >
            This platform unifies all the data in and around the park in one place. Everyone can access live data and use it, contribute data to be used, and share success stories about how they used the data—a platform to innovate, collaborate and push the digital frontiers further.
          </Text>
          <Space h="xl" />
          <Space h="xl" />
          <Space h="xl" />
          <Space h="xl" />


          <Text ta="center" className='title' c="white" >Featured data items</Text>
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
              {cardData.map((card) => (
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
                      Last reading: {card.lastReading}
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
                        color="#18cca5"
                        leftSection={tag.icon}
                      >
                        {tag.text}
                      </Badge>
                    ))}
                  </Group>
                </Card>
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
                <Text c="white" size="xs" tt="uppercase" fw={700} mt="md">
                  September 9, 2022
                </Text>
                <Text c="white" className=".title2" mt={5}>
                  Lorem Ipsum has been the industrys standard dummy text ever since the 1500s
                </Text>
                <Text c="white" className=".title" mt={5}>
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

      {/* <ColorSchemeToggle /> */}

    </>
  );
}
