import { useQuery } from '@tanstack/react-query';
import { DataTable } from './DataTable';
import { columns } from './column';
import { getUsers } from '../../lib/api';
import { useNavigate } from 'react-router-dom';
import Loader2 from '../../components/Loader2';

export default function Users() {
  const navigate = useNavigate()

  const { data: users, isLoading, error, refetch } = useQuery({
    queryKey: ['users-list'],
    queryFn: getUsers,
  });

  console.log("users", users)

  if (isLoading) return <div><Loader2/></div>;
  if (error) return <div>Error loading users</div>;
  return (
    <div className="container mx-auto">
      <h2 className="text-3xl text-center text-[#245cab] mb-4">View users</h2>
      <DataTable columns={columns(refetch, navigate)} data={users ?? []} isLoading={isLoading} refetchUsers={refetch} />
    </div>
  );
}
