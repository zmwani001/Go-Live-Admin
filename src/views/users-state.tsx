'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';

interface UsersViewState {
  search: string;
  setSearch: (search: string) => void;
  page: number;
  setPage: (page: number | ((currentPage: number) => number)) => void;
  sortColumn: string;
  setSortColumn: (column: string) => void;
  sortDirection: 'asc' | 'desc';
  setSortDirection: (direction: 'asc' | 'desc' | ((current: 'asc' | 'desc') => 'asc' | 'desc')) => void;
}

const UsersViewStateContext = createContext<UsersViewState | null>(null);

export function UsersViewStateProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sortColumn, setSortColumn] = useState('signupAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  return (
    <UsersViewStateContext.Provider
      value={{
        search,
        setSearch,
        page,
        setPage,
        sortColumn,
        setSortColumn,
        sortDirection,
        setSortDirection,
      }}
    >
      {children}
    </UsersViewStateContext.Provider>
  );
}

export function useUsersViewState(): UsersViewState {
  const context = useContext(UsersViewStateContext);
  if (!context) {
    throw new Error('useUsersViewState must be used within UsersViewStateProvider');
  }
  return context;
}
