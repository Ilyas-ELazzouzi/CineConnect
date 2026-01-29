import { createFileRoute } from '@tanstack/react-router';
import { ProfilView } from '../views';

export const Route = createFileRoute('/profil')({
  component: ProfilView,
});
