import { useEffect, useState } from 'react';
import {
    Container, Stepper, Button, Text, TextInput, Select, Checkbox, Group, Space, Center, Textarea, FileInput,
    List, Flex, Loader,
    Alert,
    Tooltip,
    ActionIcon,
    TagsInput
} from '@mantine/core';
import DeckGL from '@deck.gl/react';
import { GeoJsonLayer, ScatterplotLayer } from '@deck.gl/layers';
import { Map, MapLayerMouseEvent } from 'react-map-gl/maplibre';
import { TagsCreatable } from '@/components/TagsCreatable';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark, atomOneLight } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { IconAlertCircleOff, IconAlertTriangleOff, IconArrowAutofitRight, IconBlocks, IconBusStop, IconCheck, IconCheckbox, IconCircleX, IconCloudCheck, IconCloudNetwork, IconCopyCheck, IconError404, IconFileCheck, IconHttpConnect, IconLockCheck, IconLockQuestion, IconMapQuestion, IconNetwork, IconNetworkOff, IconPhoto, IconPlugConnected, IconQuestionMark, IconTrash, IconUpload, IconX } from '@tabler/icons-react';
import { Dropzone, IMAGE_MIME_TYPE } from '@mantine/dropzone';
import '@mantine/dropzone/styles.css';
import { ShapefileLoader } from '@loaders.gl/shapefile';
import { load, loadInBatches } from '@loaders.gl/core';
import { Feature, FeatureCollection, Position } from "geojson";
import proj4 from 'proj4';
import { useForm } from '@mantine/form';
import { API_BASE_URL } from '@/config';
import { notifications, Notifications } from '@mantine/notifications';
import '@mantine/notifications/styles.css';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '@/utils/axiosInstance';


const INITIAL_VIEW_STATE = {
    longitude: -0.0167,
    latitude: 51.5415,
    zoom: 13.4,
};

proj4.defs([
    [
        "EPSG:27700",
        "+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 +x_0=400000 +y_0=-100000 +ellps=airy +datum=OSGB36 +units=m +no_defs",
    ],
]);

interface Tag {
    id?: number;
    name: string;
    color: string;
    icon?: string;
}

interface Link {
    url: string;
    title: string;
}

