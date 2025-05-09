import { useEffect, useState } from 'react';
import { Text, Anchor, Breadcrumbs, Group, Title, Container, Flex, Space, Loader, Center } from '@mantine/core';
import { Link } from 'react-router-dom';
import { ShowcaseCard } from '@/components/ShowcaseCard';
import axiosInstance from '@/utils/axiosInstance';
import { notifications } from '@mantine/notifications';

interface ShowcaseLocation {
    id: number;
    lon: number;
    lat: number;
    description?: string;
    imageLink?: string;
    linkTitle?: string;
    linkAddress?: string;
}

interface ShowcaseSliderImage {
    id: number;
    fileName: string;
    isTeaser: boolean;
}

interface ShowcaseItem {
    id: number;
    title: string;
    description: string;
    youtubeLink?: string;
    datasetId?: number;
    createdAt: string;
    updatedAt: string;
    approvedAt?: string;
    sliderImages: ShowcaseSliderImage[];
    locations?: ShowcaseLocation[];
    user: {
        id: string;
        firstName: string;
        lastName: string;
        photoUrl?: string;
    };
    dataset?: {
        id: number;
        name: string;
    };
}

const breadcrumbs = [
    { label: 'Home', path: '/' },
    { label: 'Showcases', path: '/showcases' },
];

export function ShowcasesPage() {
    const [showcases, setShowcases] = useState<ShowcaseItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Fetch showcases when component mounts
        axiosInstance
            .get('/showcases')
            .then((response) => {
                setShowcases(response.data);
                setLoading(false);
            })
            .catch((err) => {
                console.error('Error fetching showcases:', err);
                setError('Failed to load showcases. Please try again later.');
                notifications.show({
                    title: 'Error',
                    message: 'Failed to load showcases: ' + err.message,
                    color: 'red',
                });
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <Center style={{ height: 'calc(100vh - 200px)' }}>
                <Loader size="xl" />
            </Center>
        );
    }

    if (error) {
        return (
            <Container mt={50}>
                <Text color="red" size="lg" ta="center">
                    {error}
                </Text>
            </Container>
        );
    }

    return (
        <Container fluid px="xl" py="xl" style={{ maxWidth: '1600px' }}>
            <Space h={60} />
            <div style={{ paddingLeft: '20px' }}>
                <Breadcrumbs separator=">">
                    {breadcrumbs.map((crumb) => (
                        <Link to={crumb.path} key={crumb.path} className="breadcrumb-link">
                            {crumb.label}
                        </Link>
                    ))}
                </Breadcrumbs>
            </div>

            <Title order={1} ta="center" mb="md">
                Showcases & Projects
            </Title>
            <Text ta="center" size="lg" mb="xl" c="dimmed">
                Explore innovative projects that utilize the Queen Elizabeth Olympic Park data
            </Text>

            {showcases.length === 0 ? (
                <Text ta="center" mt="xl" size="lg">
                    No showcases available yet. Check back soon!
                </Text>
            ) : (
                <Flex
                    gap="xl"
                    justify="center"
                    align="flex-start"
                    wrap="wrap"
                    mb="xl"
                >
                    {showcases.map((showcase) => (
                        <ShowcaseCard
                            key={showcase.id}
                            id={showcase.id}
                            title={showcase.title}
                            description={showcase.description}
                            createdAt={showcase.createdAt}
                            sliderImages={showcase.sliderImages}
                            user={showcase.user}
                            youtubeLink={showcase.youtubeLink}
                            datasetId={showcase.datasetId}
                        />
                    ))}
                </Flex>
            )}
        </Container>
    );
}
