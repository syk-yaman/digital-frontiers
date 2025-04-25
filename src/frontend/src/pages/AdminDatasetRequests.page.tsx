import {
    Container,
    Text,
    Center,
    Loader,
    Space,
    Group,
    Badge,
    ActionIcon,
    Modal,
    Button,
} from '@mantine/core';
import { DataTable } from 'mantine-datatable';
import { useEffect, useState } from 'react';
import axiosInstance from '@/utils/axiosInstance';
import { notifications } from '@mantine/notifications';
import { IconEye, IconCheck, IconEdit, IconTrash } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

interface DatasetItem {
    id: number;
    name: string;
    dataOwnerName: string;
    datasetType: string;
    tags: { id: number; name: string; colour: string }[];
    locations: any[];
}

export function AdminDatasetRequests() {
    const [datasets, setDatasets] = useState<DatasetItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deleteModalOpened, setDeleteModalOpened] = useState(false);
    const [datasetToDelete, setDatasetToDelete] = useState<DatasetItem | null>(null);

    const navigate = useNavigate();

    useEffect(() => {
        axiosInstance
            .get('/datasets/requests')
            .then((response) => {
                setDatasets(response.data);
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching dataset requests:', error);
                notifications.show({
                    title: 'Error',
                    message: 'Failed to fetch dataset requests.',
                    color: 'red',
                });
                setError('Failed to fetch dataset requests.');
                setLoading(false);
            });
    }, []);

    const handleApproveDataset = (id: number) => {
        axiosInstance
            .put(`/datasets/${id}/approve`)
            .then(() => {
                notifications.show({
                    title: 'Success',
                    message: 'Dataset approved successfully.',
                    color: 'green',
                });
                setDatasets((prev) => prev.filter((dataset) => dataset.id !== id));
            })
            .catch((error) => {
                console.error('Error approving dataset:', error);
                notifications.show({
                    title: 'Error',
                    message: 'Failed to approve dataset.',
                    color: 'red',
                });
            });
    };

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

    return (
        <Container>
            <Text size="xl" fw={700} mb="lg">
                Incoming Dataset Requests
            </Text>

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
                        accessor: 'tags',
                        title: 'Tags',
                        render: (record) => (
                            <Group>
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
                                    color="teal"
                                    onClick={() => handleApproveDataset(record.id)} // Approve dataset
                                >
                                    <IconCheck size={16} />
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
                records={datasets}
                emptyState={
                    <Text ta="center" c="dimmed">
                        No dataset requests found
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
