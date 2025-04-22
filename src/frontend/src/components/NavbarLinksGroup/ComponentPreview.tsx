import { Box } from '@mantine/core';

export interface CanvasAttributes {
    responsive?: boolean;
    withColor?: boolean;
    dimmed?: boolean;
    canvas: { center: boolean; maxWidth?: number };
    category: string;
    title: string;
    props?: Record<string, any>;
}
interface ComponentPreviewProps {
    children: React.ReactNode;
    canvas: CanvasAttributes['canvas'];
    withSpacing?: boolean;
}

export function ComponentPreview({ children, canvas, withSpacing = false }: ComponentPreviewProps) {
    return (
        <Box
            pt={canvas?.maxWidth && withSpacing ? 40 : 0}
            maw={canvas?.maxWidth ? canvas.maxWidth : '100%'}
            ml={canvas?.center ? 'auto' : 'unset'}
            mr={canvas?.center ? 'auto' : 'unset'}
        >
            {children}
        </Box>
    );
}