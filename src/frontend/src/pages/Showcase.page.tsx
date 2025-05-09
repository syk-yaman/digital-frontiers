import { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    Text,
    Breadcrumbs,
    Container,
    Flex,
    Space,
    Loader,
    Center,
    Title,
    Image,
    Group,
    Avatar,
    Card,
    Button,
    AspectRatio,
    Grid,
    Stack,
    Badge
} from '@mantine/core';
import { Carousel } from '@mantine/carousel';
import axiosInstance from '@/utils/axiosInstance';
import { notifications } from '@mantine/notifications';
import { API_BASE_URL } from '@/config';
import { IconExternalLink, IconCalendar, IconDatabase, IconMapPin } from '@tabler/icons-react';
// Import map-related dependencies
import { Map, Popup, useControl } from 'react-map-gl/maplibre';
import DeckGL from '@deck.gl/react';
import { ScatterplotLayer, GeoJsonLayer } from '@deck.gl/layers';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Feature, FeatureCollection, Position } from 'geojson';
import { loadInBatches } from '@loaders.gl/core';
import { ShapefileLoader } from '@loaders.gl/shapefile';
import proj4 from 'proj4';
import { MapboxOverlay as DeckOverlay, MapboxOverlayProps } from '@deck.gl/mapbox';

// Add DeckGLOverlay component for map integration
function DeckGLOverlay(props: MapboxOverlayProps) {
    const overlay = useControl(() => new DeckOverlay(props));
    overlay.setProps(props);
    return null;
}

interface ShowcaseLocation {
    id: number;
    lon: number;
    lat: number;
    description?: string;
    imageLink?: string;
    linkTitle?: string;
    linkAddress?: string;
}

interface ShowcaseSliderImage {
    id: number;
    fileName: string;
    isTeaser: boolean;
}

interface ShowcaseItem {
    id: number;
    title: string;
    description: string;
    youtubeLink?: string;
    createdAt: string;
    updatedAt: string;
    approvedAt?: string;
    sliderImages: ShowcaseSliderImage[];
    locations?: ShowcaseLocation[];
    user: {
        id: string;
        firstName: string;
        lastName: string;
        photoUrl?: string;
    };
    dataset?: {
        id: number;
        name: string;
    };
}

// Map view state configuration
const INITIAL_VIEW_STATE = {
    longitude: -0.0167, // Default longitude (Olympic Park)
    latitude: 51.5412,  // Default latitude
    zoom: 13.9,
};

interface PopupInfo {
    id?: number;
    position: [number, number];
    description?: string;
    imageLink?: string;
    linkTitle?: string;
    linkAddress?: string;
}

