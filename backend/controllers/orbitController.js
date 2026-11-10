const { Contact, CallLog } = require('../models/Contact');

// @desc    Get contacts & call logs
// @route   GET /api/orbit
const getOrbitData = async (req, res, next) => {
  try {
    const { category, search, important } = req.query;
    let query = { user: req.user._id };

    if (category && category !== 'All') query.category = category;
    if (important === 'true') query.isImportant = true;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { organization: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const contacts = await Contact.find(query).sort({ isImportant: -1, name: 1 });
    const calls = await CallLog.find({ user: req.user._id })
      .populate('contact', 'name phone avatar category')
      .sort({ date: -1 });

    const totalContacts = await Contact.countDocuments({ user: req.user._id });
    const totalCalls = calls.length;
    const upcomingFollowUps = calls.filter(c => c.followUpStatus === 'Pending' && c.followUpDate && new Date(c.followUpDate) >= new Date()).length;

    res.json({
      success: true,
      data: {
        contacts,
        calls,
        stats: {
          totalContacts,
          totalCalls,
          upcomingFollowUps,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create contact
const createContact = async (req, res, next) => {
  try {
    const { name, phone, email, organization, jobTitle, address, category, isImportant, notes, avatar } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Contact name is required' });

    const contact = await Contact.create({
      user: req.user._id,
      name,
      phone: phone || '',
      email: email || '',
      organization: organization || '',
      jobTitle: jobTitle || '',
      address: address || '',
      category: category || 'Professional',
      isImportant: !!isImportant,
      notes: notes || '',
      avatar: avatar || '',
    });

    res.status(201).json({ success: true, data: contact });
  } catch (error) {
    next(error);
  }
};

// @desc    Update contact
const updateContact = async (req, res, next) => {
  try {
    const contact = await Contact.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true }
    );
    if (!contact) return res.status(404).json({ success: false, message: 'Contact not found' });
    res.json({ success: true, data: contact });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete contact
const deleteContact = async (req, res, next) => {
  try {
    await Contact.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    await CallLog.deleteMany({ contact: req.params.id, user: req.user._id });
    res.json({ success: true, message: 'Contact deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Log call manually
const logCall = async (req, res, next) => {
  try {
    const { contactId, durationMinutes, type, purpose, notes, followUpDate, followUpStatus } = req.body;
    if (!contactId) return res.status(400).json({ success: false, message: 'Contact ID is required' });

    const call = await CallLog.create({
      user: req.user._id,
      contact: contactId,
      durationMinutes: Number(durationMinutes) || 0,
      type: type || 'Outgoing',
      purpose: purpose || 'Call',
      notes: notes || '',
      date: new Date(),
      followUpDate: followUpDate || null,
      followUpStatus: followUpStatus || (followUpDate ? 'Pending' : 'None'),
    });

    // Update lastContactedDate on contact
    await Contact.findByIdAndUpdate(contactId, { lastContactedDate: new Date() });

    const populated = await call.populate('contact', 'name phone avatar category');
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

// @desc    Update call log / follow-up status
const updateCallLog = async (req, res, next) => {
  try {
    const call = await CallLog.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true }
    ).populate('contact', 'name phone avatar category');

    if (!call) return res.status(404).json({ success: false, message: 'Call log not found' });
    res.json({ success: true, data: call });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOrbitData,
  createContact,
  updateContact,
  deleteContact,
  logCall,
  updateCallLog,
};

