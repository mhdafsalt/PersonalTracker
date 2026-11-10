'use client';

import React, { useState, useEffect } from 'react';
import { AppLayout } from '../../components/layout/AppLayout';
import { Card } from '../../components/ui/Card';
import { StatCard } from '../../components/ui/StatCard';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/EmptyState';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import {
  BookOpen,
  BookmarkCheck,
  Star,
  Plus,
  Trash2,
  Edit2,
  FileText,
} from 'lucide-react';

export default function ReadingTrackerPage() {
  const { showToast } = useToast();
  const [books, setBooks] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);

  // Book Form
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [totalPages, setTotalPages] = useState(250);
  const [currentPage, setCurrentPage] = useState(0);
  const [status, setStatus] = useState('Reading');
  const [rating, setRating] = useState(5);
  const [genre, setGenre] = useState('Non-Fiction');
  const [coverImage, setCoverImage] = useState('');

  // Log session form
  const [pagesRead, setPagesRead] = useState(20);

  const fetchReading = async () => {
    try {
      const res = await api.get('/reading');
      if (res.success) {
        setBooks(res.data.books);
        setStats(res.data.stats);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReading();
  }, []);

  const handleCreateBook = async (e) => {
    e.preventDefault();
    if (!title.trim() || !author.trim()) return;
    try {
      await api.post('/reading/books', {
        title,
        author,
        totalPages: Number(totalPages),
        currentPage: Number(currentPage),
        status,
        rating: Number(rating),
        genre,
        coverImage,
      });
      showToast('Book added to library', 'success');
      setIsBookModalOpen(false);
      setTitle('');
      setAuthor('');
      setCoverImage('');
      fetchReading();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleLogProgress = async (e) => {
    e.preventDefault();
    if (!selectedBook || !pagesRead) return;
    try {
      await api.post(`/reading/books/${selectedBook._id}/sessions`, {
        pagesRead: Number(pagesRead),
      });
      showToast('Reading progress updated!', 'success');
      setIsSessionModalOpen(false);
      setPagesRead(20);
      fetchReading();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteBook = async (id) => {
    if (!confirm('Remove this book from your library?')) return;
    try {
      await api.delete(`/reading/books/${id}`);
      showToast('Book removed', 'success');
      fetchReading();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const filteredBooks = statusFilter === 'All'
    ? books
    : books.filter((b) => b.status === statusFilter);

  return (
    <AppLayout>
      <div className="space-y-6 sm:space-y-7">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#686E77]">Literature & Knowledge</p>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#111315] tracking-tight">Reading Tracker</h1>
            <p className="text-xs sm:text-sm text-[#686E77] mt-1">
              Curate your personal library, track daily page counts, and log reading ratings.
            </p>
          </div>
          <Button onClick={() => setIsBookModalOpen(true)} variant="primary" icon={Plus}>
            Add New Book
          </Button>
        </div>

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Books"
            value={stats.totalBooks ?? 0}
            subtitle="Library inventory"
            icon={BookOpen}
            trend="10"
          />
          <StatCard
            title="Currently Reading"
            value={stats.currentlyReading ?? 0}
            subtitle="Active reads"
            icon={FileText}
            trend="04"
          />
          <StatCard
            title="Completed"
            value={stats.completedBooks ?? 0}
            subtitle="Finished reads"
            icon={BookmarkCheck}
            trend="18"
          />
          <StatCard
            title="Total Pages Read"
            value={(stats.totalPagesRead ?? 0).toLocaleString()}
            subtitle="Cumulative pages"
            icon={Star}
            trend="24"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 p-1 bg-[#F0F2F5] rounded-full max-w-fit overflow-x-auto scrollbar-none">
          {['All', 'Reading', 'Want to Read', 'Completed', 'Paused'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === s
                  ? 'bg-[#111315] text-white shadow-xs'
                  : 'text-[#686E77] hover:text-[#111315]'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Books Cards Grid */}
        {filteredBooks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBooks.map((book) => {
              const progressPct = Math.min(100, Math.round(((book.currentPage || 0) / book.totalPages) * 100));
              return (
                <Card key={book._id} className="flex flex-col justify-between">
                  <div>
                    <div className="flex gap-4">
                      {book.coverImage ? (
                        <img
                          src={book.coverImage}
                          alt={book.title}
                          className="w-16 h-24 object-cover rounded-2xl border border-[#E5E8ED] shrink-0"
                        />
                      ) : (
                        <div className="w-16 h-24 rounded-2xl bg-[#F0F2F5] border border-[#E5E8ED] flex flex-col items-center justify-center text-[#686E77] shrink-0">
                          <BookOpen className="w-6 h-6 text-[#111315]" />
                        </div>
                      )}
                      <div className="flex-1 truncate">
                        <Badge
                          variant={
                            book.status === 'Completed'
                              ? 'lime'
                              : book.status === 'Reading'
                              ? 'default'
                              : 'default'
                          }
                          size="xs"
                        >
                          {book.status}
                        </Badge>
                        <h4 className="font-extrabold text-base text-[#111315] mt-1.5 truncate">{book.title}</h4>
                        <p className="text-xs text-[#686E77] truncate">by {book.author}</p>
                        <div className="flex items-center gap-1 mt-2 text-xs text-[#FF5722]">
                          {[...Array(book.rating || 5)].map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-current" />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-5 space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-[#686E77] font-medium">
                          Page {book.currentPage || 0} of {book.totalPages}
                        </span>
                        <span className="font-bold text-[#111315]">{progressPct}%</span>
                      </div>
                      <div className="w-full bg-[#F0F2F5] rounded-full h-2 border border-[#E5E8ED]">
                        <div
                          className="bg-[#111315] h-2 rounded-full transition-all duration-500"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-3.5 border-t border-[#E5E8ED] flex items-center justify-between">
                    <Button
                      onClick={() => {
                        setSelectedBook(book);
                        setIsSessionModalOpen(true);
                      }}
                      size="sm"
                      variant="secondary"
                    >
                      + Update Pages
                    </Button>
                    <button
                      onClick={() => handleDeleteBook(book._id)}
                      className="w-8 h-8 rounded-full hover:bg-[#FF5722]/10 flex items-center justify-center text-[#686E77] hover:text-[#FF5722] transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={BookOpen}
            title="No books on your shelf"
            description="Add books to your reading list and track how many pages you read each day."
            actionLabel="Add Book"
            onAction={() => setIsBookModalOpen(true)}
          />
        )}

        {/* Modal: Add Book */}
        <Modal
          isOpen={isBookModalOpen}
          onClose={() => setIsBookModalOpen(false)}
          title="Add Book to Library"
        >
          <form onSubmit={handleCreateBook} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#686E77] mb-1.5">Book Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Atomic Habits or Clean Architecture"
                className="w-full px-4 py-2.5 text-sm rounded-2xl border border-[#E5E8ED] focus:outline-none focus:border-[#111315] bg-[#F7F8FA]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#686E77] mb-1.5">Author *</label>
              <input
                type="text"
                required
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Author name"
                className="w-full px-4 py-2.5 text-sm rounded-2xl border border-[#E5E8ED] focus:outline-none focus:border-[#111315] bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#686E77] mb-1.5">Total Pages</label>
                <input
                  type="number"
                  value={totalPages}
                  onChange={(e) => setTotalPages(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-2xl border border-[#E5E8ED] bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#686E77] mb-1.5">Current Page</label>
                <input
                  type="number"
                  value={currentPage}
                  onChange={(e) => setCurrentPage(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-2xl border border-[#E5E8ED] bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#686E77] mb-1.5">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-2xl border border-[#E5E8ED] bg-white"
                >
                  <option value="Reading">Reading</option>
                  <option value="Want to Read">Want to Read</option>
                  <option value="Completed">Completed</option>
                  <option value="Paused">Paused</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#686E77] mb-1.5">Rating (1-5)</label>
                <select
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-2xl border border-[#E5E8ED] bg-white"
                >
                  <option value={5}>5 Stars</option>
                  <option value={4}>4 Stars</option>
                  <option value={3}>3 Stars</option>
                  <option value={2}>2 Stars</option>
                  <option value={1}>1 Star</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#686E77] mb-1.5">Cover Image URL (optional)</label>
              <input
                type="text"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="https://..."
                className="w-full px-4 py-2.5 text-sm rounded-2xl border border-[#E5E8ED] bg-white"
              />
            </div>

            <div className="pt-3 flex justify-end gap-2.5 border-t border-[#E5E8ED]">
              <Button type="button" variant="secondary" onClick={() => setIsBookModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">Add to Shelf</Button>
            </div>
          </form>
        </Modal>

        {/* Modal: Update Pages */}
        <Modal
          isOpen={isSessionModalOpen}
          onClose={() => setIsSessionModalOpen(false)}
          title={`Update Progress: ${selectedBook?.title || 'Book'}`}
        >
          <form onSubmit={handleLogProgress} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#686E77] mb-1.5">How many pages did you read?</label>
              <input
                type="number"
                required
                value={pagesRead}
                onChange={(e) => setPagesRead(e.target.value)}
                className="w-full px-4 py-2.5 text-sm rounded-2xl border border-[#E5E8ED] focus:outline-none focus:border-[#111315] bg-white"
              />
            </div>

            <div className="pt-3 flex justify-end gap-2.5 border-t border-[#E5E8ED]">
              <Button type="button" variant="secondary" onClick={() => setIsSessionModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">Save Progress</Button>
            </div>
          </form>
        </Modal>
      </div>
    </AppLayout>
  );
}