export function AddDataitemPage() {
    const [activeStep, setActiveStep] = useState(1);
    const [dataSample, setDataSample] = useState('');
    const [links, setLinks] = useState<Link[]>([]);
    const [pins, setPins] = useState<{ position: [number, number]; radius: number }[]>([]);
    const [availableTags, setAvailableTags] = useState<Tag[]>([]);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [sliderImages, setSliderImages] = useState<string[]>([]);

    const [mqttConnectionLoading, setMqttConnectionLoading] = useState(false);
    const [mqttConnectionSuccess, setMqttConnectionSuccess] = useState(false);
    const [mqttConnectionError, setMqttConnectionError] = useState<string | null>(null);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionSuccess, setSubmissionSuccess] = useState(false);
    const navigate = useNavigate();


    const [formData, setFormData] = useState({
        datasetName: '',
        ownerName: '',
        ownerEmail: '',
        datasetType: '',
        datasetDescription: '',
        frequency: '',
        unit: '',
        isFreqOnceChecked: false,
        sliderImages: sliderImages,
        dataSample: '',
        pins: pins,
        datasetTags: selectedTags,
        links: links
    });

    const handleSubmit = () => {

        setIsSubmitting(true);

        const formattedData = {
            id: null,
            name: formData.datasetName,
            dataOwnerName: formData.ownerName,
            dataOwnerEmail: formData.ownerEmail,
            dataOwnerPhoto: "dataOwnerPhoto",
            datasetType: formData.datasetType.toLowerCase(),
            description: formData.datasetDescription,
            updateFrequency: (formData.frequency && formData.frequency !== 'N/A') ? parseInt(formData.frequency) : 0, // Modified line
            updateFrequencyUnit: formData.unit.toLowerCase(),
            dataExample: dataSample,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            deletedAt: null,
            links: isFreqOnceChecked
                ? formData.links.map((link, index) => ({
                    title: link.title,
                    url: link.url,
                }))
                : [
                    ...formData.links.map((link, index) => ({
                        title: link.title,
                        url: link.url,
                    })),
                    {
                        title: 'MQTT',
                        url: `mqtt://${form.values.mqttAddress.replace('mqtt://', '')}:${form.values.mqttPort}/${form.values.mqttTopic}?username=${form.values.mqttUsername}&password=${form.values.mqttPassword}`,
                    },
                ],
            locations: formData.pins.map((pin, index) => ({
                lon: pin.position[0],
                lat: pin.position[1],
            })),
            sliderImages: formData.sliderImages.map((fileName, index) => ({
                fileName: fileName,
            })),
            tags: formData.datasetTags.map((tagName) => { // Map string[] to Tag-like objects
                const tag = availableTags.find(t => t.name === tagName);
                return tag ? {
                    id: tag.id,
                    name: tag.name,
                    colour: tag.color,
                    icon: tag.icon,
                } : { id: null, name: tagName, colour: null, icon: null }; // If not found, create a new tag-like object
            }),
        };

        console.log("Final JSON to Submit:", formattedData);

        axiosInstance
            .post(`${API_BASE_URL}/datasets`, formattedData)
            .then((response) => {
                console.log("Submission successful:", response.data);
                notifications.show({
                    title: 'Success',
                    message: 'Dataset submitted successfully!',
                    color: 'green',
                    icon: <IconCheck />,
                });
                setSubmissionSuccess(true); // Set success state
                setTimeout(() => navigate('/'), 500); // Navigate after 2 seconds

            })
            .catch((error) => {
                console.error("Submission failed:", error);
                notifications.show({
                    title: 'Error',
                    message: 'Failed to submit dataset:' + error,
                    color: 'red',
                    icon: <IconError404 />,
                });
                setIsSubmitting(false);
            });
    };

    const verifyMqttConnection = async () => {
        setMqttConnectionLoading(true);
        setMqttConnectionError(null);
        setMqttConnectionSuccess(false);

        try {
            const response = await axiosInstance.post(`${API_BASE_URL}/datasets/mqtt/verify`, {
                mqttAddress: form.values.mqttAddress.replace('mqtt://', ''),
                mqttPort: form.values.mqttPort,
                mqttTopic: form.values.mqttTopic,
                mqttUsername: form.values.mqttUsername,
                mqttPassword: form.values.mqttPassword,
            });

            setMqttConnectionSuccess(true);
            notifications.show({
                title: 'MQTT Connection Successful',
                message: 'Successfully connected to the MQTT broker.',
                color: 'green',
                icon: <IconCheck />,
            });
        } catch (error: any) {
            setMqttConnectionError(error.response?.data?.message || error.message || 'MQTT connection failed');
            notifications.show({
                title: 'MQTT Connection Failed',
                message: error.response?.data?.message || error.message || 'Failed to connect to the MQTT broker.',
                color: 'red',
                icon: <IconError404 />,
            });
        } finally {
            setMqttConnectionLoading(false);
        }
    };

    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
    const [loading, setLoading] = useState(false);
    const [filesToUpload, setFilesToUpload] = useState<File[]>([]); // New state

    const handleDrop = (acceptedFiles: File[]) => {
        setFilesToUpload([...filesToUpload, ...acceptedFiles]);
    };

    const handleDeleteFile = (fileToRemove: File) => {
        setUploadedFiles(uploadedFiles.filter((file) => file !== fileToRemove));
    };

    const handleUpload = async () => {
        setLoading(true);
        try {
            const formData = new FormData();
            filesToUpload.forEach((file) => {
                formData.append('files', file, file.name);
            });

            const response = await axiosInstance.post(`${API_BASE_URL}/datasets/uploadHeroImages`, formData);

            console.log('Files uploaded successfully!');
            const uploadedFileNames: string[] = response.data; // Parse response
            console.log('Server-side file names:', uploadedFileNames);

            // Update sliderImages with server-side file names
            setSliderImages(uploadedFileNames);

            // Update uploadedFiles to reflect new names
            const updatedUploadedFiles = filesToUpload.map((file, index) => {
                return {
                    ...file,
                    name: uploadedFileNames[index], // Replace with server-side name
                };
            });
            setUploadedFiles([...uploadedFiles, ...updatedUploadedFiles]);

            setFilesToUpload([]); // Clear filesToUpload
        } catch (error) {
            console.error('Error during file upload:', error);
        } finally {
            setLoading(false);
        }
    };

    const getFieldsToValidate = (step: number) => {
        switch (step) {
            case 1:
                return ['datasetName', 'ownerName', 'ownerEmail', 'datasetType'];
            case 2:
                return ['datasetDescription', 'datasetTags', 'frequency', 'unit'];
            case 3:
                return ['mqttAddress', 'mqttPort', 'mqttTopic'];

            default:
                return []; // Return an empty array for other steps
        }
    };

    const nextStep = () => {
        const fields = getFieldsToValidate(activeStep);
        const validationResults = form.validate(); // Validate all fields
        const hasErrors = fields.some((field) => validationResults.errors[field]); // Check for errors in specified fields

        console.log(formData);
        console.log(validationResults);

        if (!hasErrors) {
            setActiveStep((current) => current + 1);
            window.scrollTo(0, 0);
        } else {
            console.log("Form has errors in the current step. Please correct them.");
            notifications.show({
                title: 'Cannot go to next step',
                message: 'Please correct all required fields before proceeding.',
                color: 'red',
                icon: <IconX />,
            });
        }
    };

    const handleStepClick = (step: number) => {
        const fields = getFieldsToValidate(activeStep);
        const validationResults = form.validate(); // Validate all fields
        const hasErrors = fields.some((field) => validationResults.errors[field]) || (activeStep === 3 && !isFreqOnceChecked && !mqttConnectionSuccess); // Check for errors in specified fields

        if (step + 1 <= activeStep || !hasErrors) {
            setActiveStep(step + 1);
            window.scrollTo(0, 0);
        } else if (step < activeStep) {
            setActiveStep(step);
        } else {
            notifications.show({
                title: 'Cannot jump to step',
                message: 'Please correct all required fields before proceeding.',
                color: 'red',
                icon: <IconX />,
            });
        }
    };

    const prevStep = () => {
        setActiveStep((current) => {
            const prev = current > 1 ? current - 1 : current;
            window.scrollTo(0, 0); // Scroll to top
            return prev;
        });
    };

    const handleAddLink = () => {
        setLinks([...links, { title: '', url: '' }]);
    };

    const handleDeleteLink = (url: string) => {
        setLinks((current) => current.filter((item) => item.url !== url));
    };

    function CustomTextRequired({ required = false, text = "" }) {
        return (
            <Text size="m" mt="lg" mb="xs">
                {text} {required && <span style={{ color: 'red' }}>*</span>}
            </Text>
        )
    }

    const [isFreqOnceChecked, setIsFreqOnceChecked] = useState(false);
    const [frequency, setFrequency] = useState('');
    const [unit, setUnit] = useState('');


    const form = useForm({
        initialValues: {
            datasetName: '',
            ownerName: '',
            ownerEmail: '',
            datasetType: '',
            datasetDescription: '',
            frequency: '',
            unit: '',
            isFreqOnceChecked: false,
            dataSample: '',
            datasetTags: [],
            sliderImages: [''],
            links: [],
            mqttAddress: '',
            mqttPort: '',
            mqttTopic: '',
            mqttUsername: '',
            mqttPassword: '',
        },
        validate: {
            datasetName: (value) => (value.length > 2 ? null : 'Dataset name must be at least 3 characters'),
            ownerName: (value) => (value.length > 2 ? null : 'Owner name must be at least 3 characters'),
            ownerEmail: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
            datasetType: (value) => (value ? null : 'Dataset type is required'),
            datasetDescription: (value) => (value.length > 100 ? null : 'Description must be at least 100 characters'),
            datasetTags: (value) => (value.length > 0) ? null : 'You should provide at least one tag',
            frequency: (value) => (isFreqOnceChecked || value ? null : 'Frequency is required'),
            unit: (value) => (isFreqOnceChecked || value ? null : 'Unit is required'),
            mqttAddress: (value) => !isFreqOnceChecked && !value ? 'MQTT Address is required' : null,
            mqttPort: (value) => !isFreqOnceChecked && !value ? 'MQTT Port is required' : null,
            mqttTopic: (value) => !isFreqOnceChecked && !value ? 'MQTT Topic is required' : null,
        },
    });

    const [geoJsonData, setGeoJsonData] = useState<FeatureCollection | null>(null);

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
            .get(`${API_BASE_URL}/tags`)
            .then((response) => {
                setAvailableTags(response.data);
            })
            .catch((error) => {
                console.error('Failed to load tags:', error);
                setAvailableTags([]); // Ensure component still loads
            });

        if (filesToUpload.length > 0 && !loading) { // Trigger on filesToUpload
            handleUpload();
        }

        setFormData({
            datasetName: form.values.datasetName,
            ownerName: form.values.ownerName,
            ownerEmail: form.values.ownerEmail,
            datasetType: form.values.datasetType,
            datasetDescription: form.values.datasetDescription,
            frequency: form.values.frequency,
            unit: form.values.unit,
            isFreqOnceChecked: form.values.isFreqOnceChecked,
            sliderImages: uploadedFiles.map((file) => file.name),
            dataSample: form.values.dataSample,
            pins: pins,
            datasetTags: form.values.datasetTags,
            links: links,
        });

    }, [filesToUpload, loading, pins, links]);

    const handleMapClick = (info: any, event: any) => {
        console.log("📌 Click event info:", info);
        console.log("📌 Click event object:", event);

        // Ensure event and coordinate info are valid
        if (!info || !info.coordinate) {
            console.warn("❌ No valid coordinates found in click event.");
            return;
        }

        const [lng, lat] = info.coordinate;

        setPins((prevPins) => {
            // Check if the pin already exists (within a small threshold)
            const pinIndex = prevPins.findIndex(
                (pin) => Math.abs(pin.position[0] - lng) < 0.0001 && Math.abs(pin.position[1] - lat) < 0.0001
            );

            if (pinIndex !== -1) {
                // Remove pin if it already exists
                console.log("🗑 Removing pin at:", lng, lat);
                return prevPins.filter((_, index) => index !== pinIndex);
            } else {
                // Add new pin
                console.log("📍 Adding new pin at:", lng, lat);
                return [...prevPins, { position: [lng, lat], radius: 10 }];
            }
        });
    };

    const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const checked = event.currentTarget.checked;
        setIsFreqOnceChecked(checked);

        if (checked) {
            setFrequency('N/A');
            setUnit('Only once');
            form.setFieldValue('frequency', 'N/A')
            form.setFieldValue('unit', 'once')

        } else {
            setFrequency('');
            setUnit('');
            form.setFieldValue('frequency', '')
            form.setFieldValue('unit', '')
        }
    };

    return (
        <Container mb="xl" style={{ marginTop: '50px' }}>
            <Center>
                <Text size="xl">Dataset Add Wizard</Text>
            </Center>

            <Space h="md" />

            <Stepper active={activeStep - 1} onStepClick={handleStepClick} size="sm">
                <Stepper.Step label="Step 1" description="Dataset Main Info" />
                <Stepper.Step label="Step 2" description="Dataset Description" />
                <Stepper.Step label="Step 3" description="Dataset links" />
                <Stepper.Step label="Step 4" description="Confirmation" />
            </Stepper>

            <Space h="md" />
            {activeStep === 1 && (
                <>
                    <Center mt="xl" style={{ flexDirection: 'column' }}>
                        <Text size="lg">Part 1: Dataset Main Info</Text>
                        <Text c="dimmed" size="sm" mb="lg">
                            Provide the main information for the dataset.
                        </Text>
                    </Center>
                    <form>
                        <TextInput
                            label="Dataset Name"
                            placeholder="Enter the dataset name"
                            required mb="md"
                            //onChange={(e) => handleInputChange('datasetName', e.target.value)}
                            {...form.getInputProps('datasetName')}
                        />
                        <TextInput
                            label="Data Owner Name"
                            placeholder="Enter the provider's name"
                            required
                            mb="md"
                            //onChange={(e) => handleInputChange('ownerName', e.target.value)}
                            {...form.getInputProps('ownerName')}
                        />
                        <TextInput
                            label="Data Owner Email Address"
                            placeholder="Enter the contact email address"
                            type="email"
                            required
                            mb="md"
                            //onChange={(e) => handleInputChange('ownerEmail', e.target.value)}
                            {...form.getInputProps('ownerEmail')}
                        />
                        <Select
                            label="Dataset Type"
                            placeholder="Select dataset type"
                            data={['Open', 'Controlled']}
                            required
                            mb="md"
                            //onChange={(value) => handleInputChange('datasetType', value)}
                            {...form.getInputProps('datasetType')}
                        />
                    </form>
                </>
            )}

            {activeStep === 2 && (
                <>
                    <Center mt="xl" style={{ flexDirection: 'column' }}>
                        <Text size="lg">Part 2: Dataset Description</Text>
                        <Text c="dimmed" size="sm" mb="lg">
                            Provide detailed information about the dataset.
                        </Text>
                    </Center>
                    <form>
                        <CustomTextRequired text='Dataset Description' required />
                        <Text size="sm" c={'#888'}>
                            <span>
                                Consider to address the following points while writing a description:
                            </span>
                            <List size="sm">
                                <List.Item>How the dataset is created (sensors, crowd-sourced... etc.)</List.Item>
                                <List.Item>What is the used sensor, and what standard does it have.</List.Item>
                                <List.Item>Dataset license or other terms of use.</List.Item>
                                <List.Item>Is the dataset related to a commercial product or prototype.</List.Item>
                                <List.Item>Initial reason/use case for implementation</List.Item>
                                <List.Item>How do you want to be cited when others use this dataset.</List.Item>
                            </List>
                        </Text>
                        <Textarea
                            label=""
                            mt="sm"
                            placeholder="Provide a detailed description of the dataset"
                            autosize
                            minRows={4}
                            mb="md"
                            required
                            //onChange={(e) => handleInputChange('datasetDescription', e.target.value)}
                            {...form.getInputProps('datasetDescription')}
                        />
                        <Space h="md" />

                        <TagsInput
                            label="Tags"
                            placeholder="Search or type to add tags. Press Enter to create a new tag."
                            value={selectedTags}
                            data={availableTags.map(tag => ({ value: tag.id?.toString() || '', label: tag.name }))}
                            splitChars={[',']}
                            withAsterisk
                            {...form.getInputProps('datasetTags')}
                            comboboxProps={{ transitionProps: { transition: 'pop', duration: 200 } }}
                        />
                        {/* <TagsCreatable
                            availableTags={availableTags}
                            value={selectedTags}
                            required
                            {...form.getInputProps('datasetTags')}
                        /> */}
                        <Space h="md" />

                        <Flex justify="left" align="center" gap="md" wrap="wrap">
                            <TextInput
                                size="sm"
                                required
                                label="Update Frequency"
                                type="number"
                                placeholder="E.g. 5"
                                value={frequency}
                                //onChange={(e) => { setFrequency(e.target.value);form.setFieldValue('frequency', e.target.value);}}
                                disabled={isFreqOnceChecked}
                                {...form.getInputProps('frequency')}
                            />
                            <Select
                                label="Unit"
                                size="sm"
                                placeholder="Select"
                                data={['Only once', 'Seconds', 'Minutes', 'Hours', 'Days', 'Weeks', 'Months', 'Years']}
                                value={unit}
                                //onChange={(value) => {setUnit(value || '');form.setFieldValue('unit', value || '');}}
                                disabled={isFreqOnceChecked}
                                required
                                {...form.getInputProps('unit')}
                            />
                            <Checkbox
                                label="My dataset does not update frequently, I will only add it here once"
                                mt="24px"
                                checked={isFreqOnceChecked}
                                onChange={handleCheckboxChange}
                            />
                        </Flex>


                        <CustomTextRequired text='Multiple slider images' />
                        <Text size="sm" c="dimmed" inline mb="md">
                            Provide some nice photos of your dataset and how it was created, this is your spot to get people's attention!
                        </Text>
                        <div>
                            <Dropzone onDrop={handleDrop} multiple loading={loading}>
                                <Group justify="center" gap="xl" mih={220} style={{ pointerEvents: 'none' }}>
                                    <Dropzone.Idle>
                                        <Text size="xl">Drag files here or click to select files</Text>
                                    </Dropzone.Idle>
                                </Group>
                            </Dropzone>

                            {uploadedFiles.length > 0 && (
                                <Group mt="md">
                                    {uploadedFiles.map((file) => (
                                        <Flex key={file.name} align="center" justify="space-between">
                                            <Text>{file.name}</Text>
                                            <Button
                                                variant="outline"
                                                color="red"
                                                size="xs"
                                                onClick={() => handleDeleteFile(file)}
                                            >
                                                Delete
                                            </Button>
                                        </Flex>
                                    ))}
                                </Group>
                            )}
                        </div>
                        <Space h="md" />

                        <Group justify="space-between" align="center" mt={'lg'}>
                            <Group align="center">
                                <Text size="lg">
                                    Other links
                                </Text>
                                <Tooltip label="This platform does not directly support uploading files. 
                                                You can contact platform admin to request upload files if needed."
                                    position="right"
                                    multiline
                                    color="gray"
                                    w={300}
                                    arrowOffset={38} arrowSize={5} withArrow
                                >
                                    <ActionIcon variant="light" size="sm">
                                        <IconQuestionMark size={16} />
                                    </ActionIcon>
                                </Tooltip>
                            </Group>
                            <Button variant="outline" onClick={handleAddLink}>
                                + Add link
                            </Button>
                        </Group>
                        <Text size="sm" c="dimmed" inline mb="md">
                            Add any external links you may have, such as data files, visualisation dashboards, documentation, GitHub repositories...
                        </Text>
                        {links.map((link, index) => (
                            <Group grow={false} key={index} mb="md" align="center">
                                <TextInput
                                    placeholder="Title"
                                    value={link.title}
                                    onChange={(e) =>
                                        setLinks((current) =>
                                            current.map((item, i) =>
                                                i === index ? { ...item, title: e.target.value } : item
                                            )
                                        )
                                    }
                                    style={{ flex: 1 }}
                                />
                                <TextInput
                                    placeholder="Link"
                                    value={link.url}
                                    onChange={(e) =>
                                        setLinks((current) =>
                                            current.map((item, i) =>
                                                i === index ? { ...item, url: e.target.value } : item
                                            )
                                        )
                                    }
                                    style={{ flex: 1 }}
                                />
                                <Button
                                    variant="subtle"
                                    color="red"
                                    onClick={() => handleDeleteLink(link.url)} //delete by url, as it is unique.
                                    style={{ width: '40px', padding: 0 }}
                                >
                                    <IconTrash size={16} />
                                </Button>
                            </Group>
                        ))}

                        <Space h="md" />

                        <CustomTextRequired text='Dataset Sample' />

                        <Text size="sm" c="dimmed" inline mb="md">
                            How does your data look like? E.g: JSON, CSV, XML... etc. Try to paste some of it here with some real values..
                        </Text>

                        <Textarea
                            label=""
                            placeholder="Paste data sample here"
                            value={dataSample}
                            onChange={(event) => setDataSample(event.target.value)}
                            autosize
                            minRows={4}
                            mb="md"
                        />
                        <Text size="sm" c="dimmed" inline mb="md">
                            Auto preview:
                        </Text>
                        <SyntaxHighlighter language="auto" style={atomOneDark}>
                            {dataSample.trim() || 'Here is how it looks'}
                        </SyntaxHighlighter>


                        <Space h="md" />

                        <CustomTextRequired text='Dataset Locations' />
                        <Text size="sm" c="dimmed" inline mb="md">
                            Click on the map to add the places that your dataset is related to. In case of sensors, it
                            could be where your sensors are deployed. <br />
                            You can add as many pins as you like, click on a pin again to remove it.
                        </Text>
                        <div
                            style={{
                                height: '600px',
                                width: '100%',
                                marginTop: '10px',
                                position: 'relative',
                            }}
                        >
                            <DeckGL
                                initialViewState={INITIAL_VIEW_STATE}
                                controller={true} // Enables dragging, zooming, and panning
                                onClick={handleMapClick} // Fix: Attach onClick to DeckGL
                                layers={[
                                    new ScatterplotLayer({
                                        id: 'scatterplot-layer',
                                        data: pins, // Dynamic pins
                                        getPosition: (d) => d.position,
                                        getRadius: (d) => d.radius,
                                        getFillColor: [0, 200, 255],
                                        pickable: true, // Allow interaction
                                    }),
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
                                    }} interactive={true} // Ensure interactivity
                                />
                            </DeckGL>
                        </div>
                    </form>
                </>
            )}

            {activeStep === 3 && (
                <>
                    <Center mt="xl" style={{ flexDirection: 'column' }}>
                        <Text size="lg">Part 3: MQTT Configuration</Text>
                        <Text c="dimmed" size="sm" mb="lg">
                            Configure the MQTT connection settings to stream your data. Required if your data is not added once.
                        </Text>
                    </Center>
                    <form>
                        <TextInput
                            label="MQTT Address"
                            placeholder="Enter the MQTT broker address (e.g., mqtt://broker.hivemq.com)"
                            required={!isFreqOnceChecked}
                            disabled={isFreqOnceChecked}
                            mb="md"
                            {...form.getInputProps('mqttAddress')}
                        />
                        <TextInput
                            label="MQTT Port"
                            placeholder="Enter the MQTT broker port (e.g., 1883)"
                            required={!isFreqOnceChecked}
                            disabled={isFreqOnceChecked}
                            type="number"
                            mb="md"
                            {...form.getInputProps('mqttPort')}
                        />
                        <TextInput
                            label="MQTT Topic"
                            placeholder="Enter the topic to subscribe to (e.g., /sensor/data)"
                            required={!isFreqOnceChecked}
                            disabled={isFreqOnceChecked}
                            mb="md"
                            {...form.getInputProps('mqttTopic')}
                        />
                        <TextInput
                            label="MQTT Username"
                            placeholder="Enter the username (if applicable)"
                            mb="md"
                            disabled={isFreqOnceChecked}
                            {...form.getInputProps('mqttUsername')}
                        />
                        <TextInput
                            label="MQTT Password"
                            placeholder="Enter the password (if applicable)"
                            mb="md"
                            disabled={isFreqOnceChecked}
                            {...form.getInputProps('mqttPassword')}
                        />
                        <Center mb="xl" mt="xl" style={{ flexDirection: 'column' }}>
                            <Text c="dimmed" size="sm" mb="lg">
                                Before continuing, please verify that the MQTT connection is working correctly
                            </Text>
                            <Button
                                leftSection={mqttConnectionSuccess ? <IconCheck size={25} /> : <IconPlugConnected size={25} />}
                                variant="gradient"
                                gradient={mqttConnectionSuccess ? { from: 'lime', to: 'teal', deg: 297 } : { from: 'blue', to: 'teal', deg: 315 }}
                                onClick={verifyMqttConnection}
                                loading={mqttConnectionLoading}
                                color={mqttConnectionSuccess ? 'green' : (mqttConnectionError ? 'red' : 'blue')}
                            >
                                {mqttConnectionSuccess ? 'MQTT connection verified' : 'Verify MQTT connection'}</Button>
                            {mqttConnectionError && (
                                <Alert color="red" mt="md">
                                    {'Connection error: '}
                                    {mqttConnectionError}
                                </Alert>
                            )}

                            {mqttConnectionError && (
                                <Alert color="blue" mt="md">
                                    {'Need help?'}
                                    <br />
                                    {'Click here to get help directly from '}
                                    <a
                                        href={`https://chat.openai.com/?model=gpt-4&q=${encodeURIComponent(
                                            `I am not a tech expert so please make your answer easy to understand. I encountered an error while using a website that connects to an MQTT broker. Here are the connection details (without username and password) and the error message. Please help me troubleshoot this issue.\n\n---\n\nConnection Details:\nAddress: ${form.values.mqttAddress}\nPort: ${form.values.mqttPort}\nTopic: ${form.values.mqttTopic}\n\n---\n\nError Message:\n${mqttConnectionError}\n\n---`
                                        )}`}
                                        target="_blank"
                                    >
                                        ChatGPT
                                    </a>
                                </Alert>
                            )}
                        </Center>
                        <Space h="xl" />

                    </form>
                </>
            )}

            {activeStep === 4 && (
                <>
                    <Center mt="xl" style={{ flexDirection: 'column', textAlign: 'center' }}>
                        <Text size="lg">Part 4: Confirmation</Text>
                        <Text c="dimmed" size="sm" mb="lg">
                            Please review all the information you have provided. If everything looks good, click the button below to submit your dataset for approval.
                        </Text>
                    </Center>
                    <Center mt="xl">
                        <Button
                            size="xl"
                            style={{
                                padding: '15px 30px',
                                fontSize: '1.25rem',
                                fontWeight: 600,
                                backgroundColor: submissionSuccess ? 'lightgreen' : undefined,
                            }}
                            onClick={handleSubmit}
                            loading={isSubmitting} // Use Mantine's loading prop
                            disabled={submissionSuccess} // Disable the button after successful submission
                        >
                            {submissionSuccess ? 'Submitted!' : 'Submit for Approval'}
                        </Button>
                    </Center>
                </>
            )}


            <Space h="md" />

            <Group justify="center">
                <Button onClick={prevStep} disabled={activeStep === 1}>
                    Back
                </Button>
                <Button onClick={nextStep} disabled={activeStep === 4 || (activeStep === 3 && !isFreqOnceChecked && !mqttConnectionSuccess)}>
                    {activeStep === 3 ? 'Finish' : 'Next'}
                </Button>
            </Group>
            <Notifications />
        </Container>
    );
}
