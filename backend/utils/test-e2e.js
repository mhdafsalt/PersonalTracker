// Full End-to-End Integration Test for Personal Tracker APIs
const BASE_URL = 'http://localhost:5000/api';

const runTests = async () => {
  console.log('--- Starting Comprehensive Integration Test Suite ---');
  let passed = 0;
  let failed = 0;

  const assert = (condition, testName) => {
    if (condition) {
      console.log(`  ✓ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${testName}`);
      failed++;
    }
  };

  try {
    // 1. Health Check
    const healthRes = await fetch(`${BASE_URL}/health`).then(r => r.json());
    assert(healthRes.status === 'online', 'Health endpoint responds with online status');

    // 2. Auth: Register new test user
    const uniqueEmail = `test_${Date.now()}@tracker.local`;
    const regRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Jordan Lee',
        email: uniqueEmail,
        password: 'securePassword123!',
      }),
    }).then(r => r.json());

    assert(regRes.success && regRes.data.token, 'User registration returns valid JWT');
    const token = regRes.data.token;
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };

    // 3. User isolation test: Me endpoint
    const meRes = await fetch(`${BASE_URL}/auth/me`, { headers }).then(r => r.json());
    assert(meRes.data.email === uniqueEmail, 'Auth Me returns isolated user credentials');

    // 4. Module 01: Habits CRUD & Streak calculation
    const habitRes = await fetch(`${BASE_URL}/habits`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        title: 'Morning Breathwork',
        category: 'Mindfulness',
        frequency: 'daily',
      }),
    }).then(r => r.json());
    assert(habitRes.success && habitRes.data.title === 'Morning Breathwork', 'Create habit endpoint');

    const habitId = habitRes.data._id;
    const toggleRes = await fetch(`${BASE_URL}/habits/${habitId}/toggle`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ date: new Date().toISOString().split('T')[0] }),
    }).then(r => r.json());
    assert(toggleRes.data.currentStreak === 1, 'Toggle habit updates current streak to 1');

    // 5. Module 02: Expenses & Savings Goals
    const txnRes = await fetch(`${BASE_URL}/expenses/transactions`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        title: 'Cloud Infrastructure Retainer',
        amount: 25000,
        type: 'income',
        category: 'DevOps',
        paymentMethod: 'UPI',
      }),
    }).then(r => r.json());
    assert(txnRes.success && txnRes.data.amount === 25000, 'Create transaction endpoint');

    const expRes = await fetch(`${BASE_URL}/expenses/transactions?type=income`, { headers }).then(r => r.json());
    assert(expRes.data.summary.totalIncome === 25000, 'Financial summary calculation in ₹ INR');

    const goalRes = await fetch(`${BASE_URL}/expenses/savings-goals`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        title: 'Emergency Reserve',
        targetAmount: 100000,
        currentAmount: 30000,
      }),
    }).then(r => r.json());
    assert(goalRes.success && goalRes.data.targetAmount === 100000, 'Create savings goal');

    // 6. Module 03: Productivity & Pomodoro
    const taskRes = await fetch(`${BASE_URL}/productivity/tasks`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        title: 'Implement OAuth Refresh Tokens',
        priority: 'Urgent',
        category: 'Engineering',
      }),
    }).then(r => r.json());
    assert(taskRes.success && taskRes.data.priority === 'Urgent', 'Create priority task');

    const focusRes = await fetch(`${BASE_URL}/productivity/focus`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        taskId: taskRes.data._id,
        durationMinutes: 25,
        sessionType: 'pomodoro',
      }),
    }).then(r => r.json());
    assert(focusRes.success && focusRes.data.durationMinutes === 25, 'Log Pomodoro focus session');

    // 7. Module 04: Fitness & Vitals
    const workoutRes = await fetch(`${BASE_URL}/fitness/workouts`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        exerciseName: 'Deadlifts & Pull-ups',
        category: 'Strength',
        durationMinutes: 45,
        sets: 5,
        reps: 5,
        caloriesBurned: 350,
      }),
    }).then(r => r.json());
    assert(workoutRes.success && workoutRes.data.caloriesBurned === 350, 'Log workout');

    const vitalsRes = await fetch(`${BASE_URL}/fitness/records`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        weight: 71.8,
        steps: 9200,
        waterLiters: 3.0,
      }),
    }).then(r => r.json());
    assert(vitalsRes.success && vitalsRes.data.steps === 9200, 'Log daily health vitals');

    // 8. Module 05: Study & Learning
    const subRes = await fetch(`${BASE_URL}/study/subjects`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: 'Database Internals & LSM Trees',
        code: 'CS-902',
        targetHours: 30,
      }),
    }).then(r => r.json());
    assert(subRes.success && subRes.data.name === 'Database Internals & LSM Trees', 'Create study subject');

    const studyLogRes = await fetch(`${BASE_URL}/study/sessions`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        subjectId: subRes.data._id,
        durationMinutes: 60,
        topic: 'Write Ahead Logging and Write Amplification',
      }),
    }).then(r => r.json());
    assert(studyLogRes.success && studyLogRes.data.durationMinutes === 60, 'Log study session');

    // 9. Module 06: Reading Tracker
    const bookRes = await fetch(`${BASE_URL}/reading/books`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        title: 'Designing Data-Intensive Applications',
        author: 'Martin Kleppmann',
        totalPages: 560,
        currentPage: 120,
        status: 'Reading',
        rating: 5,
      }),
    }).then(r => r.json());
    assert(bookRes.success && bookRes.data.title.includes('Data-Intensive'), 'Add book to library');

    // 10. Module 07: Time Tracker
    const timeStartRes = await fetch(`${BASE_URL}/time/start`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        title: 'Deep Architecture Spike',
        category: 'Work',
      }),
    }).then(r => r.json());
    assert(timeStartRes.success && timeStartRes.data.isRunning === true, 'Start live time tracker');

    const timeStopRes = await fetch(`${BASE_URL}/time/${timeStartRes.data._id}/stop`, {
      method: 'PUT',
      headers,
    }).then(r => r.json());
    assert(timeStopRes.success && timeStopRes.data.isRunning === false, 'Stop live time tracker');

    // 11. Module 08: Goal Tracker
    const goalTrackRes = await fetch(`${BASE_URL}/goals`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        title: 'Reach 10,000 GitHub Stars',
        category: 'Career',
        type: 'long-term',
        targetDate: new Date(Date.now() + 180 * 86400000),
        milestones: [
          { title: 'Publish initial open-source release', completed: true },
          { title: 'Feature in Hacker News and Product Hunt', completed: false },
        ],
      }),
    }).then(r => r.json());
    assert(goalTrackRes.success && goalTrackRes.data.milestones.length === 2, 'Create goal with milestones');

    // 12. Module 09: Travel Planner
    const travelRes = await fetch(`${BASE_URL}/travel`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        title: 'Coastal Kayaking Expedition',
        destination: 'Goa & Gokarna, India',
        startDate: new Date(Date.now() + 30 * 86400000),
        endDate: new Date(Date.now() + 35 * 86400000),
        budget: 35000,
      }),
    }).then(r => r.json());
    assert(travelRes.success && travelRes.data.destination.includes('Gokarna'), 'Create travel plan');

    // 13. Module 10: ORBIT Connections & Calls
    const contactRes = await fetch(`${BASE_URL}/orbit/contacts`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: 'Vikram Mehta',
        phone: '+91 99887 76655',
        organization: 'Apex Ventures',
        category: 'VIP',
        isImportant: true,
      }),
    }).then(r => r.json());
    assert(contactRes.success && contactRes.data.isImportant === true, 'Create ORBIT contact with VIP star');

    const callRes = await fetch(`${BASE_URL}/orbit/calls`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        contactId: contactRes.data._id,
        durationMinutes: 20,
        type: 'Outgoing',
        purpose: 'Investment Term Sheet Review',
        followUpDate: new Date(Date.now() + 4 * 86400000),
      }),
    }).then(r => r.json());
    assert(callRes.success && callRes.data.followUpStatus === 'Pending', 'Log call with scheduled follow-up');

    // 14. Module 11: Creative Projects
    const creativeRes = await fetch(`${BASE_URL}/creative`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        title: 'Next-Gen Audio Synthesizer VST',
        category: 'Music',
        skills: ['C++', 'DSP', 'JUCE'],
        portfolioWorthy: true,
      }),
    }).then(r => r.json());
    assert(creativeRes.success && creativeRes.data.skills.includes('DSP'), 'Create creative project');

    // 15. Module 12: Graphic Design Studio (Interconnection test!)
    const clientRes = await fetch(`${BASE_URL}/design/clients`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: 'Solaria Solar Systems',
        brandName: 'Solaria',
        company: 'Solaria Energy Pvt Ltd',
        email: 'partners@solaria.in',
      }),
    }).then(r => r.json());
    assert(clientRes.success && clientRes.data.brandName === 'Solaria', 'Create design client');

    const designProjRes = await fetch(`${BASE_URL}/design/projects`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        client: clientRes.data._id,
        title: 'Packaging & Solar Fleet Vehicle Branding',
        category: 'Packaging Design',
        pricing: 60000,
        advancePayment: 30000,
      }),
    }).then(r => r.json());
    assert(designProjRes.success && designProjRes.data.paymentStatus === 'Partial', 'Create linked design project with advance billing');

    // Interconnection verification: fetch client details and verify project is included
    const clientDetails = await fetch(`${BASE_URL}/design/clients/${clientRes.data._id}`, { headers }).then(r => r.json());
    assert(
      clientDetails.success &&
      clientDetails.data.projects.length === 1 &&
      clientDetails.data.financials.pendingPayment === 30000,
      'Interconnection: Client profile correctly displays linked design projects and pending balance'
    );

    // 16. Module 13: Programs & Events
    const eventRes = await fetch(`${BASE_URL}/events`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        title: 'Microservices & MongoDB Concurrency Summit',
        category: 'Conference',
        startDate: new Date(Date.now() + 15 * 86400000),
        endDate: new Date(Date.now() + 16 * 86400000),
      }),
    }).then(r => r.json());
    assert(eventRes.success && eventRes.data.title.includes('Summit'), 'Create program / event');

    // 17. Global Calendar consolidation
    const calRes = await fetch(`${BASE_URL}/calendar`, { headers }).then(r => r.json());
    assert(calRes.success && Array.isArray(calRes.data) && calRes.data.length >= 4, 'Central Calendar consolidates events across modules');

    // 18. Notifications System
    const notifRes = await fetch(`${BASE_URL}/notifications`, { headers }).then(r => r.json());
    assert(notifRes.success && Array.isArray(notifRes.data.notifications), 'Notifications endpoint returns user alerts');

    // 19. Analytics cross-module intelligence
    const analyticsRes = await fetch(`${BASE_URL}/analytics?timeRange=all`, { headers }).then(r => r.json());
    assert(analyticsRes.success && analyticsRes.data.financials.totalIncome === 25000, 'Cross-module analytics aggregation');

    // 20. Dashboard real-time stats
    const dashRes = await fetch(`${BASE_URL}/dashboard`, { headers }).then(r => r.json());
    assert(
      dashRes.success &&
      dashRes.data.stats.totalHabits === 1 &&
      dashRes.data.stats.totalTasks === 1,
      'Global Dashboard dynamically aggregates real database records'
    );

    console.log(`\n--- Test Results: ${passed} Passed, ${failed} Failed ---`);
    if (failed === 0) {
      console.log('ALL INTEGRATION TESTS PASSED PERFECTLY!');
    }
  } catch (err) {
    console.error('Fatal Test Exception:', err);
  }
};

runTests();

