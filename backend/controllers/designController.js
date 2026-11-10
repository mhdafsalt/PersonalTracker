const { Client, DesignProject } = require('../models/DesignStudio');

// @desc    Get all clients and design studio overview
// @route   GET /api/design/clients
const getClients = async (req, res, next) => {
  try {
    const clients = await Client.find({ user: req.user._id }).sort({ createdAt: -1 });
    const allProjects = await DesignProject.find({ user: req.user._id });

    // Attach project count & total billings per client
    const enrichedClients = clients.map(client => {
      const clientProjects = allProjects.filter(p => p.client.toString() === client._id.toString());
      const totalBilled = clientProjects.reduce((sum, p) => sum + (p.pricing || 0), 0);
      const totalPaid = clientProjects.reduce((sum, p) => {
        if (p.paymentStatus === 'Paid') return sum + (p.pricing || 0);
        return sum + (p.advancePayment || 0);
      }, 0);
      const pendingPayment = clientProjects.reduce((sum, p) => {
        if (p.paymentStatus === 'Paid') return sum;
        return sum + (p.remainingPayment !== undefined ? p.remainingPayment : Math.max(0, (p.pricing || 0) - (p.advancePayment || 0)));
      }, 0);

      return {
        ...client.toObject(),
        projectsCount: clientProjects.length,
        totalBilled,
        totalPaid,
        pendingPayment,
      };
    });

    res.json({ success: true, data: enrichedClients });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single client with all associated design projects
// @route   GET /api/design/clients/:id
const getClientDetails = async (req, res, next) => {
  try {
    const client = await Client.findOne({ _id: req.params.id, user: req.user._id });
    if (!client) return res.status(404).json({ success: false, message: 'Client not found' });

    const projects = await DesignProject.find({ client: client._id, user: req.user._id }).sort({ createdAt: -1 });

    const totalBilled = projects.reduce((sum, p) => sum + (p.pricing || 0), 0);
    const totalPaid = projects.reduce((sum, p) => {
      if (p.paymentStatus === 'Paid') return sum + (p.pricing || 0);
      return sum + (p.advancePayment || 0);
    }, 0);
    const pendingPayment = projects.reduce((sum, p) => {
      if (p.paymentStatus === 'Paid') return sum;
      return sum + (p.remainingPayment !== undefined ? p.remainingPayment : Math.max(0, (p.pricing || 0) - (p.advancePayment || 0)));
    }, 0);

    res.json({
      success: true,
      data: {
        client,
        projects,
        financials: {
          totalBilled,
          totalPaid,
          pendingPayment,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create client
const createClient = async (req, res, next) => {
  try {
    const { name, company, brandName, email, phone, logo, address, socialLinks, requirements, notes, status } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Client name is required' });

    const client = await Client.create({
      user: req.user._id,
      name,
      company: company || '',
      brandName: brandName || '',
      email: email || '',
      phone: phone || '',
      logo: logo || '',
      address: address || '',
      socialLinks: socialLinks || {},
      requirements: requirements || '',
      notes: notes || '',
      status: status || 'Active',
    });

    res.status(201).json({ success: true, data: client });
  } catch (error) {
    next(error);
  }
};

// @desc    Update client
const updateClient = async (req, res, next) => {
  try {
    const client = await Client.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true }
    );
    if (!client) return res.status(404).json({ success: false, message: 'Client not found' });
    res.json({ success: true, data: client });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete client
const deleteClient = async (req, res, next) => {
  try {
    await Client.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    await DesignProject.deleteMany({ client: req.params.id, user: req.user._id });
    res.json({ success: true, message: 'Client and associated projects deleted' });
  } catch (error) {
    next(error);
  }
};

// ================= DESIGN PROJECTS =================

// @desc    Get all design projects & stats
// @route   GET /api/design/projects
const getDesignProjects = async (req, res, next) => {
  try {
    const { status, category, client } = req.query;
    let query = { user: req.user._id };

    if (status && status !== 'All') query.status = status;
    if (category && category !== 'All') query.category = category;
    if (client) query.client = client;

    const projects = await DesignProject.find(query)
      .populate('client', 'name company brandName logo')
      .sort({ createdAt: -1 });

    const allProjects = await DesignProject.find({ user: req.user._id });
    const totalProjects = allProjects.length;
    const inProgress = allProjects.filter(p => ['In Progress', 'Brief Received', 'Revision'].includes(p.status)).length;
    const awaitingApproval = allProjects.filter(p => p.status === 'Review').length;
    const completed = allProjects.filter(p => p.status === 'Completed' || p.status === 'Approved').length;

    const pendingPaymentsCount = allProjects.filter(p => p.paymentStatus !== 'Paid').length;

    res.json({
      success: true,
      data: {
        projects,
        stats: {
          totalProjects,
          inProgress,
          awaitingApproval,
          completed,
          pendingPaymentsCount,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create design project
const createDesignProject = async (req, res, next) => {
  try {
    const { client, title, description, category, deadline, brief, pricing, advancePayment } = req.body;
    if (!client || !title) {
      return res.status(400).json({ success: false, message: 'Client and title are required' });
    }

    const price = Number(pricing) || 0;
    const advance = Number(advancePayment) || 0;
    const remaining = Math.max(0, price - advance);
    const paymentStatus = advance >= price && price > 0 ? 'Paid' : advance > 0 ? 'Partial' : 'Pending';

    const project = await DesignProject.create({
      user: req.user._id,
      client,
      title,
      description: description || '',
      category: category || 'Brand Identity',
      deadline: deadline || null,
      brief: brief || '',
      pricing: price,
      advancePayment: advance,
      remainingPayment: remaining,
      paymentStatus,
      status: 'New',
    });

    const populated = await project.populate('client', 'name company brandName logo');
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

// @desc    Update design project
const updateDesignProject = async (req, res, next) => {
  try {
    const project = await DesignProject.findOne({ _id: req.params.id, user: req.user._id });
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    Object.assign(project, req.body);

    if (req.body.pricing !== undefined || req.body.advancePayment !== undefined || req.body.remainingPayment !== undefined) {
      const price = project.pricing || 0;
      const adv = project.advancePayment || 0;
      const rem = project.remainingPayment || 0;
      if (adv + rem >= price && price > 0) {
        project.paymentStatus = 'Paid';
      } else if (adv > 0) {
        project.paymentStatus = 'Partial';
      } else {
        project.paymentStatus = 'Pending';
      }
    }

    await project.save();
    const populated = await project.populate('client', 'name company brandName logo');
    res.json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete design project
const deleteDesignProject = async (req, res, next) => {
  try {
    await DesignProject.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ success: true, message: 'Design project deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getClients,
  getClientDetails,
  createClient,
  updateClient,
  deleteClient,
  getDesignProjects,
  createDesignProject,
  updateDesignProject,
  deleteDesignProject,
};

