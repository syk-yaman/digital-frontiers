import {
    Container,
    Text,
    MultiSelect,
    Center,
    Loader,
    Space,
    Group,
    Badge,
    ActionIcon,
    Modal,
    Button,
    Stack,
} from '@mantine/core';
import { DataTable } from 'mantine-datatable';
import { useEffect, useState } from 'react';
import axiosInstance from '@/utils/axiosInstance';
import { notifications } from '@mantine/notifications';
import { IconEye, IconEdit, IconTrash } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import '@mantine/core/styles.layer.css';
import 'mantine-datatable/styles.layer.css';
import classes from './AdminDatasets.module.css';

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
    const [deleteModalOpened, setDeleteModalOpened] = useState(false);
    const [datasetToDelete, setDatasetToDelete] = useState<DatasetItem | null>(null);

    const itemsPerPage = 10;
    const navigate = useNavigate();

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

    const handleDeleteDataset = () => {
        if (!datasetToDelete) return;

        axiosInstance
            .delete(`/datasets/${datasetToDelete.id}`)
            .then(() => {
                notifications.show({
                    title: 'Success',
                    message: `Dataset "${datasetToDelete.name}" deleted successfully.`,
                    color: 'green',
                });
                setDatasets((prev) => prev.filter((dataset) => dataset.id !== datasetToDelete.id));
                setDeleteModalOpened(false);
                setDatasetToDelete(null);
            })
            .catch((error) => {
                console.error('Error deleting dataset:', error);
                notifications.show({
                    title: 'Error',
                    message: 'Failed to delete dataset.',
                    color: 'red',
                });
            });
    };

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
                textSelectionDisabled
                columns={[
                    {
                        accessor: 'name',
                        title: 'Name',
                        render: (record) => <Text fw={500}>{record.name}</Text>,
                    },
                    {
                        accessor: 'datasetType',
                        title: 'Access mode',
                        render: (record) => (
                            <Text
                                size="sm"
                                style={{ color: record.datasetType === 'open' ? '#6ea96e' : '#ffa392' }}
                            >
                                {record.datasetType === 'open' ? 'Open' : 'Controlled'}
                            </Text>
                        ),
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
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => navigate(`/data-menu/tag/${tag.id}`)}
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
                                    onClick={() => navigate(`/dataset/${record.id}`)} // Navigate to dataset page
                                >
                                    <IconEye size={16} />
                                </ActionIcon>
                                <ActionIcon
                                    size="sm"
                                    variant="subtle"
                                    color="blue"
                                    onClick={() => navigate(`/edit-dataset/${record.id}`)} // Navigate to edit dataset page
                                >
                                    <IconEdit size={16} />
                                </ActionIcon>
                                <ActionIcon
                                    size="sm"
                                    variant="subtle"
                                    color="red"
                                    onClick={() => {
                                        setDatasetToDelete(record);
                                        setDeleteModalOpened(true);
                                    }}
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
            />

            <Modal
                opened={deleteModalOpened}
                onClose={() => setDeleteModalOpened(false)}
                title="Confirm Deletion"
                centered
            >
                <Text>
                    Are you sure you want to delete the dataset{' '}
                    <Text fw={700} component="span">
                        {datasetToDelete?.name}
                    </Text>
                    ?
                </Text>
                <Group justify="right" mt="md">
                    <Button variant="default" onClick={() => setDeleteModalOpened(false)}>
                        Cancel
                    </Button>
                    <Button color="red" onClick={handleDeleteDataset}>
                        Delete
                    </Button>
                </Group>
            </Modal>
        </Container>
    );
}
