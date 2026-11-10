const { Book, ReadingSession } = require('../models/Book');

// @desc    Get all books and reading stats
// @route   GET /api/reading
const getReadingData = async (req, res, next) => {
  try {
    const books = await Book.find({ user: req.user._id }).sort({ updatedAt: -1 });
    const sessions = await ReadingSession.find({ user: req.user._id })
      .populate('book', 'title author')
      .sort({ date: -1 });

    const totalBooks = books.length;
    const currentlyReading = books.filter(b => b.status === 'Reading').length;
    const completedBooks = books.filter(b => b.status === 'Completed').length;
    const wantToRead = books.filter(b => b.status === 'Want to Read').length;
    const totalPagesRead = books.reduce((sum, b) => sum + (b.currentPage || 0), 0);

    res.json({
      success: true,
      data: {
        books,
        sessions,
        stats: {
          totalBooks,
          currentlyReading,
          completedBooks,
          wantToRead,
          totalPagesRead,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add book
const createBook = async (req, res, next) => {
  try {
    const { title, author, coverImage, totalPages, currentPage, status, rating, genre, notes } = req.body;
    if (!title || !author) {
      return res.status(400).json({ success: false, message: 'Title and author are required' });
    }

    const book = await Book.create({
      user: req.user._id,
      title,
      author,
      coverImage: coverImage || '',
      totalPages: Number(totalPages) || 100,
      currentPage: Number(currentPage) || 0,
      status: status || 'Want to Read',
      rating: Number(rating) || 5,
      genre: genre || 'Non-Fiction',
      notes: notes || '',
    });

    res.status(201).json({ success: true, data: book });
  } catch (error) {
    next(error);
  }
};

// @desc    Update book progress or status
const updateBook = async (req, res, next) => {
  try {
    const book = await Book.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true }
    );
    if (!book) return res.status(404).json({ success: false, message: 'Book not found' });

    if (book.currentPage >= book.totalPages && book.status !== 'Completed') {
      book.status = 'Completed';
      await book.save();
    }

    res.json({ success: true, data: book });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete book
const deleteBook = async (req, res, next) => {
  try {
    await Book.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    await ReadingSession.deleteMany({ book: req.params.id, user: req.user._id });
    res.json({ success: true, message: 'Book deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Log reading session
const logReadingSession = async (req, res, next) => {
  try {
    const { bookId, pagesRead, durationMinutes, notes, date } = req.body;
    const session = await ReadingSession.create({
      user: req.user._id,
      book: bookId,
      pagesRead: Number(pagesRead) || 1,
      durationMinutes: Number(durationMinutes) || 20,
      notes: notes || '',
      date: date || new Date(),
    });

    // Update book current page
    const book = await Book.findOne({ _id: bookId, user: req.user._id });
    if (book) {
      book.currentPage = Math.min(book.totalPages, (book.currentPage || 0) + Number(pagesRead));
      if (book.currentPage >= book.totalPages) {
        book.status = 'Completed';
      } else if (book.status === 'Want to Read') {
        book.status = 'Reading';
      }
      await book.save();
    }

    res.status(201).json({ success: true, data: session });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getReadingData,
  createBook,
  updateBook,
  deleteBook,
  logReadingSession,
};

