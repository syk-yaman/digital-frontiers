import { Text, Anchor, Breadcrumbs, Space, Flex, Loader, Center, Title } from '@mantine/core';
import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { notifications } from '@mantine/notifications';
import axiosInstance from '@/utils/axiosInstance';
import { DatasetCard } from '@/components/DatasetCard';

interface DatasetItem {
    id: number;
    name: string;
    dataOwnerName: string;
    dataOwnerPhoto: string;
    datasetType: string;
    description: string;
    updateFrequency: number;
    updateFrequencyUnit: string;
    dataExample: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    links: any[];
    locations: any[];
    sliderImages: { id: number; fileName: string }[];
    tags: { id: number; name: string; colour: string; icon: string }[];
}

export function TagDatasets() {
    const { tagId } = useParams<{ tagId: string }>();
    const [dataItems, setDataItems] = useState<DatasetItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [tagName, setTagName] = useState<string>('');

    const breadcrumbs = [
        { label: 'Home', path: '/' },
        { label: 'Data Menu', path: '/data-menu' },
        { label: tagName ? `${tagName} Datasets` : 'Tag Datasets', path: `/data-menu/tag/${tagId}` },
    ];

    useEffect(() => {
        setLoading(true);
        axiosInstance
            .get(`/datasets/search/tag/${tagId}`)
            .then((response) => {
                const data = response.data;

                // Set the tag name if datasets are found
                if (data.length > 0 && data[0].tags) {
                    const tag = data[0].tags.find((t: any) => t.id.toString() === tagId);
                    if (tag) {
                        setTagName(tag.name);
                    }
                }

                // Format data for display
                const formattedData = data.map((item: DatasetItem) => ({
                    id: item.id,
                    sliderImages: item.sliderImages,
                    name: item.name,
                    datasetType: item.datasetType,
                    dataOwnerName: item.dataOwnerName,
                    dataOwnerPhoto: item.dataOwnerPhoto,
                    description: item.description,
                    createdAt: item.createdAt,
                    updatedAt: item.updatedAt,
                    tags: item.tags.map((tag) => ({
                        name: tag.name,
                        icon: '',
                    })),
                    locations: item.locations,
                }));

                setDataItems(formattedData);
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching data:', error);
                notifications.show({
                    title: 'Error',
                    message: 'Failed to load tag datasets: ' + error.message,
                    color: 'red',
                });
                setError(error.message);
                setLoading(false);
            });
    }, [tagId]);

    if (loading) {
        return (
            <Center style={{ height: '300px' }}>
                <Loader size="xl" />
            </Center>
        );
    }

    if (error) {
        return (
            <Center style={{ height: '300px' }}>
                <Text color="red">Error loading datasets: {error}</Text>
            </Center>
        );
    }

    return (
        <>
            <Space h="md" />
            <Space h="md" />
            <div style={{ paddingLeft: '40px' }}>
                <Breadcrumbs separator=">">
                    {breadcrumbs.map((crumb) => (
                        <Link to={crumb.path} key={crumb.path} className="breadcrumb-link">
                            {crumb.label}
                        </Link>
                    ))}
                </Breadcrumbs>
            </div>
            <Title ta="center" order={2}>{tagName} Datasets</Title>
            <Space h="md" />
            <Text ta="center" size="sm" c="white">
                Browsing all datasets tagged with {tagName}.
            </Text>
            <Space h="xl" />

            {dataItems.length === 0 ? (
                <Center style={{ height: '200px' }}>
                    <Text>No datasets found with this tag.</Text>
                </Center>
            ) : (
                <Flex
                    gap="xl"
                    justify="center"
                    align="center"
                    style={{ maxWidth: '1600px', margin: '0 auto' }}
                    wrap="wrap"
                    mb={'xl'}
                    mr={'xl'}
                    ml={'xl'}
                >
                    {dataItems.map((card) => (
                        <DatasetCard
                            key={card.id}
                            id={card.id}
                            name={card.name}
                            dataOwnerName={card.dataOwnerName}
                            dataOwnerPhoto={card.dataOwnerPhoto}
                            description={card.description}
                            createdAt={card.createdAt}
                            sliderImages={card.sliderImages}
                            tags={card.tags}
                            isControlled={card.datasetType === 'controlled'}
                        />
                    ))}
                </Flex>
            )}
        </>
    );
}
