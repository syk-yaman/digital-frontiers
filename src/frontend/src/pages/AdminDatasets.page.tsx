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
    ScrollArea,
    Progress,
    Anchor,
} from '@mantine/core';
import { useEffect, useState } from 'react';
import axiosInstance from '@/utils/axiosInstance';
import { notifications } from '@mantine/notifications';
import classes from './AdminDatasets.module.css';

interface DatasetItem {
    id: number;
    name: string;
    dataOwnerName: string;
    createdAt: string;
    tags: { id: number; name: string; colour: string }[];
    locations: { id: number }[];
    reviews: { positive: number; negative: number };
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

    const rows = paginatedDatasets.map((dataset) => {

        return (
            <Table.Tr key={dataset.id}>
                <Table.Td>
                    <Anchor component="button" fz="sm">
                        {dataset.name}
                    </Anchor>
                </Table.Td>
                <Table.Td>{dataset.dataOwnerName}</Table.Td>
                <Table.Td>{new Date(dataset.createdAt).toLocaleDateString()}</Table.Td>
                <Table.Td>
                    <Group >
                        {dataset.tags.map((tag) => (
                            <Badge
                                key={tag.id}
                                color={tag.colour === '#000000' ? 'gray' : tag.colour}
                            >
                                {tag.name}
                            </Badge>
                        ))}
                    </Group>
                </Table.Td>
                <Table.Td>{dataset.locations.length}</Table.Td>
                <Table.Td>
                    <Group justify="space-between">
                        <Text fz="xs" c="teal" fw={700}>
                            {1}%
                        </Text>
                        <Text fz="xs" c="red" fw={700}>
                            {1}%
                        </Text>
                    </Group>
                    <Progress.Root>
                        <Progress.Section
                            className={classes.progressSection}
                            value={1}
                            color="teal"
                        />
                        <Progress.Section
                            className={classes.progressSection}
                            value={1}
                            color="red"
                        />
                    </Progress.Root>
                </Table.Td>
            </Table.Tr>
        );
    });

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

            <ScrollArea>
                <Table.ScrollContainer minWidth={800}>
                    <Table verticalSpacing="xs">
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>Name</Table.Th>
                                <Table.Th>Owner</Table.Th>
                                <Table.Th>Created At</Table.Th>
                                <Table.Th>Tags</Table.Th>
                                <Table.Th>Locations</Table.Th>
                                <Table.Th>Reviews Distribution</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>{rows}</Table.Tbody>
                    </Table>
                </Table.ScrollContainer>
            </ScrollArea>

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
