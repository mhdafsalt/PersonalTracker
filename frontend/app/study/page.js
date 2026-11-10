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
      showToast('Study session recorded', 'success');
      setIsSessionModalOpen(false);
      setTopic('');
      setNotes('');
      fetchStudyData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteSubject = async (id) => {
    if (!confirm('Delete this subject and its history?')) return;
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
      <div className="space-y-6 sm:space-y-7">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#686E77]">Academics & Deep Learning</p>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#111315] tracking-tight">Study Tracker</h1>
            <p className="text-xs sm:text-sm text-[#686E77] mt-1">
              Master subjects, record focused study sprints, and prepare for upcoming exams.
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <Button onClick={() => setIsSubjectModalOpen(true)} variant="secondary" icon={Plus}>
              New Subject
            </Button>
            <Button onClick={() => setIsSessionModalOpen(true)} variant="primary" icon={BookOpen}>
              Log Study Session
            </Button>
          </div>
        </div>

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Study Hours"
            value={`${stats.totalHours ?? 0} hrs`}
            subtitle="Accumulated focus"
            icon={GraduationCap}
            trend="16"
          />
          <StatCard
            title="Today's Study Time"
            value={`${stats.todayHours ?? 0} hrs`}
            subtitle="Logged today"
            icon={Clock}
            trend="10"
          />
          <StatCard
            title="Active Subjects"
            value={stats.activeSubjectsCount ?? 0}
            subtitle="Courses enrolled"
            icon={BookOpen}
            trend="04"
          />
          <StatCard
            title="Total Sessions"
            value={stats.totalSessionsCount ?? 0}
            subtitle="Recorded study sprints"
            icon={Award}
            trend="20"
          />
        </div>

        {/* Subject Progress Cards Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-base text-[#111315]">Subjects & Target Hours</h3>
            <span className="text-xs text-[#686E77] font-medium">Progress toward mastery</span>
          </div>

          {subjectProgress.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {subjectProgress.map((sub) => {
                const daysUntilExam = sub.examDate
                  ? Math.ceil((new Date(sub.examDate) - new Date()) / (1000 * 60 * 60 * 24))
                  : null;

                return (
                  <Card key={sub._id} className="flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[10px] font-extrabold text-[#111315] uppercase tracking-wider bg-[#F0F2F5] px-2 py-0.5 rounded-full">
                            {sub.code || 'COURSE'}
                          </span>
                          <h4 className="font-extrabold text-base text-[#111315] mt-1.5">{sub.name}</h4>
                        </div>
                        <button
                          onClick={() => handleDeleteSubject(sub._id)}
                          className="w-8 h-8 rounded-full hover:bg-[#FF5722]/10 flex items-center justify-center text-[#686E77] hover:text-[#FF5722] transition-colors"
                          title="Delete Subject"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Progress bar */}
                      <div className="mt-5 space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="text-[#686E77] font-medium">Hours Logged</span>
                          <span className="font-bold text-[#111315]">
                            {sub.loggedHours} / {sub.targetHours}h ({sub.percentage}%)
                          </span>
                        </div>
                        <div className="w-full bg-[#F0F2F5] rounded-full h-2 border border-[#E5E8ED]">
                          <div
                            className="bg-[#111315] h-2 rounded-full transition-all duration-500"
                            style={{ width: `${sub.percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {daysUntilExam !== null && (
                      <div className="mt-5 pt-3.5 border-t border-[#E5E8ED] flex items-center justify-between text-xs">
                        <span className="text-[#686E77] flex items-center gap-1.5 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-[#111315]" /> Exam Date
                        </span>
                        <Badge variant={daysUntilExam <= 7 ? 'danger' : 'warning'} size="xs">
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
          <div className="p-4 sm:p-5 border-b border-[#E5E8ED] flex items-center justify-between bg-[#F7F8FA]">
            <div>
              <h3 className="font-bold text-base text-[#111315]">Study Session History</h3>
              <p className="text-xs text-[#686E77] mt-0.5">Recent study sessions and topics mastered.</p>
            </div>
            <Button onClick={() => setIsSessionModalOpen(true)} size="sm" variant="secondary" icon={Plus}>
              Log Session
            </Button>
          </div>

          {sessions.length > 0 ? (
            <div className="divide-y divide-[#E5E8ED]">
              {sessions.map((s) => (
                <div key={s._id} className="p-4 sm:p-5 flex items-center justify-between hover:bg-[#F7F8FA]/60 transition-colors">
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-full bg-[#111315] text-[#D4F648] flex items-center justify-center shrink-0 mt-0.5">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm sm:text-base text-[#111315]">
                          {s.subject?.name || 'Subject'}
                        </h4>
                        <Badge variant="lime" size="xs">{s.durationMinutes} mins</Badge>
                      </div>
                      {s.topic && (
                        <p className="text-xs text-[#111315] font-semibold mt-0.5">Topic: {s.topic}</p>
                      )}
                      {s.notes && (
                        <p className="text-xs text-[#686E77] mt-0.5">{s.notes}</p>
                      )}
                      <span className="text-[11px] text-[#686E77] block mt-1">
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
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#686E77] mb-1.5">Subject Name *</label>
              <input
                type="text"
                required
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                placeholder="e.g. Distributed Systems or Economics"
                className="w-full px-4 py-2.5 text-sm rounded-2xl border border-[#E5E8ED] focus:outline-none focus:border-[#111315] bg-[#F7F8FA]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#686E77] mb-1.5">Course Code</label>
                <input
                  type="text"
                  value={subjectCode}
                  onChange={(e) => setSubjectCode(e.target.value)}
                  placeholder="CS-401"
                  className="w-full px-3.5 py-2.5 text-sm rounded-2xl border border-[#E5E8ED] focus:outline-none focus:border-[#111315] bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#686E77] mb-1.5">Target Hours</label>
                <input
                  type="number"
                  value={targetHours}
                  onChange={(e) => setTargetHours(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-2xl border border-[#E5E8ED] focus:outline-none focus:border-[#111315] bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#686E77] mb-1.5">Upcoming Exam Date</label>
              <input
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-2xl border border-[#E5E8ED] focus:outline-none focus:border-[#111315] bg-white"
              />
            </div>

            <div className="pt-3 flex justify-end gap-2.5 border-t border-[#E5E8ED]">
              <Button type="button" variant="secondary" onClick={() => setIsSubjectModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">Create Subject</Button>
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
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#686E77] mb-1.5">Subject *</label>
              <select
                required
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-2xl border border-[#E5E8ED] focus:outline-none focus:border-[#111315] bg-white"
              >
                {subjects.map((sub) => (
                  <option key={sub._id} value={sub._id}>
                    {sub.name} ({sub.code || 'Course'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#686E77] mb-1.5">Duration (minutes) *</label>
              <input
                type="number"
                required
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-2xl border border-[#E5E8ED] focus:outline-none focus:border-[#111315] bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#686E77] mb-1.5">Topic Covered</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Dynamic Programming & Memoization"
                className="w-full px-4 py-2.5 text-sm rounded-2xl border border-[#E5E8ED] focus:outline-none focus:border-[#111315] bg-[#F7F8FA]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#686E77] mb-1.5">Key Takeaways & Notes</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Summary notes..."
                className="w-full px-4 py-2.5 text-sm rounded-2xl border border-[#E5E8ED] focus:outline-none focus:border-[#111315] bg-white"
              />
            </div>

            <div className="pt-3 flex justify-end gap-2.5 border-t border-[#E5E8ED]">
              <Button type="button" variant="secondary" onClick={() => setIsSessionModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">Save Session</Button>
            </div>
          </form>
        </Modal>
      </div>
    </AppLayout>
  );
}
