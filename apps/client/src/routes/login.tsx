import { createFileRoute } from '@tanstack/react-router';
import { LoginView } from '../views';

export const Route = createFileRoute('/login')({
  component: LoginView,
});