export function ShowcasePage() {
    const { id } = useParams<{ id: string }>();
    const [showcase, setShowcase] = useState<ShowcaseItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [geoJsonData, setGeoJsonData] = useState<FeatureCollection | null>(null);
    const [popupInfo, setPopupInfo] = useState<PopupInfo | null>(null);
    const [mappedLocations, setMappedLocations] = useState<any[]>([]);
    const [hasLocations, setHasLocations] = useState(false);

    useEffect(() => {
        if (!id) return;

        // Load boundary shapefile
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

        // Fetch showcase details
        axiosInstance
            .get(`/showcases/${id}`)
            .then((response) => {
                const showcaseData = response.data;
                setShowcase(showcaseData);

                // Prepare locations data for map display
                if (showcaseData.locations && showcaseData.locations.length > 0) {
                    setHasLocations(true);
                    const locations = showcaseData.locations.map((location: ShowcaseLocation) => ({
                        id: location.id,
                        position: [location.lon, location.lat],
                        description: location.description,
                        imageLink: location.imageLink,
                        linkTitle: location.linkTitle,
                        linkAddress: location.linkAddress,
                    }));
                    setMappedLocations(locations);
                }

                setLoading(false);
            })
            .catch((err) => {
                console.error('Error fetching showcase:', err);
                setError('Failed to load showcase. It may not exist or you may not have permission to view it.');
                notifications.show({
                    title: 'Error',
                    message: 'Failed to load showcase: ' + err.message,
                    color: 'red',
                });
                setLoading(false);
            });
    }, [id]);

    const breadcrumbs = [
        { label: 'Home', path: '/' },
        { label: 'Showcases', path: '/showcases' },
        { label: showcase?.title || 'Showcase Details', path: `/showcase/${id}` },
    ];

    // Create map layers using useMemo to avoid unnecessary re-renders
    const layers = useMemo(() => [
        geoJsonData &&
        new GeoJsonLayer({
            id: "shp-layer",
            data: geoJsonData,
            filled: true,
            extruded: false,
            getFillColor: [255, 255, 0, 50], // Semi-transparent yellow
            getLineColor: [255, 255, 0], // Yellow border
            lineWidthMinPixels: 2,
            pickable: true,
        }),
        new ScatterplotLayer({
            id: 'locations-layer',
            data: mappedLocations,
            getPosition: (d: any) => d.position,
            getFillColor: [0, 200, 255], // Color matching Datamenu page
            getRadius: 20,
            pickable: true,
            onClick: (info: any) => {
                if (info.object) {
                    setPopupInfo(info.object);
                }
            },
            onHover: (info: any) => {
                if (info.object) {
                    info.viewport.canvas.style.cursor = 'pointer';
                } else {
                    info.viewport.canvas.style.cursor = 'grab';
                }
            },
        }),
    ], [mappedLocations, geoJsonData]);

    if (loading) {
        return (
            <Center style={{ height: 'calc(100vh - 200px)' }}>
                <Loader size="xl" />
            </Center>
        );
    }

    if (error || !showcase) {
        return (
            <Container mt={50}>
                <Text color="red" size="lg" ta="center">
                    {error || 'Showcase not found'}
                </Text>
                <Center mt="xl">
                    <Button component={Link} to="/showcases">
                        Back to Showcases
                    </Button>
                </Center>
            </Container>
        );
    }

    // Extract YouTube video ID if there's a YouTube link
    let youtubeEmbedUrl = null;
    if (showcase.youtubeLink) {
        const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
        const match = showcase.youtubeLink.match(youtubeRegex);
        if (match && match[1]) {
            youtubeEmbedUrl = `https://www.youtube.com/embed/${match[1]}`;
        }
    }

    return (
        <Container fluid px="xl" py="xl" style={{ maxWidth: '1600px' }}>
            <Space h={60} />
            <div style={{ paddingLeft: '20px' }}>
                <Breadcrumbs separator=">">
                    {breadcrumbs.map((crumb) => (
                        <Link to={crumb.path} key={crumb.path} className="breadcrumb-link">
                            {crumb.label}
                        </Link>
                    ))}
                </Breadcrumbs>
            </div>

            <Grid gutter="xl" mt="xl">
                <Grid.Col span={{ base: 12, md: 8 }}>
                    {showcase.sliderImages && showcase.sliderImages.length > 0 && (
                        <Carousel
                            height={400}
                            withIndicators
                            loop
                            withControls={showcase.sliderImages.length > 1}
                        >
                            {showcase.sliderImages.map((image) => (
                                <Carousel.Slide key={image.id}>
                                    <Image
                                        src={`${API_BASE_URL}/uploads/${image.fileName}`}
                                        height={400}
                                        fit="cover"
                                        alt={showcase.title}
                                    />
                                </Carousel.Slide>
                            ))}
                        </Carousel>
                    )}

                    {youtubeEmbedUrl && (
                        <Card mt="lg" p="md" withBorder>
                            <Card.Section>
                                <AspectRatio ratio={16 / 9}>
                                    <iframe
                                        src={youtubeEmbedUrl}
                                        title="YouTube video player"
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    />
                                </AspectRatio>
                            </Card.Section>
                        </Card>
                    )}

                    <Title order={1} mt="xl">
                        {showcase.title}
                    </Title>

                    <Text mt="md" style={{ whiteSpace: 'pre-line' }}>
                        {showcase.description}
                    </Text>

                    {/* Add Map Section when locations exist */}
                    {hasLocations && (
                        <Card withBorder mt="xl">
                            <Title order={3} mb="md">Location Map</Title>
                            <div style={{ height: '500px', position: 'relative' }}>
                                <Map
                                    initialViewState={{
                                        longitude: mappedLocations[0]?.position[0] || INITIAL_VIEW_STATE.longitude,
                                        latitude: mappedLocations[0]?.position[1] || INITIAL_VIEW_STATE.latitude,
                                        zoom: INITIAL_VIEW_STATE.zoom,
                                    }}
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
                                    onClick={() => {
                                        // Close popup when clicking outside markers
                                        setPopupInfo(null);
                                    }}
                                >
                                    {popupInfo && (
                                        <Popup
                                            longitude={popupInfo.position[0]}
                                            latitude={popupInfo.position[1]}
                                            closeOnClick={true}
                                            anchor="top"
                                            style={{ zIndex: 10 }}
                                            onClose={() => setPopupInfo(null)}
                                        >
                                            <div style={{ maxWidth: '300px' }}>
                                                {popupInfo.description && (
                                                    <Text c="#333333" mb="xs">{popupInfo.description}</Text>
                                                )}
                                                {popupInfo.imageLink && (
                                                    <Image
                                                        src={popupInfo.imageLink}
                                                        alt="Location image"
                                                        height={150}
                                                        fit="cover"
                                                        radius="md"
                                                        mb="xs"
                                                    />
                                                )}
                                                {popupInfo.linkTitle && popupInfo.linkAddress && (
                                                    <Button
                                                        component="a"
                                                        href={popupInfo.linkAddress}
                                                        target="_blank"
                                                        leftSection={<IconExternalLink size={16} />}
                                                        size="sm"
                                                        variant="light"
                                                        fullWidth
                                                    >
                                                        {popupInfo.linkTitle}
                                                    </Button>
                                                )}
                                            </div>
                                        </Popup>
                                    )}
                                    <DeckGLOverlay layers={layers} />
                                </Map>
                            </div>
                        </Card>
                    )}
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 4 }}>
                    <Card withBorder>
                        <Stack>
                            <Title order={4}>About this project</Title>

                            <Group>
                                <Avatar
                                    src={showcase.user.photoUrl ? `${API_BASE_URL}/uploads/${showcase.user.photoUrl}` : undefined}
                                    size={50}
                                    radius="xl"
                                />
                                <div>
                                    <Text fw={500}>Created by</Text>
                                    <Text>{`${showcase.user.firstName} ${showcase.user.lastName}`}</Text>
                                </div>
                            </Group>

                            <Group>
                                <IconCalendar size={24} />
                                <div>
                                    <Text fw={500}>Date added</Text>
                                    <Text>{new Date(showcase.createdAt).toLocaleDateString()}</Text>
                                </div>
                            </Group>

                            {showcase.dataset && (
                                <Group>
                                    <IconDatabase size={24} />
                                    <div>
                                        <Text fw={500}>Related dataset</Text>
                                        <Link to={`/dataset/${showcase.dataset.id}`}>
                                            <Text c="blue">{showcase.dataset.name}</Text>
                                        </Link>
                                    </div>
                                </Group>
                            )}

                            {hasLocations && (
                                <Group>
                                    <IconMapPin size={24} />
                                    <div>
                                        <Text fw={500}>Locations</Text>
                                        <Text>This showcase has {mappedLocations.length} mapped location{mappedLocations.length !== 1 ? 's' : ''}</Text>
                                    </div>
                                </Group>
                            )}
                        </Stack>
                    </Card>

                    {showcase.youtubeLink && (
                        <Button
                            component="a"
                            href={showcase.youtubeLink}
                            target="_blank"
                            fullWidth
                            mt="md"
                            leftSection={<IconExternalLink size={18} />}
                        >
                            View on YouTube
                        </Button>
                    )}
                </Grid.Col>
            </Grid>
        </Container>
    );
}
