import { createFileRoute } from '@tanstack/react-router';
import { MessagesView } from '../pages';

export const Route = createFileRoute('/messages')({
  validateSearch: (search: Record<string, unknown>) => ({
    with: typeof search.with === 'string' ? search.with : undefined,
  }),
  component: MessagesView,
});
