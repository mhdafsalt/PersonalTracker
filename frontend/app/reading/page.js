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
      fetchReading();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleLogProgress = async (e) => {
    e.preventDefault();
    if (!selectedBook) return;
    try {
      await api.post('/reading/sessions', {
        bookId: selectedBook._id,
        pagesRead: Number(pagesRead),
      });
      showToast('Reading progress updated!', 'success');
      setIsSessionModalOpen(false);
      fetchReading();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteBook = async (id) => {
    if (!confirm('Remove this book from library?')) return;
    try {
      await api.delete(`/reading/books/${id}`);
      showToast('Book removed', 'success');
      fetchReading();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const filteredBooks = statusFilter === 'All' ? books : books.filter((b) => b.status === statusFilter);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Reading Tracker</h1>
            <p className="text-sm text-slate-500 mt-1">
              Curate your personal library, track daily reading sessions, and record ratings.
            </p>
          </div>
          <Button onClick={() => setIsBookModalOpen(true)} icon={Plus}>
            Add New Book
          </Button>
        </div>

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Books"
            value={stats.totalBooks ?? 0}
            subtitle="Library shelf"
            icon={BookOpen}
            color="#10B981"
          />
          <StatCard
            title="Currently Reading"
            value={stats.currentlyReading ?? 0}
            subtitle="Active books"
            icon={FileText}
            color="#D6A24A"
          />
          <StatCard
            title="Completed"
            value={stats.completedBooks ?? 0}
            subtitle="Finished reads"
            icon={BookmarkCheck}
            color="#4F9B72"
          />
          <StatCard
            title="Total Pages Read"
            value={(stats.totalPagesRead ?? 0).toLocaleString()}
            subtitle="Cumulative pages"
            icon={Star}
            color="#10B981"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-2">
          {['All', 'Reading', 'Want to Read', 'Completed', 'Paused'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 rounded-xl text-xs font-medium transition-all ${
                statusFilter === s
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'
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
                <Card key={book._id} hover className="flex flex-col justify-between">
                  <div>
                    <div className="flex gap-4">
                      {book.coverImage ? (
                        <img
                          src={book.coverImage}
                          alt={book.title}
                          className="w-16 h-24 object-cover rounded-lg border border-slate-200 shrink-0"
                        />
                      ) : (
                        <div className="w-16 h-24 rounded-lg bg-slate-50 border border-slate-200 flex flex-col items-center justify-center text-slate-500 shrink-0">
                          <BookOpen className="w-6 h-6 text-emerald-600" />
                        </div>
                      )}
                      <div className="flex-1 truncate">
                        <Badge
                          variant={
                            book.status === 'Completed'
                              ? 'success'
                              : book.status === 'Reading'
                              ? 'sage'
                              : 'default'
                          }
                          size="sm"
                        >
                          {book.status}
                        </Badge>
                        <h4 className="font-bold text-base text-slate-900 mt-1 truncate">{book.title}</h4>
                        <p className="text-xs text-slate-500 truncate">by {book.author}</p>
                        <div className="flex items-center gap-1 mt-2 text-xs text-amber-600">
                          {[...Array(book.rating || 5)].map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-current" />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4 space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">
                          Page {book.currentPage || 0} of {book.totalPages}
                        </span>
                        <span className="font-semibold text-slate-900">{progressPct}%</span>
                      </div>
                      <div className="w-full bg-slate-50 rounded-full h-2 border border-slate-200">
                        <div
                          className="bg-emerald-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between">
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
                      className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
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
              <label className="block text-xs font-medium text-slate-500 mb-1">Book Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Atomic Habits or Clean Architecture"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-slate-50/50"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Author *</label>
              <input
                type="text"
                required
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Author name"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Total Pages</label>
                <input
                  type="number"
                  value={totalPages}
                  onChange={(e) => setTotalPages(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Current Page</label>
                <input
                  type="number"
                  value={currentPage}
                  onChange={(e) => setCurrentPage(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-white"
                >
                  <option value="Reading">Reading</option>
                  <option value="Want to Read">Want to Read</option>
                  <option value="Completed">Completed</option>
                  <option value="Paused">Paused</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Rating (1-5)</label>
                <select
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-white"
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
              <label className="block text-xs font-medium text-slate-500 mb-1">Cover Image URL (optional)</label>
              <input
                type="text"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="https://..."
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-white"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setIsBookModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Add to Shelf</Button>
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
              <label className="block text-xs font-medium text-slate-500 mb-1">How many pages did you read?</label>
              <input
                type="number"
                required
                value={pagesRead}
                onChange={(e) => setPagesRead(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-white"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setIsSessionModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Progress</Button>
            </div>
          </form>
        </Modal>
      </div>
    </AppLayout>
  );
}

