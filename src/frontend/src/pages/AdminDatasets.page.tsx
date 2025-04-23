import {
    Container,
    Text,
    MultiSelect,
    Center,
    Loader,
    Space,
    Button,
    Group,
    Badge,
    Modal,
    Stack,
    Box,
    ActionIcon,
} from '@mantine/core';
import { DataTable } from 'mantine-datatable';
import { useEffect, useState } from 'react';
import axiosInstance from '@/utils/axiosInstance';
import { notifications } from '@mantine/notifications';
import '@mantine/core/styles.layer.css';
import 'mantine-datatable/styles.layer.css';
import classes from './AdminDatasets.module.css';
import { IconEye, IconEdit, IconTrash } from '@tabler/icons-react';

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
    mqttAddress: string,
    mqttPort: number,
    mqttTopic: string,
    mqttUsername: string,
    mqttPassword: string,
}

export function AdminDatasets() {
    const [datasets, setDatasets] = useState<DatasetItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activePage, setActivePage] = useState(1);
    const [filteredTags, setFilteredTags] = useState<string[]>([]);
    const [expandedRow, setExpandedRow] = useState<number | null>(null);
    const [modalOpened, setModalOpened] = useState(false);

    const itemsPerPage = 10;

    useEffect(() => {
        axiosInstance
            .get('/datasets')
            .then((response) => {
                setDatasets(response.data);
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching datasets:', error);
                notifications.show({
                    title: 'Error',
                    message: 'Failed to fetch datasets.',
                    color: 'red',
                });
                setError('Failed to fetch datasets.');
                setLoading(false);
            });
    }, []);

    const filteredDatasets = datasets.filter((dataset) =>
        filteredTags.length === 0 ||
        dataset.tags.some((tag) => filteredTags.includes(tag.name))
    );

    const paginatedDatasets = filteredDatasets.slice(
        (activePage - 1) * itemsPerPage,
        activePage * itemsPerPage
    );

    if (loading) {
        return (
            <Center style={{ height: '80vh' }}>
                <Loader size="lg" color="blue" />
            </Center>
        );
    }

    if (error) {
        return (
            <Center style={{ height: '80vh' }}>
                <Text color="red">{error}</Text>
            </Center>
        );
    }

    const allTags = Array.from(
        new Set(datasets.flatMap((dataset) => dataset.tags.map((tag) => tag.name)))
    );

    return (
        <Container>
            <Text size="xl" fw={700} mb="lg">
                All Datasets
            </Text>

            <MultiSelect
                data={allTags.map((tag) => ({ value: tag, label: tag }))}
                placeholder="Filter by tags"
                value={filteredTags}
                onChange={setFilteredTags}
                mb="lg"
            />

            <DataTable
                withTableBorder
                columns={[
                    {
                        accessor: 'name',
                        title: 'Name',
                        render: (record) => <Text fw={500}>{record.name}</Text>,
                    },
                    {
                        accessor: 'datasetType',
                        title: 'Access mode',
                        render: (record) => (<Text
                            size="sm"
                            style={{ color: record.datasetType == 'open' ? '#6ea96e' : '#ffa392' }}
                        >
                            {record.datasetType == 'open' ? 'Open' : 'Controlled'}
                        </Text>)
                    },
                    {
                        accessor: 'dataOwnerName',
                        title: 'Owner',
                    },
                    {
                        accessor: 'updateFrequency',
                        title: 'Type',
                        render: (record) =>
                            record.updateFrequency == 0 ? 'Static' : 'Live',
                    },
                    {
                        accessor: 'tags',
                        title: 'Tags',
                        render: (record) => (
                            <Group >
                                {record.tags.map((tag) => (
                                    <Badge
                                        key={tag.id}
                                        color={tag.colour === '#000000' ? 'gray' : tag.colour}
                                    >
                                        {tag.name}
                                    </Badge>
                                ))}
                            </Group>
                        ),
                    },
                    {
                        accessor: 'locations',
                        title: 'Locations',
                        render: (record) => record.locations.length,
                    },
                    {
                        accessor: 'actions',
                        title: 'Actions',
                        render: (record) => (
                            <Group gap={4} justify="right" wrap="nowrap">
                                <ActionIcon
                                    size="sm"
                                    variant="subtle"
                                    color="green"
                                //onClick={() => }
                                >
                                    <IconEye size={16} />
                                </ActionIcon>
                                <ActionIcon
                                    size="sm"
                                    variant="subtle"
                                    color="blue"
                                // onClick={() => showModal({ company, action: 'edit' })}
                                >
                                    <IconEdit size={16} />
                                </ActionIcon>
                                <ActionIcon
                                    size="sm"
                                    variant="subtle"
                                    color="red"
                                // onClick={() => showModal({ company, action: 'delete' })}
                                >
                                    <IconTrash size={16} />
                                </ActionIcon>
                            </Group>
                        ),
                    },
                ]}
                records={paginatedDatasets}
                totalRecords={filteredDatasets.length}
                recordsPerPage={itemsPerPage}
                page={activePage}
                onPageChange={setActivePage}
                emptyState={
                    <Text ta="center" c="dimmed">
                        No datasets found
                    </Text>
                }
                rowExpansion={{
                    content: ({ record }) => (
                        <Stack className={classes.details} p="xs" gap={6}>
                            <Group gap={6}>
                                <div className={classes.label}>Description:</div>
                                <div>
                                    {record.description}
                                </div>
                            </Group>
                        </Stack>
                    ),
                }}
            />

            <Modal
                opened={modalOpened}
                onClose={() => setModalOpened(false)}
                title="Dataset Details"
            >
                <Text>Details of the selected dataset will go here.</Text>
            </Modal>
        </Container>
    );
}
