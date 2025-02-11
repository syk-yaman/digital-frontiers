import { useState } from 'react';
import {
    Container,
    Text,
    Center,
    SegmentedControl,
    TextInput,
    PasswordInput,
    Group,
    Select,
    Checkbox,
    Button,
    Space,
    Anchor,
} from '@mantine/core';
import { Link, NavLink } from 'react-router-dom';

export function SigninPage() {
    const [view, setView] = useState('sign-in'); // Toggle between 'sign-in' and 'sign-up'

    return (
        <Container size={500} style={{ marginTop: '50px' }} mb={'xl'}>
            <Center>
                <Text size="xl">
                    {view === 'sign-in' ? 'Sign In' : 'Sign Up'}
                </Text>
            </Center>

            <Space h="md" />

            <Center>
                <SegmentedControl
                    color="blue"
                    value={view}
                    onChange={setView}
                    data={[
                        { value: 'sign-in', label: 'Sign In' },
                        { value: 'sign-up', label: 'Sign Up' },
                    ]}
                />
            </Center>

            <Space h="md" />

            {view === 'sign-in' ? (
                <form>
                    <TextInput
                        label="Email"
                        placeholder="Enter your email"
                        type="email"
                        required
                        mb="md"
                    />
                    <PasswordInput
                        label="Password"
                        placeholder="Enter your password"
                        required
                        mb="md"
                    />
                    <Button fullWidth variant="filled" color="blue" mt="lg"
                        component={NavLink} to="/add-data-item">
                        Sign In
                    </Button>
                </form>
            ) : (
                <form>
                    <Group grow>
                        <TextInput
                            label="First Name"
                            placeholder="Enter your first name"
                            required
                        />
                        <TextInput
                            label="Last Name"
                            placeholder="Enter your last name"
                            required
                        />
                    </Group>
                    <Space h="md" />
                    <TextInput
                        label="Company/University"
                        placeholder="Enter your company name"
                        required
                        mb="md"
                    />
                    <TextInput
                        label="Email"
                        placeholder="Enter your email"
                        type="email"
                        required
                        mb="md"
                    />
                    <PasswordInput
                        label="Password"
                        placeholder="Enter your password"
                        required
                        mb="md"
                    />
                    <PasswordInput
                        label="Re-enter Password"
                        placeholder="Re-enter your password"
                        required
                        mb="md"
                    />
                    <Select
                        label="How do you describe yourself?"
                        placeholder=""
                        data={['Academic', 'Business owner', 'Corporate representer', 'Enthusiast']}
                        required
                        mb="md"
                    />
                    <Checkbox
                        label={
                            <span>
                                I accept the following terms: {<br />}
                                <span> {<br />}
                                    -  (Nick to send those)
                                </span>
                                <span> {<br />}
                                    -  Lorem ipsum dolor sit amet consectetur adipisicing elit.
                                </span>
                                <span> {<br />}
                                    -  Lorem ipsum dolor sit amet consectetur adipisicing elit.
                                </span>
                                <span> {<br />}
                                    -  Lorem ipsum dolor sit amet consectetur adipisicing elit.
                                </span>
                            </span>
                        }
                        required
                        mb="md"
                    />
                    <Button fullWidth variant="filled" color="blue" mt="lg"
                        component={NavLink} to="/add-data-item">
                        Send Verification Email
                    </Button>
                </form>
            )}
        </Container>
    );
}
