import { createFileRoute } from '@tanstack/react-router';
import { RegisterView } from '../views';

export const Route = createFileRoute('/register')({
  component: RegisterView,
});
