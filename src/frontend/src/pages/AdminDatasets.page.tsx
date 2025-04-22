import { useEffect, useState } from 'react';
import {
    Table,
    Pagination,
    Text,
    Badge,
    Group,
    MultiSelect,
    Container,
    Loader,
    Center,
    Space,
} from '@mantine/core';
import axiosInstance from '@/utils/axiosInstance';
import { notifications } from '@mantine/notifications';

interface DatasetItem {
    id: number;
    name: string;
    dataOwnerName: string;
    createdAt: string;
    tags: { id: number; name: string; colour: string }[];
    locations: { id: number }[];
}

export function AdminDatasets() {
    const [datasets, setDatasets] = useState<DatasetItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activePage, setActivePage] = useState(1);
    const [filteredTags, setFilteredTags] = useState<string[]>([]);

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

            <Table highlightOnHover>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Owner</th>
                        <th>Created At</th>
                        <th>Tags</th>
                        <th>Locations</th>
                    </tr>
                </thead>
                <tbody>
                    {paginatedDatasets.map((dataset) => (
                        <tr key={dataset.id}>
                            <td>{dataset.name}</td>
                            <td>{dataset.dataOwnerName}</td>
                            <td>{new Date(dataset.createdAt).toLocaleDateString()}</td>
                            <td>
                                <Group>
                                    {dataset.tags.map((tag) => (
                                        <Badge
                                            key={tag.id}
                                            color={tag.colour === '#000000' ? 'gray' : tag.colour}
                                        >
                                            {tag.name}
                                        </Badge>
                                    ))}
                                </Group>
                            </td>
                            <td>{dataset.locations.length}</td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            <Space h="md" />

            <Center>
                <Pagination
                    total={Math.ceil(filteredDatasets.length / itemsPerPage)}
                    value={activePage}
                    onChange={setActivePage}
                />
            </Center>
        </Container>
    );
}
