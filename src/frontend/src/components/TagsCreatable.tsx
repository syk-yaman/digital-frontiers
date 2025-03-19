import { useState, useEffect } from 'react';
import { Text, CheckIcon, Combobox, Group, Pill, PillsInput, useCombobox, Avatar } from '@mantine/core';

interface Tag {
    id: number;
    name: string;
    color: string;
    icon?: string; // Optional icon URL
}

interface TagsCreatableProps {
    availableTags?: Tag[]; // Optional list of available tags
    value: Tag[]; // Selected tags
    onChange: (tags: Tag[]) => void; // Function to update parent state
    required?: boolean;
}

export function TagsCreatable({ availableTags = [], value, onChange, required = false }: TagsCreatableProps) {
    const combobox = useCombobox({
        onDropdownClose: () => combobox.resetSelectedOption(),
        onDropdownOpen: () => combobox.updateSelectedOptionIndex('active'),
    });

    const [search, setSearch] = useState('');
    const [data, setData] = useState<Tag[]>(availableTags);

    // Update local data when availableTags changes
    useEffect(() => {
        setData(availableTags);
    }, [availableTags]);

    const exactOptionMatch = data.some((tag) => tag.name.toLowerCase() === search.trim().toLowerCase());

    const handleValueSelect = (val: string) => {
        setSearch('');
        let newValue: Tag[];

        if (val === '$create') {
            const newTag: Tag = {
                id: Date.now(),
                name: search.trim(),
                color: '#000000',
            };
            newValue = [...(value || []), newTag];
            setData((current) => [...current, newTag]);
        } else {
            const selectedTag = data.find((tag) => tag.id === Number(val));
            if (!selectedTag) return;

            newValue = (value || []).some((tag) => tag.id === selectedTag.id)
                ? (value || []).filter((tag) => tag.id !== selectedTag.id)
                : [...(value || []), selectedTag];
        }

        onChange(newValue);
    };

    const handleValueRemove = (id: number) => {
        const newValue = value.filter((tag) => tag.id !== id);
        onChange(newValue);
    };

    const handleCreateTag = () => {
        if (!exactOptionMatch && search.trim().length > 0) {
            const newTag: Tag = {
                id: Date.now(), // Generates a unique number ID
                name: search.trim(),
                color: '#000000',
            };
            setData((current) => [...current, newTag]);
            onChange([...value, newTag]);
            setSearch('');
        }
    };

    const values = (value || []).map((tag) => (
        <Pill key={tag.id} withRemoveButton onRemove={() => handleValueRemove(tag.id)} color={tag.color}>
            {tag.icon && <Avatar src={tag.icon} size={16} mr="xs" />}
            {tag.name}
        </Pill>
    ));


    const options = data
        .filter((tag) => tag.name.toLowerCase().includes(search.trim().toLowerCase()))
        .map((tag) => (
            <Combobox.Option value={tag.id.toString()} key={tag.id} active={value.some((v) => v.id === tag.id)}>
                <Group gap="sm">
                    {value.some((v) => v.id === tag.id) ? <CheckIcon size={12} /> : null}
                    {tag.icon && <Avatar src={tag.icon} size={16} />}
                    <span>{tag.name}</span>
                </Group>
            </Combobox.Option>
        ));

    return (
        <div>
            <Text size="sm" style={{ paddingBottom: '4px' }}>
                Tags {required && <span style={{ color: 'red' }}>*</span>}
            </Text>

            <Combobox store={combobox} onOptionSubmit={handleValueSelect} withinPortal={false}>
                <Combobox.DropdownTarget>
                    <PillsInput onClick={() => combobox.openDropdown()}>
                        <Pill.Group>
                            {values}
                            <Combobox.EventsTarget>
                                <PillsInput.Field
                                    onFocus={() => combobox.openDropdown()}
                                    onBlur={() => combobox.closeDropdown()}
                                    value={search}
                                    placeholder="Search or add tags"
                                    onChange={(event) => {
                                        combobox.updateSelectedOptionIndex();
                                        setSearch(event.currentTarget.value);
                                    }}
                                    onKeyDown={(event) => {
                                        if (event.key === 'Backspace' && search.length === 0) {
                                            event.preventDefault();
                                            handleValueRemove(value[value.length - 1]?.id);
                                        }

                                        if (event.key === 'Enter') {
                                            event.preventDefault();
                                            handleCreateTag();
                                        }
                                    }}
                                />
                            </Combobox.EventsTarget>
                        </Pill.Group>
                    </PillsInput>
                </Combobox.DropdownTarget>

                <Combobox.Dropdown>
                    <Combobox.Options>
                        {options}
                        {!exactOptionMatch && search.trim().length > 0 && (
                            <Combobox.Option value="$create">+ Create "{search}"</Combobox.Option>
                        )}
                        {exactOptionMatch && search.trim().length > 0 && options.length === 0 && (
                            <Combobox.Empty>No tags found</Combobox.Empty>
                        )}
                    </Combobox.Options>
                </Combobox.Dropdown>
            </Combobox>
        </div>
    );
}
