import { Card, Text, Group, SimpleGrid, RingProgress, Progress, Badge } from '@mantine/core';

export function AdminHome() {
    return (
        <div>
            <Text size="xl" fw={700} mb="lg">
                Platform Overview
            </Text>
            <SimpleGrid cols={3} spacing="lg" >
                <Card shadow="sm" padding="lg">
                    <Group justify="space-between" mb="xs">
                        <Text >Total Users</Text>
                        <Badge color="blue" variant="light">
                            +5% this month
                        </Badge>
                    </Group>
                    <Text size="xl" w={700}>
                        1,245
                    </Text>
                </Card>

                <Card shadow="sm" padding="lg">
                    <Group justify="space-between" mb="xs">
                        <Text >Datasets Added</Text>
                        <Badge color="green" variant="light">
                            +12% this month
                        </Badge>
                    </Group>
                    <Text size="xl" >
                        342
                    </Text>
                </Card>

                <Card shadow="sm" padding="lg">
                    <Group justify="space-between" mb="xs">
                        <Text >Active Subscriptions</Text>
                        <Badge color="red" variant="light">
                            -3% this month
                        </Badge>
                    </Group>
                    <Text size="xl" >
                        89
                    </Text>
                </Card>
            </SimpleGrid>

            <Text size="xl" fw={700} mt="xl" mb="lg">
                Trends
            </Text>
            <SimpleGrid cols={2} spacing="lg" >
                <Card shadow="sm" padding="lg">
                    <Text mb="xs">
                        User Growth
                    </Text>
                    <RingProgress
                        sections={[{ value: 75, color: 'blue' }]}
                        label={
                            <Text size="xs" style={{ textAlign: 'center' }}>
                                75%
                            </Text>
                        }
                    />
                </Card>

                <Card shadow="sm" padding="lg">
                    <Text mb="xs">
                        Dataset Upload Progress
                    </Text>
                    <Progress value={60} color="green" size="lg" />
                    <Text size="sm" mt="xs">
                        60% of target achieved
                    </Text>
                </Card>
            </SimpleGrid>
        </div>
    );
}
