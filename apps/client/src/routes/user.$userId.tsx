import { createFileRoute } from '@tanstack/react-router';
import { UserPublicProfileView } from '../pages';

export const Route = createFileRoute('/user/$userId')({
  component: () => {
    const { userId } = Route.useParams();
    return <UserPublicProfileView userId={userId} />;
  },
});
