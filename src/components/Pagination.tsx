import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Grid3x3 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  postsPerPage: number;
  onPostsPerPageChange: (perPage: number) => void;
  totalPosts: number;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  postsPerPage,
  onPostsPerPageChange,
  totalPosts
}: PaginationProps) {
  const [showPerPageMenu, setShowPerPageMenu] = useState(false);
  const perPageOptions = [6, 9, 12, 15, 18, 24];

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (currentPage > 3) {
        pages.push('...');
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push('...');
      }

      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();
  const startPost = (currentPage - 1) * postsPerPage + 1;
  const endPost = Math.min(currentPage * postsPerPage, totalPosts);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mt-16 pt-8 border-t border-white/10">
      <div className="flex items-center gap-4">
        <span className="text-white/40 text-sm">
          Showing <span className="text-white/70">{startPost}-{endPost}</span> of <span className="text-white/70">{totalPosts}</span>
        </span>

        <div className="relative">
          <button
            onClick={() => setShowPerPageMenu(!showPerPageMenu)}
            className="group/per-page flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 hover:border-white/40 bg-white/3 hover:bg-white/5 backdrop-blur-[80px] transition-all duration-300"
          >
            <Grid3x3 size={14} className="text-white/60 group-hover/per-page:text-white/80 transition-colors duration-300" />
            <span className="text-white/60 group-hover/per-page:text-white/80 text-sm transition-colors duration-300">
              {postsPerPage} per page
            </span>
          </button>

          <AnimatePresence>
            {showPerPageMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowPerPageMenu(false)}
                />

                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute bottom-full left-0 mb-2 p-2 rounded-xl border border-white/20 bg-black/95 backdrop-blur-[100px] z-50 min-w-[140px]"
                  style={{
                    boxShadow: '0 20px 40px -15px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)'
                  }}
                >
                  {perPageOptions.map((option) => (
                    <button
                      key={option}
                      onClick={() => {
                        onPostsPerPageChange(option);
                        setShowPerPageMenu(false);
                        onPageChange(1);
                      }}
                      className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-all duration-200 ${
                        option === postsPerPage
                          ? 'bg-white/10 text-white'
                          : 'text-white/60 hover:text-white/90 hover:bg-white/5'
                      }`}
                    >
                      {option} per page
                    </button>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:border-white/40 hover:bg-white/5 transition-all duration-300 group/page"
          >
            <ChevronsLeft 
              size={16} 
              className="text-white/60 group-hover/page:text-white/90 transition-colors duration-300" 
            />
          </button>

          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:border-white/40 hover:bg-white/5 transition-all duration-300 group/page"
          >
            <ChevronLeft 
              size={16} 
              className="text-white/60 group-hover/page:text-white/90 transition-colors duration-300" 
            />
          </button>

          <div className="flex items-center gap-2">
            {pageNumbers.map((page, index) => {
              if (page === '...') {
                return (
                  <span key={`ellipsis-${index}`} className="text-white/40 px-2">
                    ...
                  </span>
                );
              }

              const isActive = page === currentPage;

              return (
                <motion.button
                  key={page}
                  onClick={() => onPageChange(page as number)}
                  className={`relative w-10 h-10 rounded-full border flex items-center justify-center text-sm transition-all duration-300 ${
                    isActive
                      ? 'border-white/40 bg-white/10 text-white'
                      : 'border-white/20 text-white/60 hover:border-white/40 hover:bg-white/5 hover:text-white/90'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activePage"
                      className="absolute inset-0 rounded-full border border-white/40 bg-white/10"
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    />
                  )}
                  <span className="relative z-10">{page}</span>
                </motion.button>
              );
            })}
          </div>

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:border-white/40 hover:bg-white/5 transition-all duration-300 group/page"
          >
            <ChevronRight 
              size={16} 
              className="text-white/60 group-hover/page:text-white/90 transition-colors duration-300" 
            />
          </button>

          <button
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:border-white/40 hover:bg-white/5 transition-all duration-300 group/page"
          >
            <ChevronsRight 
              size={16} 
              className="text-white/60 group-hover/page:text-white/90 transition-colors duration-300" 
            />
          </button>
        </div>
      )}
    </div>
  );
}
