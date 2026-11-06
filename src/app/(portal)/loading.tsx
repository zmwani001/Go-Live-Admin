import { CardSkeleton, ChartSkeleton, TableSkeleton } from '../../components/LoadingSkeleton';

export default function Loading() {
  return (
    <div className="space-y-6" aria-label="Loading portal">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <CardSkeleton count={6} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartSkeleton />
        <TableSkeleton rows={5} cols={4} />
      </div>
    </div>
  );
}
