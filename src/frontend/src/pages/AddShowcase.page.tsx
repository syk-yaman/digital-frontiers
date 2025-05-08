import { useEffect, useState } from 'react';
import {
    Container, Button, Text, TextInput, Group, Space, Center, Textarea, FileInput,
    Flex, Loader, Alert, Tooltip, ActionIcon, Box, Select, Title, Paper, Switch,
    ColorSchemeScript, Stack, Divider
} from '@mantine/core';
import DeckGL from '@deck.gl/react';
import { GeoJsonLayer, ScatterplotLayer } from '@deck.gl/layers';
import { Map } from 'react-map-gl/maplibre';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { Dropzone } from '@mantine/dropzone';
import '@mantine/dropzone/styles.css';
import { ShapefileLoader } from '@loaders.gl/shapefile';
import { loadInBatches } from '@loaders.gl/core';
import { Feature, FeatureCollection, Position } from "geojson";
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '@/utils/axiosInstance';
import {
    IconAlertCircle, IconPhoto, IconTrash, IconUpload, IconX,
    IconCheck, IconMapPin, IconArrowRight, IconLink, IconStar
} from '@tabler/icons-react';
import proj4 from 'proj4';

// Map initial view - centered on London
const INITIAL_VIEW_STATE = {
    longitude: -0.0167,
    latitude: 51.5415,
    zoom: 13.4,
};

// Define projection for UK Ordnance Survey coordinates
proj4.defs([
    [
        "EPSG:27700",
        "+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 +x_0=400000 +y_0=-100000 +ellps=airy +datum=OSGB36 +units=m +no_defs",
    ],
]);

interface ShowcaseLocation {
    lon: number;
    lat: number;
    description?: string;
    imageLink?: string;
    linkTitle?: string;
    linkAddress?: string;
}

interface ShowcaseFormValues {
    title: string;
    description: string;
    youtubeLink?: string;
    datasetId?: number | null;
    sliderImages: { fileName: string; isTeaser: boolean }[];
    locations: ShowcaseLocation[];
}

