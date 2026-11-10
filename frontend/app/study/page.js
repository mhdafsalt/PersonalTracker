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
import { formatDate } from '../../utils/format';
import {
  GraduationCap,
  BookOpen,
  Calendar,
  Clock,
  Plus,
  Trash2,
  Award,
  Sparkles,
} from 'lucide-react';

export default function StudyTrackerPage() {
  const { showToast } = useToast();
  const [subjects, setSubjects] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [subjectProgress, setSubjectProgress] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  // Modals
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);

  // Subject form
  const [subjectName, setSubjectName] = useState('');
  const [subjectCode, setSubjectCode] = useState('');
  const [targetHours, setTargetHours] = useState(50);
  const [examDate, setExamDate] = useState('');

  // Session form
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [topic, setTopic] = useState('');
  const [notes, setNotes] = useState('');

  const fetchStudyData = async () => {
    try {
      const res = await api.get('/study');
      if (res.success) {
        setSubjects(res.data.subjects);
        setSessions(res.data.sessions);
        setSubjectProgress(res.data.subjectProgress);
        setStats(res.data.stats);
        if (res.data.subjects.length > 0 && !selectedSubjectId) {
          setSelectedSubjectId(res.data.subjects[0]._id);
        }
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudyData();
  }, []);

  const handleCreateSubject = async (e) => {
    e.preventDefault();
    if (!subjectName.trim()) return;
    try {
      await api.post('/study/subjects', {
        name: subjectName,
        code: subjectCode,
        targetHours: Number(targetHours),
        examDate: examDate || null,
      });
      showToast('Subject created', 'success');
      setIsSubjectModalOpen(false);
      setSubjectName('');
      setSubjectCode('');
      fetchStudyData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleLogSession = async (e) => {
    e.preventDefault();
    if (!selectedSubjectId || !durationMinutes) return;
    try {
      await api.post('/study/sessions', {
        subjectId: selectedSubjectId,
        durationMinutes: Number(durationMinutes),
        topic,
        notes,
      });
      showToast('Study session logged!', 'success');
      setIsSessionModalOpen(false);
      setTopic('');
      setNotes('');
      fetchStudyData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteSubject = async (id) => {
    if (!confirm('Delete this subject and all its logged study sessions?')) return;
    try {
      await api.delete(`/study/subjects/${id}`);
      showToast('Subject deleted', 'success');
      fetchStudyData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#252923] tracking-tight">Study & Learning Tracker</h1>
            <p className="text-sm text-[#777D75] mt-1">
              Organize academic subjects, log hours, track course progress, and prepare for exams.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => setIsSubjectModalOpen(true)} variant="secondary" icon={Plus}>
              New Subject
            </Button>
            <Button onClick={() => setIsSessionModalOpen(true)} icon={Clock}>
              Log Study Session
            </Button>
          </div>
        </div>

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Study Hours"
            value={`${stats.totalHours ?? 0} hrs`}
            subtitle="Accumulated across all courses"
            icon={GraduationCap}
            color="#6B8F71"
          />
          <StatCard
            title="Today's Study Time"
            value={`${stats.todayHours ?? 0} hrs`}
            subtitle="Logged today"
            icon={Clock}
            color="#4F9B72"
          />
          <StatCard
            title="Active Subjects"
            value={stats.activeSubjectsCount ?? 0}
            subtitle="Courses enrolled"
            icon={BookOpen}
            color="#D6A24A"
          />
          <StatCard
            title="Total Sessions"
            value={stats.totalSessionsCount ?? 0}
            subtitle="Recorded deep study sprints"
            icon={Award}
            color="#6B8F71"
          />
        </div>

        {/* Subject Progress Cards Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-base text-[#252923]">Subjects & Target Hours</h3>
            <span className="text-xs text-[#777D75]">Progress toward mastery</span>
          </div>

          {subjectProgress.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {subjectProgress.map((sub) => {
                const daysUntilExam = sub.examDate
                  ? Math.ceil((new Date(sub.examDate) - new Date()) / (1000 * 60 * 60 * 24))
                  : null;

                return (
                  <Card key={sub._id} hover className="flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[11px] font-semibold text-[#6B8F71] uppercase tracking-wider">
                            {sub.code || 'COURSE'}
                          </span>
                          <h4 className="font-bold text-base text-[#252923] mt-0.5">{sub.name}</h4>
                        </div>
                        <button
                          onClick={() => handleDeleteSubject(sub._id)}
                          className="p-1 text-[#777D75] hover:text-[#D96C6C] rounded-lg transition-colors"
                          title="Delete Subject"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Progress bar */}
                      <div className="mt-4 space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="text-[#777D75]">Hours Logged</span>
                          <span className="font-semibold text-[#252923]">
                            {sub.loggedHours} / {sub.targetHours}h ({sub.percentage}%)
                          </span>
                        </div>
                        <div className="w-full bg-[#FAF8F5] rounded-full h-2 border border-[#E9E8E1]">
                          <div
                            className="bg-[#6B8F71] h-2 rounded-full transition-all duration-500"
                            style={{ width: `${sub.percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {daysUntilExam !== null && (
                      <div className="mt-4 pt-3 border-t border-[#E9E8E1] flex items-center justify-between text-xs">
                        <span className="text-[#777D75] flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" /> Exam Date
                        </span>
                        <Badge variant={daysUntilExam <= 7 ? 'danger' : 'warning'} size="sm">
                          {daysUntilExam > 0 ? `${daysUntilExam} days away` : 'Exam today or passed'}
                        </Badge>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={GraduationCap}
              title="No subjects registered"
              description="Add your university or self-study courses to begin tracking."
              actionLabel="Add Subject"
              onAction={() => setIsSubjectModalOpen(true)}
            />
          )}
        </div>

        {/* Study History Session Logs */}
        <Card className="p-0 overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-[#E9E8E1] flex items-center justify-between bg-[#FAF8F5]/60">
            <div>
              <h3 className="font-semibold text-base text-[#252923]">Study Session History</h3>
              <p className="text-xs text-[#777D75]">Recent study sessions and topics mastered.</p>
            </div>
            <Button onClick={() => setIsSessionModalOpen(true)} size="sm" icon={Plus}>
              Log Session
            </Button>
          </div>

          {sessions.length > 0 ? (
            <div className="divide-y divide-[#E9E8E1]">
              {sessions.map((s) => (
                <div key={s._id} className="p-4 sm:p-5 flex items-center justify-between hover:bg-[#FAF8F5]/30 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#6B8F71]/15 text-[#6B8F71] flex items-center justify-center shrink-0 mt-0.5">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-sm sm:text-base text-[#252923]">
                          {s.subject?.name || 'Subject'}
                        </h4>
                        <Badge variant="sage" size="sm">{s.durationMinutes} mins</Badge>
                      </div>
                      {s.topic && (
                        <p className="text-xs text-[#252923] font-medium mt-0.5">Topic: {s.topic}</p>
                      )}
                      {s.notes && (
                        <p className="text-xs text-[#777D75] mt-0.5">{s.notes}</p>
                      )}
                      <span className="text-[11px] text-[#777D75] block mt-1">
                        Logged on {formatDate(s.date)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={BookOpen}
              title="No study sessions recorded"
              description="Track your study hours to build subject depth."
              actionLabel="Log First Session"
              onAction={() => setIsSessionModalOpen(true)}
            />
          )}
        </Card>

        {/* Modal: New Subject */}
        <Modal
          isOpen={isSubjectModalOpen}
          onClose={() => setIsSubjectModalOpen(false)}
          title="Add New Subject"
        >
          <form onSubmit={handleCreateSubject} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#777D75] mb-1">Subject Name *</label>
              <input
                type="text"
                required
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                placeholder="e.g. Distributed Systems or Economics"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#E9E8E1] focus:outline-none focus:border-[#6B8F71] bg-[#FAF8F5]/50"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#777D75] mb-1">Course Code</label>
                <input
                  type="text"
                  value={subjectCode}
                  onChange={(e) => setSubjectCode(e.target.value)}
                  placeholder="CS-401"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-[#E9E8E1] focus:outline-none focus:border-[#6B8F71] bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#777D75] mb-1">Target Hours</label>
                <input
                  type="number"
                  value={targetHours}
                  onChange={(e) => setTargetHours(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-[#E9E8E1] focus:outline-none focus:border-[#6B8F71] bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#777D75] mb-1">Upcoming Exam Date</label>
              <input
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-[#E9E8E1] focus:outline-none focus:border-[#6B8F71] bg-white"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setIsSubjectModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Subject</Button>
            </div>
          </form>
        </Modal>

        {/* Modal: Log Study Session */}
        <Modal
          isOpen={isSessionModalOpen}
          onClose={() => setIsSessionModalOpen(false)}
          title="Log Study Session"
        >
          <form onSubmit={handleLogSession} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#777D75] mb-1">Subject *</label>
              <select
                required
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-[#E9E8E1] focus:outline-none focus:border-[#6B8F71] bg-white"
              >
                {subjects.map((sub) => (
                  <option key={sub._id} value={sub._id}>
                    {sub.name} ({sub.code || 'Course'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#777D75] mb-1">Duration (minutes) *</label>
              <input
                type="number"
                required
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-[#E9E8E1] focus:outline-none focus:border-[#6B8F71] bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#777D75] mb-1">Topic Covered</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Dynamic Programming & Memoization"
                className="w-full px-3 py-2 text-sm rounded-xl border border-[#E9E8E1] focus:outline-none focus:border-[#6B8F71] bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#777D75] mb-1">Key Takeaways & Notes</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Summary notes..."
                className="w-full px-3 py-2 text-sm rounded-xl border border-[#E9E8E1] focus:outline-none focus:border-[#6B8F71] bg-white"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setIsSessionModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Session</Button>
            </div>
          </form>
        </Modal>
      </div>
    </AppLayout>
  );
}

