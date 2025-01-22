import { useState } from 'react';
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
} from '@mantine/core';
import DeckGL from '@deck.gl/react';
import { ScatterplotLayer } from '@deck.gl/layers';
import { Map } from 'react-map-gl/maplibre';
import { TagsCreatable } from '@/components/TagsCreatable';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark, atomOneLight } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { IconTrash } from '@tabler/icons-react';

const INITIAL_VIEW_STATE = {
    longitude: -0.0167,
    latitude: 51.5447,
    zoom: 14.5,
};

export function AddDataitemPage() {
    const [activeStep, setActiveStep] = useState(1);
    const [jsonInput, setJsonInput] = useState('');
    const [attachments, setAttachments] = useState([{ id: 1, fileName: '', file: null }]);

    const nextStep = () => {
        setActiveStep((current) => {
            const next = current < 6 ? current + 1 : current;
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
                            label="Type of License"
                            placeholder="Select a license type"
                            data={['Open', 'Proprietary', 'Creative Commons']}
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
                        <Checkbox.Group label="Dataset Includes" mb="md">
                            <Checkbox value="historical" label="Historical Data" m="xs" />
                            <Checkbox value="live" label="Live Data" m="xs" />
                        </Checkbox.Group>
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
                        <Textarea
                            label="Dataset Description"
                            placeholder="Provide a detailed description of the dataset"
                            autosize
                            minRows={4}
                            mb="md"
                        />

                        <TagsCreatable />

                        <Group grow mb="md">
                            <TextInput label="Update Frequency" placeholder="Every" />
                            <Select
                                label="Time Period"
                                placeholder="Select"
                                data={['Year', 'Month', 'Week', 'Day', 'Hour', 'Minute']}
                            />
                        </Group>

                        <Textarea
                            label="Data Standard"
                            placeholder="Provide details about the data standard used"
                            autosize
                            minRows={4}
                            mb="md"
                        />

                        <FileInput
                            label="Slider Images"
                            placeholder="Drag and drop files or click to select"
                            multiple
                            accept="image/*"
                            mb="md"
                        />

                        <Textarea
                            label="Dataset Sample (JSON)"
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
                            Multi Attachments
                        </Text>
                        {attachments.map((attachment, index) => (
                            <Group grow={false} key={attachment.id} mb="md" align="center">
                                <TextInput
                                    placeholder="File Name"
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
                                <FileInput
                                    placeholder="Upload or drag file"
                                    value={attachment.file}
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
                            + Add Another Attachment
                        </Button>

                        <Space h="md" />

                        <Text size="sm" mt="lg" mb="xs">
                            Dataset Locations
                        </Text>
                        <div
                            style={{
                                height: '400px',
                                width: '100%',
                                marginTop: '10px',
                                position: 'relative',
                            }}
                        >
                            <Map
                                initialViewState={INITIAL_VIEW_STATE}
                                mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
                            >
                                <DeckGL
                                    layers={[
                                        new ScatterplotLayer({
                                            id: 'scatterplot-layer',
                                            data: [{ position: [-0.0167, 51.5447], radius: 100 }],
                                            getFillColor: [0, 128, 255],
                                        }),
                                    ]}
                                    viewState={INITIAL_VIEW_STATE}
                                />
                            </Map>
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
                <Button onClick={nextStep} disabled={activeStep === 6}>
                    {activeStep === 6 ? 'Finish' : 'Next'}
                </Button>
            </Group>
        </Container>
    );
}
