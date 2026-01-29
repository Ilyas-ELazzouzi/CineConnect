import { createFileRoute } from '@tanstack/react-router';
import { FilmsView } from '../views';

export const Route = createFileRoute('/films')({
  component: FilmsView,
});
