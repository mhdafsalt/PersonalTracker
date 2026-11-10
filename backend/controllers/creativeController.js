const CreativeProject = require('../models/CreativeProject');

// @desc    Get all creative projects
// @route   GET /api/creative
const getCreativeProjects = async (req, res, next) => {
  try {
    const projects = await CreativeProject.find({ user: req.user._id }).sort({ createdAt: -1 });

    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => ['Planning', 'In Progress', 'Review'].includes(p.status)).length;
    const completedProjects = projects.filter(p => p.status === 'Completed').length;
    const portfolioProjects = projects.filter(p => p.portfolioWorthy).length;

    res.json({
      success: true,
      data: {
        projects,
        stats: {
          totalProjects,
          activeProjects,
          completedProjects,
          portfolioProjects,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create creative project
const createCreativeProject = async (req, res, next) => {
  try {
    const { title, description, category, coverImage, startDate, deadline, skills, portfolioWorthy, achievements, links } = req.body;
    if (!title) return res.status(400).json({ success: false, message: 'Project title is required' });

    const project = await CreativeProject.create({
      user: req.user._id,
      title,
      description: description || '',
      category: category || 'Design',
      coverImage: coverImage || '',
      startDate: startDate || new Date(),
      deadline: deadline || null,
      skills: skills || [],
      portfolioWorthy: !!portfolioWorthy,
      achievements: achievements || [],
      links: links || [],
      status: 'In Progress',
      progress: 0,
    });

    res.status(201).json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
};

// @desc    Update project
const updateCreativeProject = async (req, res, next) => {
  try {
    const project = await CreativeProject.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true }
    );
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    res.json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete project
const deleteCreativeProject = async (req, res, next) => {
  try {
    await CreativeProject.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ success: true, message: 'Project deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCreativeProjects,
  createCreativeProject,
  updateCreativeProject,
  deleteCreativeProject,
};

