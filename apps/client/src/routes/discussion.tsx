import { createFileRoute } from '@tanstack/react-router';
import { DiscussionView } from '../views';

export const Route = createFileRoute('/discussion')({
  component: DiscussionView,
});
