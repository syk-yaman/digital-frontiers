import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
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
  Loader,
} from '@mantine/core';
import { Carousel } from '@mantine/carousel';
import { IconClock, IconUser, IconLicense, IconCopy, IconReload } from '@tabler/icons-react';
import { Map, Popup, useControl } from 'react-map-gl/maplibre';
import { GeoJsonLayer, ScatterplotLayer } from '@deck.gl/layers';
import DeckGL from '@deck.gl/react';
import { BASEMAP } from '@deck.gl/carto';
import 'maplibre-gl/dist/maplibre-gl.css';
import '../style.css';
import { Feature, FeatureCollection, Position } from 'geojson';
import { loadInBatches } from '@loaders.gl/core';
import proj4 from 'proj4';
import { ShapefileLoader } from '@loaders.gl/shapefile';
import { API_BASE_URL } from '@/config';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';

const INITIAL_VIEW_STATE = {
  longitude: -0.0167,
  latitude: 51.5412,
  zoom: 13.9,
};

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
  links: { id: number; title: string; url: string }[]; // Replace 'any' with a more specific type if possible
  locations: any[];
  sliderImages: { id: number; fileName: string }[];
  tags: { id: number; name: string; colour: string; icon: string }[];
  lastReading: string;
}

interface Location {
  id: number; position: [number, number]; color: [number, number, number];
}


