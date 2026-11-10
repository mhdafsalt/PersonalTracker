const { Subject, StudySession } = require('../models/Study');

// @desc    Get all subjects and sessions
// @route   GET /api/study
const getStudyData = async (req, res, next) => {
  try {
    const subjects = await Subject.find({ user: req.user._id });
    const sessions = await StudySession.find({ user: req.user._id })
      .populate('subject', 'name code color')
      .sort({ date: -1 });

    const totalMinutes = sessions.reduce((sum, s) => sum + (s.durationMinutes || 0), 0);
    const totalHours = +(totalMinutes / 60).toFixed(1);

    const todayStr = new Date().toISOString().split('T')[0];
    const todaySessions = sessions.filter(s => new Date(s.date).toISOString().split('T')[0] === todayStr);
    const todayMinutes = todaySessions.reduce((sum, s) => sum + (s.durationMinutes || 0), 0);
    const todayHours = +(todayMinutes / 60).toFixed(1);

    // Subject breakdown
    const subjectProgress = subjects.map(sub => {
      const subSessions = sessions.filter(s => s.subject && s.subject._id.toString() === sub._id.toString());
      const loggedMin = subSessions.reduce((sum, s) => sum + s.durationMinutes, 0);
      const loggedHours = +(loggedMin / 60).toFixed(1);
      const percentage = sub.targetHours > 0 ? Math.min(100, Math.round((loggedHours / sub.targetHours) * 100)) : 0;
      return {
        _id: sub._id,
        name: sub.name,
        code: sub.code,
        color: sub.color,
        targetHours: sub.targetHours,
        loggedHours,
        percentage,
        examDate: sub.examDate,
      };
    });

    res.json({
      success: true,
      data: {
        subjects,
        sessions,
        subjectProgress,
        stats: {
          totalHours,
          todayHours,
          activeSubjectsCount: subjects.length,
          totalSessionsCount: sessions.length,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create subject
const createSubject = async (req, res, next) => {
  try {
    const { name, code, color, targetHours, examDate, notes } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Subject name is required' });

    const subject = await Subject.create({
      user: req.user._id,
      name,
      code: code || '',
      color: color || '#6B8F71',
      targetHours: Number(targetHours) || 50,
      examDate: examDate || null,
      notes: notes || '',
    });

    res.status(201).json({ success: true, data: subject });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete subject
const deleteSubject = async (req, res, next) => {
  try {
    await Subject.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    await StudySession.deleteMany({ subject: req.params.id, user: req.user._id });
    res.json({ success: true, message: 'Subject deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Log study session
const logStudySession = async (req, res, next) => {
  try {
    const { subjectId, durationMinutes, topic, notes, date } = req.body;
    if (!subjectId || !durationMinutes) {
      return res.status(400).json({ success: false, message: 'Subject and duration are required' });
    }

    const session = await StudySession.create({
      user: req.user._id,
      subject: subjectId,
      durationMinutes: Number(durationMinutes),
      topic: topic || '',
      notes: notes || '',
      date: date || new Date(),
    });

    const populated = await session.populate('subject', 'name code color');
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete study session
const deleteStudySession = async (req, res, next) => {
  try {
    await StudySession.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ success: true, message: 'Session deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStudyData,
  createSubject,
  deleteSubject,
  logStudySession,
  deleteStudySession,
};

