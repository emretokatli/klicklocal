import { EmptyState } from '@/components/shared/EmptyState';
import { PageHeader } from '@/components/shared/PageHeader';
import { de } from '@/lib/i18n/de';

export default function CalendarPage() {
  return (
    <div>
      <PageHeader
        title={de.calendar.title}
        description={de.calendar.description}
      />
      <EmptyState
        title={de.calendar.emptyTitle}
        description={de.calendar.emptyDesc}
      />
    </div>
  );
}