export function AddShowcase() {
    const { id: showcaseId } = useParams();
    const [isEditMode, setIsEditMode] = useState(false);
    const [loadingShowcase, setLoadingShowcase] = useState(false);
    const [datasets, setDatasets] = useState<{ value: string; label: string }[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [geoJsonData, setGeoJsonData] = useState<FeatureCollection | null>(null);
    const [pins, setPins] = useState<ShowcaseLocation[]>([]);
    const [selectedLocationIndex, setSelectedLocationIndex] = useState<number | null>(null);
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
    const [filesToUpload, setFilesToUpload] = useState<File[]>([]);
    const [loading, setLoading] = useState(false);
    const [sliderImages, setSliderImages] = useState<{ fileName: string; isTeaser: boolean }[]>([]);
    const navigate = useNavigate();

    // Form setup
    const form = useForm<ShowcaseFormValues>({
        initialValues: {
            title: '',
            description: '',
            youtubeLink: '',
            datasetId: null,
            sliderImages: [],
            locations: []
        },
        validate: {
            title: (value) => value.trim().length < 3 ? 'Title must be at least 3 characters long' : null,
            description: (value) => value.trim().length < 50 ? 'Description must be at least 50 characters long' : null,
            youtubeLink: (value) => {
                if (!value) return null; // Optional field
                if (!value.includes('youtube.com/') && !value.includes('youtu.be/')) {
                    return 'Must be a valid YouTube link';
                }
                return null;
            },
            sliderImages: {
                // Ensure at least one image is marked as teaser
                isTeaser: (value, values) => {
                    if (!values.sliderImages || values.sliderImages.length === 0) {
                        return 'At least one image is required';
                    }
                    const hasTeaserImage = values.sliderImages.some(img => img.isTeaser);
                    return hasTeaserImage ? null : 'At least one image must be marked as teaser';
                }
            }
        }
    });

    // Load datasets for the dropdown
    useEffect(() => {
        axiosInstance.get('/datasets')
            .then(response => {
                setDatasets(response.data.map((dataset: any) => ({
                    value: dataset.id.toString(),
                    label: dataset.name
                })));
            })
            .catch(error => {
                console.error('Error loading datasets:', error);
                notifications.show({
                    title: 'Error',
                    message: 'Failed to load available datasets.',
                    color: 'red',
                });
            });
    }, []);

    // Load showcase data if in edit mode
    useEffect(() => {
        if (showcaseId) {
            setIsEditMode(true);
            setLoadingShowcase(true);

            axiosInstance.get(`/showcases/${showcaseId}`)
                .then(response => {
                    const showcase = response.data;

                    // Set pins/locations from showcase data
                    if (showcase.locations && showcase.locations.length > 0) {
                        setPins(showcase.locations.map((loc: ShowcaseLocation) => ({
                            lon: loc.lon,
                            lat: loc.lat,
                            description: loc.description || '',
                            imageLink: loc.imageLink || '',
                            linkTitle: loc.linkTitle || '',
                            linkAddress: loc.linkAddress || '',
                        })));
                    }

                    // Set form values
                    form.setValues({
                        title: showcase.title,
                        description: showcase.description,
                        youtubeLink: showcase.youtubeLink || '',
                        datasetId: showcase.dataset?.id || null,
                        sliderImages: showcase.sliderImages.map((img: any) => ({
                            fileName: img.fileName,
                            isTeaser: img.isTeaser
                        })),
                        locations: showcase.locations || []
                    });

                    // Set slider images state
                    setSliderImages(showcase.sliderImages);
                })
                .catch(error => {
                    console.error('Failed to load showcase:', error);
                    notifications.show({
                        title: 'Error',
                        message: 'Failed to load showcase data.',
                        color: 'red',
                    });
                })
                .finally(() => setLoadingShowcase(false));
        }
    }, [showcaseId]);

    // Load shapefile for the map
    useEffect(() => {
        async function loadShapefileFromURL() {
            const shpUrl = "/maps/MDC_Boundary_2024.shp";

            try {
                const batchIterator = (await loadInBatches(shpUrl, ShapefileLoader)) as AsyncIterable<{ data: Feature[] }>;
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
                    }
                }

                const geoJson: FeatureCollection = {
                    type: "FeatureCollection",
                    features,
                };

                setGeoJsonData(geoJson);
            } catch (error) {
                console.error("Error loading shapefile:", error);
            }
        }

        loadShapefileFromURL();
    }, []);

    // Handle file upload when files are selected
    useEffect(() => {
        if (filesToUpload.length > 0 && !loading) {
            handleUpload();
        }
    }, [filesToUpload, loading]);

    // Map click handler for adding/removing pins
    const handleMapClick = (info: any) => {
        if (!info || !info.coordinate) return;

        const [lng, lat] = info.coordinate;

        // If we have a selected location, don't add a new pin
        if (selectedLocationIndex !== null) return;

        // Add new pin
        const newPin = {
            lon: lng,
            lat,
            description: '',
            imageLink: '',
            linkTitle: '',
            linkAddress: ''
        };
        setPins([...pins, newPin]);

        // Select the newly added pin for editing
        setSelectedLocationIndex(pins.length);
    };

    // File drop handler
    const handleDrop = (acceptedFiles: File[]) => {
        setFilesToUpload([...filesToUpload, ...acceptedFiles]);
    };

    // Delete uploaded file
    const handleDeleteFile = (fileName: string) => {
        setSliderImages(sliderImages.filter((image) => image.fileName !== fileName));
        setUploadedFiles(uploadedFiles.filter((file) => file.name !== fileName));
    };

    // Upload files to the server
    const handleUpload = async () => {
        setLoading(true);
        try {
            const formData = new FormData();
            filesToUpload.forEach((file) => {
                formData.append('files', file, file.name);
            });

            const response = await axiosInstance.post('/showcases/upload', formData);
            const uploadedFileNames: string[] = response.data;

            // Add uploaded files to slider images with isTeaser=false by default
            const newImages = uploadedFileNames.map(fileName => ({
                fileName,
                isTeaser: false
            }));

            // If this is the first image, mark it as teaser
            if (sliderImages.length === 0 && newImages.length > 0) {
                newImages[0].isTeaser = true;
            }

            setSliderImages([...sliderImages, ...newImages]);

            // Update form values
            form.setFieldValue('sliderImages', [
                ...form.values.sliderImages,
                ...newImages
            ]);

            // Clear files to upload
            setFilesToUpload([]);

            notifications.show({
                title: 'Success',
                message: 'Files uploaded successfully',
                color: 'green',
            });
        } catch (error) {
            console.error('Error uploading files:', error);
            notifications.show({
                title: 'Error',
                message: 'Failed to upload files',
                color: 'red',
            });
        } finally {
            setLoading(false);
        }
    };

    // Update locations in form when pins change
    useEffect(() => {
        form.setFieldValue('locations', pins);
    }, [pins]);

    // Toggle teaser status of an image
    const toggleTeaserImage = (fileName: string) => {
        const updatedImages = sliderImages.map(img => ({
            ...img,
            isTeaser: img.fileName === fileName
        }));

        setSliderImages(updatedImages);
        form.setFieldValue('sliderImages', updatedImages);
    };

    // Handle form submission
    const handleSubmit = () => {
        const { hasErrors } = form.validate();
        if (hasErrors) return;

        setIsSubmitting(true);

        // Prepare form data
        const formData = {
            title: form.values.title,
            description: form.values.description,
            youtubeLink: form.values.youtubeLink || undefined,
            datasetId: form.values.datasetId ? Number(form.values.datasetId) : undefined,
            sliderImages: sliderImages,
            locations: pins,
        };

        // Determine if this is a create or update operation
        const request = isEditMode
            ? axiosInstance.put(`/showcases/${showcaseId}`, formData)
            : axiosInstance.post('/showcases', formData);

        request.then(response => {
            notifications.show({
                title: 'Success',
                message: `Showcase ${isEditMode ? 'updated' : 'created'} successfully.`,
                color: 'green',
                icon: <IconCheck size={16} />,
            });

            // Navigate back to showcases list
            setTimeout(() => navigate('/admin/showcases'), 1000);
        })
            .catch(error => {
                console.error('Error saving showcase:', error);
                notifications.show({
                    title: 'Error',
                    message: `Failed to ${isEditMode ? 'update' : 'create'} showcase: ${error.response?.data?.message || error.message}`,
                    color: 'red',
                    icon: <IconX size={16} />,
                });
            })
            .finally(() => setIsSubmitting(false));
    };

    // Update location details
    const updateLocationDetail = (field: keyof ShowcaseLocation, value: string) => {
        if (selectedLocationIndex === null) return;

        const updatedPins = [...pins];
        updatedPins[selectedLocationIndex] = {
            ...updatedPins[selectedLocationIndex],
            [field]: value
        };

        setPins(updatedPins);
    };

    // Delete a location pin
    const deleteSelectedLocation = () => {
        if (selectedLocationIndex === null) return;

        const updatedPins = pins.filter((_, index) => index !== selectedLocationIndex);
        setPins(updatedPins);
        setSelectedLocationIndex(null);
    };

    if (loadingShowcase) {
        return (
            <Center style={{ height: '80vh' }}>
                <Loader size="lg" color="blue" />
            </Center>
        );
    }

    return (
        <Container size="lg" py="xl">
            <Title order={1} mb="lg">{isEditMode ? 'Edit Showcase' : 'Create New Showcase'}</Title>

            <Paper p="md" withBorder mb="lg">
                <Title order={3} mb="md">Basic Information</Title>

                <TextInput
                    label="Title"
                    placeholder="Enter showcase title"
                    required
                    mb="md"
                    {...form.getInputProps('title')}
                />

                <Textarea
                    label="Description"
                    placeholder="Provide a detailed description of this showcase"
                    minRows={4}
                    required
                    mb="md"
                    {...form.getInputProps('description')}
                />

                <TextInput
                    label="YouTube Video Link (optional)"
                    placeholder="e.g., https://youtube.com/watch?v=..."
                    mb="md"
                    {...form.getInputProps('youtubeLink')}
                />

                <Select
                    label="Related Dataset (optional)"
                    placeholder="Select a dataset"
                    data={datasets}
                    clearable
                    mb="lg"
                    {...form.getInputProps('datasetId')}
                />
            </Paper>

            <Paper p="md" withBorder mb="lg">
                <Title order={3} mb="md">Showcase Images</Title>
                <Text size="sm" color="dimmed" mb="md">
                    Upload images for your showcase. At least one image must be marked as a teaser image,
                    which will be displayed prominently.
                </Text>

                <Dropzone
                    onDrop={handleDrop}
                    accept={['image/jpeg', 'image/png', 'image/gif']}
                    mb="md"
                    loading={loading}
                >
                    <Group justify="center" gap="xl" mih={180} style={{ pointerEvents: 'none' }}>
                        <Dropzone.Accept>
                            <IconUpload size={50} stroke={1.5} />
                        </Dropzone.Accept>
                        <Dropzone.Reject>
                            <IconX size={50} stroke={1.5} />
                        </Dropzone.Reject>
                        <Dropzone.Idle>
                            <IconPhoto size={50} stroke={1.5} />
                        </Dropzone.Idle>
                        <Stack align="center">
                            <Text size="xl" inline>
                                Drag images here or click to select files
                            </Text>
                            <Text size="sm" color="dimmed" inline>
                                Select multiple files to upload at once
                            </Text>
                        </Stack>
                    </Group>
                </Dropzone>

                {/* Display uploaded images */}
                {sliderImages.length > 0 && (
                    <Box my="md">
                        <Text fw={500} mb="sm">Uploaded Images:</Text>
                        <Flex wrap="wrap" gap="md">
                            {sliderImages.map((image, index) => (
                                <Paper
                                    withBorder
                                    p="xs"
                                    key={index}
                                    style={{
                                        width: '200px',
                                        position: 'relative',
                                        backgroundColor: image.isTeaser ? '#f0fff4' : undefined,
                                        borderColor: image.isTeaser ? 'green' : undefined,
                                    }}
                                >
                                    <Box mb="xs" style={{ height: '120px', overflow: 'hidden', position: 'relative' }}>
                                        <img
                                            src={`/uploads/${image.fileName}`}
                                            alt={`Showcase image ${index + 1}`}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                        {image.isTeaser && (
                                            <Box style={{
                                                position: 'absolute',
                                                top: 0,
                                                right: 0,
                                                background: 'green',
                                                padding: '2px 5px',
                                                borderBottomLeftRadius: '5px',
                                            }}>
                                                <Text size="xs" color="white">Teaser</Text>
                                            </Box>
                                        )}
                                    </Box>
                                    <Flex justify="space-between">
                                        <Tooltip label={image.isTeaser ? 'Already teaser' : 'Set as teaser image'}>
                                            <ActionIcon
                                                color={image.isTeaser ? 'green' : 'blue'}
                                                variant={image.isTeaser ? 'filled' : 'subtle'}
                                                onClick={() => toggleTeaserImage(image.fileName)}
                                                disabled={image.isTeaser}
                                            >
                                                <IconStar size={16} />
                                            </ActionIcon>
                                        </Tooltip>
                                        <ActionIcon color="red" onClick={() => handleDeleteFile(image.fileName)}>
                                            <IconTrash size={16} />
                                        </ActionIcon>
                                    </Flex>
                                </Paper>
                            ))}
                        </Flex>
                    </Box>
                )}

                {sliderImages.length === 0 && (
                    <Alert color="yellow" icon={<IconAlertCircle />}>
                        You must upload at least one image and mark it as a teaser.
                    </Alert>
                )}
            </Paper>

            <Paper p="md" withBorder mb="lg">
                <Title order={3} mb="md">Locations</Title>
                <Text size="sm" color="dimmed" mb="md">
                    Click on the map to add locations related to your showcase.
                    You can add details for each location after placing it on the map.
                </Text>

                <Box mb="md" style={{ height: '500px', position: 'relative' }}>
                    <DeckGL
                        initialViewState={INITIAL_VIEW_STATE}
                        controller={true}
                        onClick={handleMapClick}
                        layers={[
                            new ScatterplotLayer({
                                id: 'location-layer',
                                data: pins.map((pin, index) => ({
                                    ...pin,
                                    isSelected: index === selectedLocationIndex
                                })),
                                getPosition: (d) => [d.lon, d.lat],
                                getRadius: (d) => d.isSelected ? 15 : 10,
                                getFillColor: (d) => d.isSelected ? [255, 140, 0] : [0, 200, 255],
                                pickable: true,
                                onClick: (info) => {
                                    setSelectedLocationIndex(info.index);
                                    return true; // Stop event propagation
                                }
                            }),
                            geoJsonData &&
                            new GeoJsonLayer({
                                id: "boundary-layer",
                                data: geoJsonData,
                                filled: true,
                                extruded: false,
                                getFillColor: [255, 255, 0, 50],
                                getLineColor: [255, 255, 0],
                                lineWidthMinPixels: 2,
                                pickable: false,
                            }),
                        ]}
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
                            interactive={true}
                        />
                    </DeckGL>
                </Box>

                {/* Location details form */}
                {selectedLocationIndex !== null && (
                    <Paper withBorder p="md" mb="md">
                        <Flex justify="space-between" align="center" mb="xs">
                            <Text fw={500}>Location Details</Text>
                            <ActionIcon color="red" onClick={deleteSelectedLocation}>
                                <IconTrash size={16} />
                            </ActionIcon>
                        </Flex>

                        <TextInput
                            label="Description"
                            placeholder="What's at this location?"
                            mb="xs"
                            value={pins[selectedLocationIndex]?.description || ''}
                            onChange={(e) => updateLocationDetail('description', e.currentTarget.value)}
                        />

                        <TextInput
                            label="Image Link (optional)"
                            placeholder="URL to an image for this location"
                            mb="xs"
                            value={pins[selectedLocationIndex]?.imageLink || ''}
                            onChange={(e) => updateLocationDetail('imageLink', e.currentTarget.value)}
                        />

                        <TextInput
                            label="Link Title (optional)"
                            placeholder="Title for external link"
                            mb="xs"
                            value={pins[selectedLocationIndex]?.linkTitle || ''}
                            onChange={(e) => updateLocationDetail('linkTitle', e.currentTarget.value)}
                        />

                        <TextInput
                            label="Link Address (optional)"
                            placeholder="URL for external resource"
                            mb="xs"
                            value={pins[selectedLocationIndex]?.linkAddress || ''}
                            onChange={(e) => updateLocationDetail('linkAddress', e.currentTarget.value)}
                        />

                        <Button
                            mt="sm"
                            onClick={() => setSelectedLocationIndex(null)}
                            leftSection={<IconCheck size={16} />}
                        >
                            Done
                        </Button>
                    </Paper>
                )}

                {pins.length === 0 && (
                    <Alert color="blue" icon={<IconMapPin />}>
                        Click on the map to add locations. Locations are optional.
                    </Alert>
                )}
            </Paper>

            <Group justify="center" mt="xl">
                <Button
                    variant="default"
                    onClick={() => navigate('/admin/showcases')}
                    disabled={isSubmitting}
                >
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmit}
                    loading={isSubmitting}
                    rightSection={<IconArrowRight size={16} />}
                    disabled={sliderImages.length === 0}
                >
                    {isEditMode ? 'Update Showcase' : 'Create Showcase'}
                </Button>
            </Group>
        </Container>
    );
}
