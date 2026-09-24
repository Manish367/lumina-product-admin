'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

type Props = {
  page: number;
  total: number;
  pageSize: number;
  onPage: (page: number) => void;
  onPageSize: (size: number) => void;
};

export default function Pagination({
  page,
  total,
  pageSize,
  onPage,
  onPageSize,
}: Props) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(page, 1), pages);

  const start = total === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const end = Math.min(safePage * pageSize, total);

  const startPage = Math.max(
    1,
    Math.min(safePage - 2, Math.max(1, pages - 4))
  );

  const pageNumbers = Array.from(
    { length: Math.min(5, pages) },
    (_, index) => startPage + index
  ).filter((value) => value <= pages);

  if (total === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4 border-t border-line px-1 pt-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="text-xs text-gray-500">
        Showing{' '}
        <span className="font-semibold text-ink">
          {start}–{end}
        </span>{' '}
        of <span className="font-semibold text-ink">{total}</span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <select
          value={pageSize}
          onChange={(event) => onPageSize(Number(event.target.value))}
          className="h-9 rounded-lg border border-line bg-white px-2.5 text-xs font-semibold"
        >
          <option value={10}>10 / page</option>
          <option value={20}>20 / page</option>
          <option value={50}>50 / page</option>
        </select>

        <button
          type="button"
          disabled={safePage <= 1}
          onClick={() => onPage(safePage - 1)}
          className="grid h-9 w-9 place-items-center rounded-lg border border-line bg-white disabled:opacity-35"
          aria-label="Previous page"
        >
          <ChevronLeft size={15} />
        </button>

        {pageNumbers.map((number) => (
          <button
            type="button"
            key={number}
            onClick={() => onPage(number)}
            className={`grid h-9 min-w-9 place-items-center rounded-lg px-2 text-xs font-bold ${
              number === safePage
                ? 'bg-ink text-white'
                : 'border border-line bg-white text-gray-500 hover:text-ink'
            }`}
          >
            {number}
          </button>
        ))}

        <button
          type="button"
          disabled={safePage >= pages}
          onClick={() => onPage(safePage + 1)}
          className="grid h-9 w-9 place-items-center rounded-lg border border-line bg-white disabled:opacity-35"
          aria-label="Next page"
        >
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}