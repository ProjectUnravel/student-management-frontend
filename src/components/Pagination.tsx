import { MetaData } from '../types/ApiResponse';

interface PaginationProps {
  metaData: MetaData;
  onPageChange: (pageIndex: number) => void;
}

const Pagination = ({ metaData, onPageChange }: PaginationProps) => {
  const { pageIndex, totalPages, totalCount, showing } = metaData;

  const getPageNumbers = () => {
    const pages: number[] = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, pageIndex - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="pagination-container" style={{ marginTop: '1rem' }}>
      <div className="pagination-info" style={{ marginBottom: '0.5rem', fontSize: '0.9rem', color: '#666' }}>
        {showing || `Showing ${((pageIndex - 1) * metaData.pageSize) + 1}-${Math.min(pageIndex * metaData.pageSize, totalCount)} of ${totalCount} items`}
      </div>
      
      <div className="pagination" style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
        <button
          onClick={() => onPageChange(1)}
          disabled={pageIndex === 1}
          className="btn btn-secondary"
          style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}
        >
          First
        </button>
        
        <button
          onClick={() => onPageChange(pageIndex - 1)}
          disabled={pageIndex === 1}
          className="btn btn-secondary"
          style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}
        >
          Previous
        </button>

        {getPageNumbers().map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`btn ${page === pageIndex ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem', minWidth: '2rem' }}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => onPageChange(pageIndex + 1)}
          disabled={pageIndex === totalPages}
          className="btn btn-secondary"
          style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}
        >
          Next
        </button>
        
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={pageIndex === totalPages}
          className="btn btn-secondary"
          style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}
        >
          Last
        </button>
      </div>
    </div>
  );
};

export default Pagination;