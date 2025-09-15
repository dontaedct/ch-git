/**
 * @fileoverview HT-008.10.3: DataTable Component Storybook Story
 * @module components/ui/data-table.stories.tsx
 * @author OSS Hero System
 * @version 2.0.0
 * 
 * UNIVERSAL HEADER: Hero Tasks System Integration
 * Task: HT-008.10.3 - Comprehensive Design System Documentation
 * Focus: Interactive DataTable component documentation with examples
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: HIGH (design system documentation)
 */

// DISABLED: Missing @tanstack/react-table dependency
/*
import type { Meta, StoryObj } from '@storybook/react';
import { DataTable } from './data-table';
import { ColumnDef, Row } from '@tanstack/react-table';
import { Badge } from './badge';
import { Button } from './button';
import { MoreHorizontal } from 'lucide-react';

// Sample data
const sampleUsers = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'Admin',
    status: 'Active',
    lastLogin: '2025-09-07',
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'User',
    status: 'Active',
    lastLogin: '2025-09-06',
  },
  {
    id: '3',
    name: 'Bob Johnson',
    email: 'bob@example.com',
    role: 'User',
    status: 'Inactive',
    lastLogin: '2025-09-01',
  },
  {
    id: '4',
    name: 'Alice Brown',
    email: 'alice@example.com',
    role: 'Moderator',
    status: 'Active',
    lastLogin: '2025-09-07',
  },
  {
    id: '5',
    name: 'Charlie Wilson',
    email: 'charlie@example.com',
    role: 'User',
    status: 'Pending',
    lastLogin: 'Never',
  },
];

const sampleProducts = [
  {
    id: '1',
    name: 'Premium Plan',
    price: '$99/month',
    users: 1000,
    status: 'Active',
    category: 'Subscription',
  },
  {
    id: '2',
    name: 'Basic Plan',
    price: '$29/month',
    users: 100,
    status: 'Active',
    category: 'Subscription',
  },
  {
    id: '3',
    name: 'Enterprise Plan',
    price: '$299/month',
    users: 10000,
    status: 'Active',
    category: 'Subscription',
  },
];

const meta: Meta<typeof DataTable> = {
  title: 'UI/DataTable',
  component: DataTable,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'A comprehensive data table component with sorting, filtering, pagination, and selection capabilities. Built for enterprise applications with advanced features.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: { type: 'text' },
      description: 'Title displayed in the card header',
    },
    description: {
      control: { type: 'text' },
      description: 'Description displayed in the card header',
    },
    searchKey: {
      control: { type: 'text' },
      description: 'Column key to search by',
    },
    searchPlaceholder: {
      control: { type: 'text' },
      description: 'Placeholder text for search input',
    },
    enableSelection: {
      control: { type: 'boolean' },
      description: 'Enable row selection',
    },
    enableSorting: {
      control: { type: 'boolean' },
      description: 'Enable column sorting',
    },
    enableFiltering: {
      control: { type: 'boolean' },
      description: 'Enable filtering controls',
    },
    enablePagination: {
      control: { type: 'boolean' },
      description: 'Enable pagination',
    },
    enableExport: {
      control: { type: 'boolean' },
      description: 'Enable export functionality',
    },
    pageSize: {
      control: { type: 'number' },
      description: 'Number of rows per page',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// User table columns
const userColumns: ColumnDef<typeof sampleUsers[0]>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }: { row: Row<typeof sampleUsers[0]> }) => (
      <div className="font-medium">{row.getValue('name')}</div>
    ),
  },
  {
    accessorKey: 'email',
    header: 'Email',
    cell: ({ row }: { row: Row<typeof sampleUsers[0]> }) => (
      <div className="text-muted-foreground">{row.getValue('email')}</div>
    ),
  },
  {
    accessorKey: 'role',
    header: 'Role',
    cell: ({ row }: { row: Row<typeof sampleUsers[0]> }) => {
      const role = row.getValue('role') as string;
      return (
        <Badge variant={role === 'Admin' ? 'default' : 'secondary'}>
          {role}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }: { row: Row<typeof sampleUsers[0]> }) => {
      const status = row.getValue('status') as string;
      return (
        <Badge 
          variant={
            status === 'Active' ? 'default' : 
            status === 'Inactive' ? 'destructive' : 
            'secondary'
          }
        >
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'lastLogin',
    header: 'Last Login',
    cell: ({ row }: { row: Row<typeof sampleUsers[0]> }) => (
      <div className="text-sm">{row.getValue('lastLogin')}</div>
    ),
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }: { row: Row<typeof sampleUsers[0]> }) => (
      <Button variant="ghost" size="sm">
        <MoreHorizontal className="h-4 w-4" />
      </Button>
    ),
  },
];

// Product table columns
const productColumns: ColumnDef<typeof sampleProducts[0]>[] = [
  {
    accessorKey: 'name',
    header: 'Product Name',
    cell: ({ row }: { row: Row<typeof sampleUsers[0]> }) => (
      <div className="font-medium">{row.getValue('name')}</div>
    ),
  },
  {
    accessorKey: 'price',
    header: 'Price',
    cell: ({ row }: { row: Row<typeof sampleUsers[0]> }) => (
      <div className="font-mono">{row.getValue('price')}</div>
    ),
  },
  {
    accessorKey: 'users',
    header: 'Users',
    cell: ({ row }: { row: Row<typeof sampleUsers[0]> }) => (
      <div className="text-right">{row.getValue('users')}</div>
    ),
  },
  {
    accessorKey: 'category',
    header: 'Category',
    cell: ({ row }: { row: Row<typeof sampleUsers[0]> }) => (
      <Badge variant="outline">{row.getValue('category')}</Badge>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }: { row: Row<typeof sampleUsers[0]> }) => {
      const status = row.getValue('status') as string;
      return (
        <Badge variant="default">{status}</Badge>
      );
    },
  },
];

// Basic table
export const Basic: Story = {
  args: {
    columns: userColumns,
    data: sampleUsers,
    title: 'Users',
    description: 'Manage your application users',
  },
  parameters: {
    docs: {
      description: {
        story: 'A basic data table with user information and actions.',
      },
    },
  },
};

// With search
export const WithSearch: Story = {
  args: {
    columns: userColumns,
    data: sampleUsers,
    title: 'Users',
    description: 'Search and manage users',
    searchKey: 'name',
    searchPlaceholder: 'Search users...',
    enableFiltering: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Data table with search functionality to filter users by name.',
      },
    },
  },
};

// With selection
export const WithSelection: Story = {
  args: {
    columns: userColumns,
    data: sampleUsers,
    title: 'Users',
    description: 'Select users for bulk actions',
    enableSelection: true,
    enableFiltering: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Data table with row selection for bulk operations.',
      },
    },
  },
};

// With pagination
export const WithPagination: Story = {
  args: {
    columns: userColumns,
    data: sampleUsers,
    title: 'Users',
    description: 'Paginated user list',
    enablePagination: true,
    pageSize: 3,
  },
  parameters: {
    docs: {
      description: {
        story: 'Data table with pagination controls.',
      },
    },
  },
};

// Full featured
export const FullFeatured: Story = {
  args: {
    columns: userColumns,
    data: sampleUsers,
    title: 'User Management',
    description: 'Complete user management with all features',
    searchKey: 'name',
    searchPlaceholder: 'Search users...',
    enableSelection: true,
    enableSorting: true,
    enableFiltering: true,
    enablePagination: true,
    enableExport: true,
    pageSize: 5,
  },
  parameters: {
    docs: {
      description: {
        story: 'Fully featured data table with all capabilities enabled.',
      },
    },
  },
};

// Products table
export const Products: Story = {
  args: {
    columns: productColumns,
    data: sampleProducts,
    title: 'Products',
    description: 'Manage your product catalog',
    searchKey: 'name',
    searchPlaceholder: 'Search products...',
    enableSelection: true,
    enableSorting: true,
    enableFiltering: true,
    enablePagination: true,
    enableExport: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Product catalog table with different data structure.',
      },
    },
  },
};

// Empty state
export const EmptyState: Story = {
  args: {
    columns: userColumns,
    data: [],
    title: 'Users',
    description: 'No users found',
    searchKey: 'name',
    searchPlaceholder: 'Search users...',
    enableFiltering: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Data table with empty state when no data is available.',
      },
    },
  },
};

// Large dataset
export const LargeDataset: Story = {
  args: {
    columns: userColumns,
    data: Array.from({ length: 100 }, (_, i) => ({
      id: `${i + 1}`,
      name: `User ${i + 1}`,
      email: `user${i + 1}@example.com`,
      role: ['Admin', 'User', 'Moderator'][i % 3],
      status: ['Active', 'Inactive', 'Pending'][i % 3],
      lastLogin: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    })),
    title: 'Large Dataset',
    description: 'Performance test with 100 rows',
    searchKey: 'name',
    searchPlaceholder: 'Search users...',
    enableSelection: true,
    enableSorting: true,
    enableFiltering: true,
    enablePagination: true,
    enableExport: true,
    pageSize: 10,
  },
  parameters: {
    docs: {
      description: {
        story: 'Data table with large dataset to test performance.',
      },
    },
  },
};

// Interactive playground
export const Playground: Story = {
  args: {
    columns: userColumns,
    data: sampleUsers,
    title: 'Playground',
    description: 'Test different configurations',
    searchKey: 'name',
    searchPlaceholder: 'Search...',
    enableSelection: true,
    enableSorting: true,
    enableFiltering: true,
    enablePagination: true,
    enableExport: true,
    pageSize: 5,
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive playground to test different data table configurations.',
      },
    },
  },
};
*/
