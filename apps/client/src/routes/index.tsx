import { createFileRoute } from '@tanstack/react-router';
import { HomeView } from '../views';

export const Route = createFileRoute('/')({
  component: HomeView,
});
