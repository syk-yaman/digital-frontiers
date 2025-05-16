import { Card, CardSection, Image, Badge, Group, Text, Center, Avatar, Button, Stack } from '@mantine/core';
import { Link, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '@/config';
import { IconMovie, IconEdit, IconTrash } from '@tabler/icons-react';
import axiosInstance from '@/utils/axiosInstance';
import { notifications } from '@mantine/notifications';

interface ShowcaseCardProps {
    id: number;
    title: string;
    description: string;
    createdAt: string;
    sliderImages: { id: number; fileName: string; isTeaser: boolean }[];
    user: {
        id: string;
        firstName: string;
        lastName: string;
        photoUrl?: string;
    };
    youtubeLink?: string;
    datasetId?: number;
    actionable?: boolean;
}

export function ShowcaseCard({
    id,
    title,
    description,
    createdAt,
    sliderImages,
    user,
    youtubeLink,
    actionable = false,
}: ShowcaseCardProps) {
    const navigate = useNavigate();

    const handleDelete = async () => {
        try {
            await axiosInstance.delete(`/showcases/${id}`);
            notifications.show({
                title: 'Success',
                message: 'Showcase deleted successfully.',
                color: 'green',
            });
            window.location.reload(); // Refresh the page to reflect changes
        } catch (error) {
            console.error('Error deleting showcase:', error);
            notifications.show({
                title: 'Error',
                message: 'Failed to delete showcase.',
                color: 'red',
            });
        }
    };

    // Get teaser image or first image or default
    const teaserImage = sliderImages.find(img => img.isTeaser);
    const displayImage = teaserImage || (sliderImages.length > 0 ? sliderImages[0] : null);

    return (
        <>
            {!actionable ? (
                <Link
                    key={id}
                    to={`/showcase/${id}`}
                    style={{ textDecoration: 'none', color: 'inherit' }}
                >
                    <Card
                        key={id}
                        withBorder
                        radius="md"
                        p="md"
                        className="card"
                        style={{
                            border: 'none',
                            backgroundColor: '#1F5754',
                            width: '350px',
                            minHeight: '400px',
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                    >
                        <Card.Section style={{ position: 'relative' }}>
                            {/* Image */}
                            <Image
                                src={displayImage ? `${API_BASE_URL}/uploads/${displayImage.fileName}` : `/imgs/showcase-default.jpeg`}
                                alt={title}
                                height={180}
                            />

                            {/* Badge positioned at the bottom-left of the image */}
                            <Badge
                                size="sm"
                                variant="dark"
                                style={{
                                    position: 'absolute',
                                    bottom: 10,
                                    left: 10,
                                    backgroundColor: '#1f5753d1',
                                    color: '#c9f3f1',
                                }}
                            >
                                Added: {createdAt
                                    ? new Date(createdAt).toLocaleDateString(undefined, {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric',
                                    })
                                    : 'Unknown'}
                            </Badge>

                            {youtubeLink && (
                                <Badge
                                    size="sm"
                                    variant="filled"
                                    color="red"
                                    leftSection={<IconMovie size={14} />}
                                    style={{
                                        position: 'absolute',
                                        top: 10,
                                        right: 10,
                                    }}
                                >
                                    Video
                                </Badge>
                            )}
                        </Card.Section>

                        <Card.Section className="section" mt="md">
                            <Group justify="apart">
                                <Text c="white" fz="lg" fw={500}
                                    style={{
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        fontSize: 'clamp(12px, 2vw, 16px)'
                                    }}>
                                    {title}
                                </Text>
                            </Group>
                            <Group mt="xs" justify="apart">
                                <Center>
                                    <Avatar
                                        size={30}
                                        radius="xl"
                                        mr="xs"
                                        bg={'#1f5754'}
                                    />
                                    <Text c="white" fz="m" inline>
                                        {`${user.firstName} ${user.lastName}`}
                                    </Text>
                                </Center>
                            </Group>

                            <Text c="white" fz="sm" mt="xs" style={{
                                height: '60px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'normal',
                                wordBreak: 'break-word',
                            }}>
                                {description.length > 80
                                    ? `${description.substring(0, 110)}...`
                                    : description}
                            </Text>
                        </Card.Section>

                        <Group mt="auto" style={{ marginTop: 'auto' }} >
                            <Button
                                variant="outline"
                                color="#d7bf3c"
                                style={{ flex: 1 }}
                                component={Link}
                                to={`/showcase/${id}`}
                            >
                                {actionable ? 'View' : 'View Project'}
                            </Button>
                            {actionable && (
                                <>
                                    <Button
                                        variant="outline"
                                        color="blue"
                                        style={{ flex: 2 }}
                                        leftSection={<IconEdit size={16} />}
                                        onClick={() => navigate(`/edit-showcase/${id}`)}
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        variant="outline"
                                        color="red"
                                        style={{ flex: 2 }}
                                        leftSection={<IconTrash size={16} />}
                                        onClick={handleDelete}
                                    >
                                        Delete
                                    </Button>
                                </>
                            )}
                        </Group>
                    </Card>
                </Link>
            ) : (
                <Card
                    key={id}
                    withBorder
                    radius="md"
                    p="md"
                    className="card"
                    style={{
                        border: 'none',
                        backgroundColor: '#1F5754',
                        width: '350px',
                        minHeight: '400px',
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    <Card.Section style={{ position: 'relative' }}>
                        {/* Image */}
                        <Image
                            src={displayImage ? `${API_BASE_URL}/uploads/${displayImage.fileName}` : `/imgs/showcase-default.jpeg`}
                            alt={title}
                            height={180}
                        />

                        {/* Badge positioned at the bottom-left of the image */}
                        <Badge
                            size="sm"
                            variant="dark"
                            style={{
                                position: 'absolute',
                                bottom: 10,
                                left: 10,
                                backgroundColor: '#1f5753d1',
                                color: '#c9f3f1',
                            }}
                        >
                            Added: {createdAt
                                ? new Date(createdAt).toLocaleDateString(undefined, {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                })
                                : 'Unknown'}
                        </Badge>

                        {youtubeLink && (
                            <Badge
                                size="sm"
                                variant="filled"
                                color="red"
                                leftSection={<IconMovie size={14} />}
                                style={{
                                    position: 'absolute',
                                    top: 10,
                                    right: 10,
                                }}
                            >
                                Video
                            </Badge>
                        )}
                    </Card.Section>

                    <Card.Section className="section" mt="md">
                        <Group justify="apart">
                            <Text c="white" fz="lg" fw={500}
                                style={{
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    fontSize: 'clamp(12px, 2vw, 16px)'
                                }}>
                                {title}
                            </Text>
                        </Group>
                        <Group mt="xs" justify="apart">
                            <Center>
                                <Avatar
                                    size={30}
                                    radius="xl"
                                    mr="xs"
                                    bg={'#1f5754'}
                                />
                                <Text c="white" fz="m" inline>
                                    {`${user.firstName} ${user.lastName}`}
                                </Text>
                            </Center>
                        </Group>

                        <Text c="white" fz="sm" mt="xs" style={{
                            height: '60px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'normal',
                            wordBreak: 'break-word',
                        }}>
                            {description.length > 80
                                ? `${description.substring(0, 110)}...`
                                : description}
                        </Text>
                    </Card.Section>

                    <Group mt="auto" style={{ marginTop: 'auto' }} >
                        <Button
                            variant="outline"
                            color="#d7bf3c"
                            style={{ flex: 1 }}
                            component={Link}
                            to={`/showcase/${id}`}
                        >
                            {actionable ? 'View' : 'View Project'}
                        </Button>
                        {actionable && (
                            <>
                                <Button
                                    variant="outline"
                                    color="blue"
                                    style={{ flex: 2 }}
                                    leftSection={<IconEdit size={16} />}
                                    onClick={() => navigate(`/edit-showcase/${id}`)}
                                >
                                    Edit
                                </Button>
                                <Button
                                    variant="outline"
                                    color="red"
                                    style={{ flex: 2 }}
                                    leftSection={<IconTrash size={16} />}
                                    onClick={handleDelete}
                                >
                                    Delete
                                </Button>
                            </>
                        )}
                    </Group>
                </Card>
            )}
        </>
    )
}
