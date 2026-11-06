import type { ReactNode } from 'react';
import { UsersViewStateProvider } from '../../../views/users-state';

export default function UsersLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <UsersViewStateProvider>{children}</UsersViewStateProvider>;
}
