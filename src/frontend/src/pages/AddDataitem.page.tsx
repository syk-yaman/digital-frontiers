import { useEffect, useState } from 'react';
import {
    Container,
    Stepper,
    Button,
    Text,
    TextInput,
    Select,
    Checkbox,
    Group,
    Space,
    Center,
    Textarea,
    FileInput,
    List,
    Flex,
} from '@mantine/core';
import DeckGL from '@deck.gl/react';
import { GeoJsonLayer, ScatterplotLayer } from '@deck.gl/layers';
import { Map, MapLayerMouseEvent } from 'react-map-gl/maplibre';
import { TagsCreatable } from '@/components/TagsCreatable';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark, atomOneLight } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { IconPhoto, IconTrash, IconUpload, IconX } from '@tabler/icons-react';
import { Dropzone, IMAGE_MIME_TYPE } from '@mantine/dropzone';
import '@mantine/dropzone/styles.css';
import { ShapefileLoader } from '@loaders.gl/shapefile';
import { load, loadInBatches } from '@loaders.gl/core';
import { Feature, FeatureCollection, Position } from "geojson";
import proj4 from 'proj4';


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


export function AddDataitemPage() {
    const [activeStep, setActiveStep] = useState(1);
    const [jsonInput, setJsonInput] = useState('{\n     \"type\": EXAMPLE,\n     \"num\": 2,\n     \"fields\": [\n        {\"name\": \"Voltage\", \"unit\": \"V\", \"decPrecision\": 3},\n        {\"name\": \"Current\", \"unit\": \"A\", \"decPrecision\": 1}\n     ]\n  }');
    const [attachments, setAttachments] = useState([{ id: 1, fileName: '', file: null }]);

    const nextStep = () => {
        setActiveStep((current) => {
            const next = current < 4 ? current + 1 : current;
            window.scrollTo(0, 0); // Scroll to top
            return next;
        });
    };

    const prevStep = () => {
        setActiveStep((current) => {
            const prev = current > 1 ? current - 1 : current;
            window.scrollTo(0, 0); // Scroll to top
            return prev;
        });
    };

    const handleAddAttachment = () => {
        setAttachments([...attachments, { id: attachments.length + 1, fileName: '', file: null }]);
    };

    const handleDeleteAttachment = (id: number) => {
        setAttachments((current) => current.filter((item) => item.id !== id));
    };

    function CustomTextRequired({ required = false, text = "" }) {
        return (
            <Text size="m" mt="lg" mb="xs">
                {text} {required && <span style={{ color: 'red' }}>*</span>}
            </Text>
        )
    }

    const [isChecked, setIsChecked] = useState(false);
    const [frequency, setFrequency] = useState('');
    const [unit, setUnit] = useState('');
    const [pins, setPins] = useState<{ position: [number, number]; radius: number }[]>([]);

    const [geoJsonData, setGeoJsonData] = useState<FeatureCollection | null>(null);

    useEffect(() => {
        async function loadShapefileFromURL() {
            const shpUrl = "/dist/maps/MDC_Boundary_2024.shp"; // 🔹 Replace with actual URL

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
    }, []);

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
        setIsChecked(checked);

        if (checked) {
            setFrequency('N/A');
            setUnit('Only once');
        } else {
            setFrequency('');
            setUnit('');
        }
    }

    return (
        <Container mb="xl" style={{ marginTop: '50px' }}>
            <Center>
                <Text size="xl">Dataset Add Wizard</Text>
            </Center>

            <Space h="md" />

            <Stepper active={activeStep - 1} onStepClick={(step) => setActiveStep(step + 1)} size="sm">
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
                        <TextInput label="Dataset Name" placeholder="Enter the dataset name" required mb="md" />
                        <TextInput
                            label="Provider Name"
                            placeholder="Enter the provider's name"
                            required
                            mb="md"
                        />
                        <TextInput
                            label="Point of Contact Email Address"
                            placeholder="Enter the contact email address"
                            type="email"
                            required
                            mb="md"
                        />
                        <Select
                            label="Dataset Type"
                            placeholder="Select dataset type"
                            data={['Public', 'Controlled']}
                            required
                            mb="md"
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
                                <List.Item>Dataset license, if any.</List.Item>
                                <List.Item>Is the dataset related to a commercial product or prototype.</List.Item>
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
                        />
                        <Space h="md" />
                        <TagsCreatable required />
                        <Space h="md" />

                        <Flex justify="left" align="center" gap="md" wrap="wrap">
                            <TextInput
                                size="sm"
                                required
                                label="Update Frequency"
                                placeholder="E.g. every 2 minutes"
                                value={frequency}
                                onChange={(e) => setFrequency(e.target.value)}
                                disabled={isChecked}
                            />
                            <Select
                                label="Unit"
                                size="sm"
                                placeholder="Select"
                                data={['Only once', 'Second', 'Minute', 'Hour', 'Day', 'Week', 'Month', 'Year']}
                                value={unit}
                                onChange={(value) => setUnit(value || '')} // Handle null safely
                                disabled={isChecked}
                                required
                            />
                            <Checkbox
                                label="My dataset does not update frequently, I will only add it here once"
                                mt="24px"
                                checked={isChecked}
                                onChange={handleCheckboxChange}
                            />
                        </Flex>


                        <CustomTextRequired text='Multiple slider images' />
                        <Text size="sm" c="dimmed" inline mb="md">
                            Provide some nice photos of your dataset and how it was created, this is your spot to get people's attention!
                        </Text>
                        <Dropzone
                            onDrop={(files) => console.log('accepted files', files)}
                            onReject={(files) => console.log('rejected files', files)}
                            maxSize={5 * 1024 ** 2}
                            accept={IMAGE_MIME_TYPE}
                        >
                            <Group justify="center" gap="xl" mih={220} style={{ pointerEvents: 'none' }}>
                                <Dropzone.Accept>
                                    <IconUpload size={52} color="var(--mantine-color-blue-6)" stroke={1.5} />
                                </Dropzone.Accept>
                                <Dropzone.Reject>
                                    <IconX size={52} color="var(--mantine-color-red-6)" stroke={1.5} />
                                </Dropzone.Reject>
                                <Dropzone.Idle>
                                    <IconPhoto size={52} color="var(--mantine-color-dimmed)" stroke={1.5} />
                                </Dropzone.Idle>

                                <div>
                                    <Text size="xl" inline>
                                        Drag hero images for your dataset here or click to select files
                                    </Text>
                                    <Text size="sm" c="dimmed" inline mt={7}>
                                        Attach as many files as you like, each file should not exceed 3mb
                                    </Text>
                                </div>
                            </Group>
                        </Dropzone>
                        <Space h="md" />

                        <CustomTextRequired text='Dataset Sample' />

                        <Text size="sm" c="dimmed" inline mb="md">
                            How does your data look like? E.g: JSON, CSV, XML... etc. Try to paste some of it here with some real values..
                        </Text>

                        <Textarea
                            label=""
                            placeholder="Paste JSON data here"
                            value={jsonInput}
                            onChange={(event) => setJsonInput(event.target.value)}
                            autosize
                            minRows={4}
                            mb="md"
                        />
                        <SyntaxHighlighter language="json" style={atomOneDark}>
                            {jsonInput.trim() || '{}'}
                        </SyntaxHighlighter>

                        <Text size="sm" mt="lg" mb="xs">
                            Extra links
                        </Text>
                        <Text size="sm" c="dimmed" inline mb="md">
                            Add any external links you may have, such as visualisation dashboards, documentation, GitHub repositories...
                        </Text>
                        {attachments.map((attachment, index) => (
                            <Group grow={false} key={attachment.id} mb="md" align="center">
                                <TextInput
                                    placeholder="Title"
                                    value={attachment.fileName}
                                    onChange={(e) =>
                                        setAttachments((current) =>
                                            current.map((item) =>
                                                item.id === attachment.id ? { ...item, fileName: e.target.value } : item
                                            )
                                        )
                                    }
                                    style={{ flex: 1 }}
                                />
                                <TextInput
                                    placeholder="Link"
                                    //   onChange={(file) =>
                                    //     setAttachments((current) =>
                                    //       current.map((item) =>
                                    //         item.id === attachment.id ? { ...item, file } : item
                                    //       )
                                    //     )
                                    //   }
                                    style={{ flex: 1 }}
                                />
                                <Button
                                    variant="subtle"
                                    color="red"
                                    onClick={() => handleDeleteAttachment(attachment.id)}
                                    style={{ width: '40px', padding: 0 }} // Adjust the width and remove padding
                                >
                                    <IconTrash size={16} />
                                </Button>
                            </Group>
                        ))}
                        <Button variant="outline" onClick={handleAddAttachment}>
                            + Add another link
                        </Button>

                        <Space h="md" />

                        <CustomTextRequired text='Dataset Locations' required />
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
                                        getFillColor: [0, 128, 255],
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
                                    mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
                                    interactive={true} // Ensure interactivity
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
                            Configure the MQTT connection settings to stream your data.
                        </Text>
                    </Center>
                    <form>
                        <TextInput
                            label="MQTT Address"
                            placeholder="Enter the MQTT broker address (e.g., mqtt://broker.hivemq.com)"
                            required
                            mb="md"
                        />
                        <TextInput
                            label="MQTT Port"
                            placeholder="Enter the MQTT broker port (e.g., 1883)"
                            required
                            type="number"
                            mb="md"
                        />
                        <TextInput
                            label="MQTT Topic"
                            placeholder="Enter the topic to subscribe to (e.g., /sensor/data)"
                            required
                            mb="md"
                        />
                        <TextInput
                            label="MQTT Username"
                            placeholder="Enter the username (if applicable)"
                            mb="md"
                        />
                        <TextInput
                            label="MQTT Password"
                            placeholder="Enter the password (if applicable)"
                            type="password"
                            mb="md"
                        />
                        <Group mt="md">
                            <Button variant="outline" color="blue" onClick={() => console.log('Testing MQTT Connection')}>
                                Test Connection
                            </Button>
                        </Group>
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
                            }}
                            onClick={() => console.log('Submitting for approval')}
                        >
                            Submit for Approval
                        </Button>
                    </Center>
                </>
            )}


            <Space h="md" />

            <Group style={{ justifyContent: 'center' }}>
                <Button onClick={prevStep} disabled={activeStep === 1}>
                    Back
                </Button>
                <Button onClick={nextStep} disabled={activeStep === 4} hidden={activeStep === 4}>
                    {activeStep === 6 ? 'Finish' : 'Next'}
                </Button>
            </Group>
        </Container>
    );
}