export function Dataitem() {
  const { id } = useParams<{ id: string }>(); // Extract ID from URL
  const defaultDatasetItem: DatasetItem = {
    id: 0,
    name: 'Default Dataset',
    dataOwnerName: 'Owner Name',
    dataOwnerEmail: 'owner@example.com',
    dataOwnerPhoto: '', // You can provide a default photo URL if you like
    datasetType: 'Default Type',
    description: 'This is a default dataset description.',
    updateFrequency: 1,
    updateFrequencyUnit: 'Day',
    dataExample: '', // Example data URL if needed
    createdAt: '2025-03-07T00:00:00Z',
    updatedAt: '2025-03-07T00:00:00Z',
    deletedAt: null,
    links: [],
    locations: [
      {
        id: 1,
        position: [-0.0167, 51.5412], // Random position near London
        color: [255, 0, 0], // Red
      },
    ],
    sliderImages: [],
    tags: [],
    lastReading: '2025-03-07T00:00:00Z',
  };

  const [dataset, setDataset] = useState<DatasetItem>(defaultDatasetItem);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [geoJsonData, setGeoJsonData] = useState<FeatureCollection | null>(null);
  const [mappedData, setMappedData] = useState([]); //For map

  useEffect(() => {

    async function loadShapefileFromURL() {
      const shpUrl = "/maps/MDC_Boundary_2024.shp";

      try {
        console.log("📡 Fetching SHP from:", shpUrl);

        const batchIterator = (await loadInBatches(shpUrl, ShapefileLoader)) as AsyncIterable<{ data: Feature[] }>;
        console.log("🔄 Processing SHP Batches:", batchIterator);

        const features: Feature[] = [];

        for await (const batch of batchIterator) {
          if (batch && Array.isArray(batch.data)) {
            for (const feature of batch.data) {
              if (feature.geometry.type === "Polygon") {
                feature.geometry.coordinates = feature.geometry.coordinates.map((ring) =>
                  ring.map(([x, y]) => proj4("EPSG:27700", "EPSG:4326", [x, y]) as Position)
                );
              } else if (feature.geometry.type === "MultiPolygon") {
                feature.geometry.coordinates = feature.geometry.coordinates.map((polygon) =>
                  polygon.map((ring) =>
                    ring.map(([x, y]) => proj4("EPSG:27700", "EPSG:4326", [x, y]) as Position)
                  )
                );
              }
            }
            console.log("🔹 Processed SHP Batch Data:", batch.data);
            features.push(...batch.data);
          } else {
            console.warn("⚠️ Unexpected batch format:", batch);
          }
        }

        const geoJson: FeatureCollection = {
          type: "FeatureCollection",
          features,
        };

        console.log("✅ Successfully Loaded GeoJSON:", geoJson);
        setGeoJsonData(geoJson);
      } catch (error) {
        console.error("❌ Error loading SHP:", error);
      }
    }

    loadShapefileFromURL();

    fetch(`${API_BASE_URL}/datasets/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch dataset');
        return res.json();
      })
      .then((data: DatasetItem) => {
        setDataset(data);

        const dddd = data.locations.map(location => ({
          position: [location.lon, location.lat], // Longitude, Latitude
        })) as any;

        setMappedData(dddd);


        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);



  // Function to copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const breadcrumbs = [
    { label: 'Home', path: '/' },
    { label: 'Data Menu', path: '/data-menu' },
    { label: 'Data Item', path: '#' },
  ];

  const layers = useMemo(() => [
    geoJsonData &&
    new GeoJsonLayer({
      id: "shp-layer",
      data: geoJsonData,
      filled: true,
      extruded: false,
      getFillColor: [255, 255, 0, 50], // 🔹 Semi-transparent yellow
      getLineColor: [255, 255, 0], // 🔹 Bright yellow border
      lineWidthMinPixels: 2,
      pickable: true,
    }),
    new ScatterplotLayer({
      id: 'deckgl-circle',
      data: mappedData,  // ✅ Ensure it's updated dynamically
      getPosition: (d) => d.position,
      getFillColor: [0, 200, 255],
      getRadius: 20,
      pickable: true,
    }),

  ], [mappedData, geoJsonData]);


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
          {dataset.name}
        </Text>

        {/* Badges */}
        <Group align="center" mt="md">
          {/* Badges Section */}
          <Group align="left" >
            {dataset.tags.map(tag => (
              <Badge key={tag.id} variant="outline" color={tag.colour == "#000000" ? "#c6ff00" : tag.colour}>
                {tag.name}
              </Badge>
            ))}
          </Group>

          {/* Last Updated Section */}
          <Group style={{ marginLeft: 'auto' }}>
            <IconClock size={20} color='#FFC747' />
            <Text>Last updated: {dataset.updatedAt}</Text>
          </Group>
        </Group>

        {/* Image Slider */}
        <Carousel mx="auto" mt="lg" withIndicators>
          {dataset.sliderImages.length > 0 ? (
            dataset.sliderImages.map(img => (
              <Carousel.Slide key={img.id}>
                <Image src={`${API_BASE_URL}/uploads/` + img.fileName} alt="Dataset Image" />
              </Carousel.Slide>
            ))
          ) : (
            <Carousel.Slide>
              <Image src={'/imgs/dataset-default.jpeg'} alt="Default Dataset Image" />
            </Carousel.Slide>
          )}
        </Carousel>

        {/* Provider Info */}
        <Group mt={'xs'} align="center" style={{ width: '100%' }}>
          {/* Provider */}
          <Group>
            <IconUser size={20} color="#d7bf3c" />
            <Text>Owner: {dataset.dataOwnerName}</Text>
          </Group>

          {/* License */}
          <Group>
            <IconLicense size={20} color="#d7bf3c" />
            <Text>Type: {dataset.datasetType}</Text>
          </Group>
          <Group>
            <IconReload size={20} color="#d7bf3c" />
            <Text>Update Frequency: {dataset.updateFrequency} {dataset.updateFrequencyUnit}</Text>
          </Group>
        </Group>

        <Text mt='xl' ta="center" className='title' c="white" >Description</Text>


        {/* Dataset Description */}
        <Text ta="left" mt="lg" mx="auto" >
          {dataset.description}</Text>



        <Text mt='xl' ta="center" className='title' c="white" >Dataset locations</Text>

        {/* Map Section */}
        <div
          style={{
            height: '800px',
            width: '100%',
            marginTop: '10px',
            position: 'relative',
          }}
        >
          <DeckGL
            initialViewState={INITIAL_VIEW_STATE}
            layers={layers}
            controller={true} // Enables dragging, zooming, and panning
          >
            <Map
              mapStyle={{
                version: 8,
                sources: {
                  'esri-world-imagery': {
                    type: 'raster',
                    tiles: [
                      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
                    ],
                    tileSize: 256,
                  },
                },
                layers: [
                  {
                    id: 'esri-world-imagery',
                    type: 'raster',
                    source: 'esri-world-imagery',
                  },
                ],
              }}
              interactive={true} // Ensure interactivity

            />
          </DeckGL>
        </div>

        {/* Links Section */}
        <Center mt="lg">
          <Group align="center" >
            {/* Iterate through dataset.links and display each link with a button */}
            {dataset.links.map((link, index) => (
              <Group key={index} align="center">
                {/* Title for the link */}
                <Text size="sm" >{link.title}</Text>

                {/* TextInput and Button in a Group */}
                <Group align="center">
                  <TextInput
                    value={link.url}
                    readOnly
                    style={{ width: 300 }}
                  />
                  <Button
                    variant="outline"
                    onClick={() => navigator.clipboard.writeText(link.url)}
                    style={{ height: 36 }} // Ensuring button height matches TextInput
                  >
                    Copy
                  </Button>
                </Group>
              </Group>
            ))}
          </Group>
        </Center>


        <Text mt="xl" ta="center" className="title" c="white">Data sample</Text>
        <Center mb="xl" mt="lg">
          <SyntaxHighlighter language="auto" style={atomOneDark}>
            {dataset.dataExample.trim() || 'No data example provided'}
          </SyntaxHighlighter>
        </Center>
      </Container>
    </>
  );
}


