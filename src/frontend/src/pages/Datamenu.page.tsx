import { HeaderMegaMenu } from '@/components/Header/HeaderMegaMenu';
import { ColorSchemeToggle } from '../components/ColorSchemeToggle/ColorSchemeToggle';
import { Welcome } from '../components/Welcome/Welcome';
import { FooterLinks } from '@/components/Footer/FooterLinks';
import { Carousel } from '@mantine/carousel';
import '@mantine/carousel/styles.css';
import { Text, Anchor, Breadcrumbs, Image, Center, rem, SegmentedControl, Space, Avatar, Badge, Group, Card, Flex } from '@mantine/core';

import React, { useEffect, useMemo, useState } from 'react';
import DeckGL from '@deck.gl/react';
import { DeckProps, MapViewState } from '@deck.gl/core';
import { GeoJsonLayer, LineLayer, ScatterplotLayer } from '@deck.gl/layers';

import { BASEMAP } from '@deck.gl/carto';
import { Map, Popup, useControl } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';

import '../style.css'
import './Datamenu.page.css';

// ✅ Types are available here
import { FeaturesGrid } from '@/components/FeaturesGrid/FeaturesGrid';
import { MapboxOverlay as DeckOverlay, MapboxOverlayProps } from '@deck.gl/mapbox';
import { Link } from 'react-router-dom';
import { IconEye, IconCode, IconExternalLink, IconMap, IconList } from '@tabler/icons-react';
import { Feature, FeatureCollection, Position } from 'geojson';
import { loadInBatches } from '@loaders.gl/core';
import { ShapefileLoader } from '@loaders.gl/shapefile';
import proj4 from 'proj4';
import { Notifications, notifications } from '@mantine/notifications';
import axiosInstance from '@/utils/axiosInstance';
import { API_BASE_URL } from '@/config';
import { DatasetCard } from '@/components/DatasetCard';

const INITIAL_VIEW_STATE = {
  longitude: -0.0167, // Longitude for Olympic Park
  latitude: 51.5412, // Latitude for Olympic Park
  zoom: 14.1, // Zoom in closer to Olympic Park
};

function DeckGLOverlay(props: MapboxOverlayProps) {
  const overlay = useControl(() => new DeckOverlay(props));
  overlay.setProps(props);
  return null;
}

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
  id: number,
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

  const [dataItems, setDataItems] = useState<DatasetItem[]>([]); // For List
  const [geoJsonData, setGeoJsonData] = useState<FeatureCollection | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Compute mappedData using useMemo to ensure it persists across view switches
  const mappedData = useMemo(() => {
    return dataItems.flatMap((item) =>
      item.locations.map((location) => ({
        id: item.id,
        position: [location.lon, location.lat], // Longitude, Latitude
        title: item.name,
        image: item.sliderImages.length > 0 ? item.sliderImages[0].fileName : 'https://via.placeholder.com/150',
        owner: item.dataOwnerName,
        description: item.description,
        tags: item.tags.map((tag) => tag.name), // Extract only tag names
      }))
    );
  }, [dataItems]);

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

    axiosInstance
      .get(`/datasets`)
      .then((response) => {
        const data = response.data;
        // Transform API response to match `dataItems` format
        const formattedData = data.map((item: DatasetItem) => ({
          id: item.id,
          sliderImages: item.sliderImages,
          name: item.name,
          dataOwnerName: item.dataOwnerName,
          dataOwnerPhoto: item.dataOwnerPhoto || 'https://via.placeholder.com/100', // Placeholder if missing
          description: item.description,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          tags: item.tags.map((tag) => ({
            name: tag.name,
            icon: '',
          })),
          locations: item.locations,
        }));

        setDataItems(formattedData);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        notifications.show({
          title: 'Error',
          message: 'Failed to load data: ' + error.message,
          color: 'red',
        });
        setError(error.message);
        setLoading(false);
      });

  }, []);

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
      onClick: (info) => setPopupInfo(info.object),
    }),

  ], [mappedData, geoJsonData]);

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
      <div
        style={{
          display: view === 'map' ? 'block' : 'none', // Hide or show the map
          height: '900px', // Set height
          width: '80%',  // Set width
          border: '0px solid black',
          margin: '40px auto', // Center the div
          position: 'relative',
        }}
      >
        <Map
          initialViewState={INITIAL_VIEW_STATE}
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
          interactive={true}
          dragPan={true}
          scrollZoom={true}
          onClick={(e) => {
            // Close popup when clicking on the map
            if (!e.features) {
              setPopupInfo(null);
            }
          }}
        >
          {popupInfo && (
            <Popup
              key={popupInfo.id}
              longitude={popupInfo.position[0]}
              latitude={popupInfo.position[1]}
              closeOnClick={true}
              anchor="top"
              style={{ zIndex: 10 }} /* position above deck.gl canvas */

              onClose={() => setPopupInfo(null)}
            >
              <Group gap="sm" mb="sm">
                <Avatar src={popupInfo.image} size={40} />
                <div>
                  <Link
                    to={`/dataset/${popupInfo.id}`}
                    style={{ fontSize: 16, color: '#000000', fontWeight: 'bold' }}
                  >
                    {popupInfo.title}
                  </Link>
                  <Text fz="sm" c="#333333">
                    {popupInfo.owner}
                  </Text>
                </div>
              </Group>
              <Text c="#333333">{popupInfo.description}</Text>
              <Group gap="xs" mt="sm">
                {popupInfo.tags.map((tag, index) => (
                  <Badge key={index} size="sm">
                    {tag}
                  </Badge>
                ))}
              </Group>
            </Popup>
          )}
          <DeckGLOverlay layers={layers} /*interleaved*/ />
        </Map>
      </div>

      {view === 'list' && (
        <Flex
          gap="xl"
          justify="center"
          align="center"
          style={{ maxWidth: '1600px', margin: '0 auto' }}
          wrap="wrap"
          mb={'xl'}
          mr={'xl'}
          ml={'xl'}
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
      )}
      <Notifications />

    </>
  );
}


