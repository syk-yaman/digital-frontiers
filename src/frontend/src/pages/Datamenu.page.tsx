import '@mantine/carousel/styles.css';
import { Text, Anchor, Breadcrumbs, Image, Center, rem, SegmentedControl, Space, Avatar, Badge, Group, Card, Flex, Button, MultiSelect } from '@mantine/core';

import React, { useEffect, useMemo, useState, useContext } from 'react';
import { GeoJsonLayer, LineLayer, ScatterplotLayer, TextLayer } from '@deck.gl/layers';

import { Map, Popup, useControl } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';

import '../style.css'
import './Datamenu.page.css';

import { MapboxOverlay as DeckOverlay, MapboxOverlayProps } from '@deck.gl/mapbox';
import { Link, NavLink } from 'react-router-dom';
import { IconEye, IconCode, IconExternalLink, IconMap, IconList } from '@tabler/icons-react';
import { Feature, FeatureCollection, Position } from 'geojson';
import { loadInBatches } from '@loaders.gl/core';
import { ShapefileLoader } from '@loaders.gl/shapefile';
import proj4 from 'proj4';
import { Notifications, notifications } from '@mantine/notifications';
import axiosInstance from '@/utils/axiosInstance';
import { DatasetCard } from '@/components/DatasetCard';
import { AuthContext } from '@/context/AuthContext';

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
  icon: string;
  title: string;
  owner: string;
  description: string;
  tags: string[];
}

export function Datamenu() {
  const authContext = useContext(AuthContext); // Check if the user is signed in
  const isAuthenticated = authContext?.isAuthenticated ?? false;

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
        owner: item.dataOwnerName,
        description: item.description,
        tags: item.tags.map((tag) => tag.name), // Extract only tag names
        colour: item.tags.length > 0 ? item.tags[0].colour : [0, 200, 255], // Use the color of the first tag or default
        icon: item.tags.length > 0 ? item.tags[0].icon : "🏷️", // Use the color of the first tag or default
      }))
    );
  }, [dataItems]);

  // Gather all unique tags from dataItems
  const allTags = useMemo(() => {
    // Use globalThis.Map to ensure the built-in Map is used
    const tagMap = new (globalThis.Map as {
      new(): Map<string, { name: string; colour: string; icon: string }>;
    })();
    dataItems.forEach(item => {
      item.tags.forEach(tag => {
        if (!tagMap.has(tag.name)) {
          tagMap.set(tag.name, tag);
        }
      });
    });
    return Array.from(tagMap.values());
  }, [dataItems]);

  // State for selected tags
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Filtered mappedData based on selected tags
  const filteredMappedData = useMemo(() => {
    if (selectedTags.length === 0) return mappedData;
    return mappedData.filter(d =>
      d.tags.some(tag => selectedTags.includes(tag))
    );
  }, [mappedData, selectedTags]);

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
          datasetType: item.datasetType,
          dataOwnerName: item.dataOwnerName,
          dataOwnerPhoto: item.dataOwnerPhoto,
          description: item.description,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          tags: item.tags.map((tag) => ({
            name: tag.name,
            icon: tag.icon,
            colour: tag.colour,
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
      data: filteredMappedData, // <-- use filtered data
      getPosition: (d) => d.position,
      getFillColor: (d) => {
        if (typeof d.colour === 'string') {
          // Convert hex color to RGB array
          const hex = d.colour.replace('#', '');
          const bigint = parseInt(hex, 16);
          return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
        }
        return d.colour; // Default color
      },
      getRadius: 20,
      pickable: true,
      onClick: (info) => setPopupInfo(info.object),
      stroked: true, // Enable stroke
      getLineColor: [0, 0, 0], // Black stroke color
      lineWidthMinPixels: 2, // Stroke width
    }),
  ], [filteredMappedData, geoJsonData]);

  return (
    <>
      <Space h="md" />
      <Space h="md" />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingLeft: '40px', paddingRight: '40px' }}>
        <Breadcrumbs separator=">">
          {breadcrumbs.map((crumb) => (
            <Link to={crumb.path} key={crumb.path} className="breadcrumb-link">
              {crumb.label}
            </Link>
          ))}
        </Breadcrumbs>
        {isAuthenticated && (
          <Button variant="light" color="blue" component={NavLink} to="/add-dataset">
            Add Dataset
          </Button>
        )}
      </div>
      <Text ta="center" size="xl" c="blue">Data Menu</Text>
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
        {/* Floating tag filter */}
        <Card
          shadow="md"
          padding="md"
          radius="md"
          withBorder={true}
          style={{
            position: 'absolute',
            top: 20,
            right: 20,
            zIndex: 100,
            minWidth: 300,
            maxWidth: 300,
            background: 'rgba(49, 49, 49, 0.97)',
            borderColor: 'rgb(104, 104, 104)',
          }}
        >
          <Text c="white" fw={500} mb={8} size="sm">Filter by tags</Text>
          <MultiSelect
            data={allTags.map(tag => ({
              value: tag.name,
              label: `${tag.icon ? tag.icon + ' ' : ''}${tag.name}`,
            }))}
            value={selectedTags}
            onChange={setSelectedTags}
            placeholder="Select tags"
            clearable
            searchable
            maxDropdownHeight={200}
            size="sm"
          />
        </Card>
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
                <Text fz="xl">
                  {popupInfo.icon}
                </Text>
                <div>
                  <Link
                    to={`/dataset/${popupInfo.id}`}
                    style={{ fontSize: 16, color: '#000000', fontWeight: 'bold', textDecoration: 'none' } /* Remove underline */}
                  >
                    {popupInfo.title}
                  </Link>
                  <Text fz="sm" c="#333333">
                    {popupInfo.owner}
                  </Text>
                </div>
              </Group>
              <Group gap="xs" mt="sm" mb="sm">
                {popupInfo.tags.map((tag, index) => (
                  <Badge key={index} size="sm">
                    {tag}
                  </Badge>
                ))}
              </Group>
              <Text c="#333333">
                {popupInfo.description.length > 100
                  ? `${popupInfo.description.substring(0, 150)}...`
                  : popupInfo.description}
              </Text>
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
              isControlled={card.datasetType === 'controlled'}
            />
          ))}
        </Flex>
      )}
    </>
  );
}


