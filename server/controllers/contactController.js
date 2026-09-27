const { Op } = require('sequelize');
const { ContactMessage } = require('../models');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const fs = require('fs');
const path = require('path');

// In-memory fallback in case database is in degraded/disconnected mode
const inMemoryContacts = [];

// 1. Submit a Contact Form Inquiry (Public)
const submitContactMessage = asyncHandler(async (req, res, _next) => {
  const { name, email, phone, subject, message } = req.body;

  if (!name || !email || !phone || !subject || !message) {
    throw new AppError('Please fill in all required fields (Name, Email, Phone, Subject, and Message).', 400);
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new AppError('Please provide a valid email address.', 400);
  }

  // Phone validation (accepts 10 digits)
  const cleanPhone = phone.replace(/\D/g, '');
  if (cleanPhone.length < 10) {
    throw new AppError('Please provide a valid 10-digit mobile number.', 400);
  }

  const imageUrl = req.compressedImageUrl || null;
  const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || null;

  let savedContact;
  try {
    savedContact = await ContactMessage.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: cleanPhone,
      subject: subject.trim(),
      message: message.trim(),
      image_url: imageUrl,
      status: 'new',
      ip_address: ipAddress,
    });
  } catch (dbErr) {
    console.warn('Database error while saving contact message. Using in-memory fallback:', dbErr.message);
    // Seamless fallback so the user is never stranded
    savedContact = {
      id: Date.now(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: cleanPhone,
      subject: subject.trim(),
      message: message.trim(),
      image_url: imageUrl,
      status: 'new',
      ip_address: ipAddress,
      created_at: new Date(),
      updated_at: new Date(),
    };
    inMemoryContacts.unshift(savedContact);
  }

  res.status(201).json({
    status: 'success',
    message: 'Your message has been received! Our support team will reply within 12-24 hours.',
    contact: {
      id: savedContact.id,
      name: savedContact.name,
      email: savedContact.email,
      phone: savedContact.phone,
      subject: savedContact.subject,
      imageUrl: savedContact.image_url,
      createdAt: savedContact.created_at || savedContact.createdAt,
    },
  });
});

// 2. Admin: Search and Filter Contact Messages
const getAdminContacts = asyncHandler(async (req, res, _next) => {
  const { search = '', status = '', page = 1, limit = 20 } = req.query;

  const offset = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);
  const pageLimit = parseInt(limit, 10);

  const whereClause = {};

  if (status && status !== 'all') {
    whereClause.status = status;
  }

  if (search && search.trim()) {
    const q = `%${search.trim()}%`;
    whereClause[Op.or] = [
      { name: { [Op.like]: q } },
      { email: { [Op.like]: q } },
      { phone: { [Op.like]: q } },
      { subject: { [Op.like]: q } },
      { message: { [Op.like]: q } },
    ];
  }

  try {
    const { count, rows } = await ContactMessage.findAndCountAll({
      where: whereClause,
      order: [['created_at', 'DESC']],
      limit: pageLimit,
      offset,
    });

    return res.status(200).json({
      status: 'success',
      total: count,
      page: parseInt(page, 10),
      totalPages: Math.ceil(count / pageLimit) || 1,
      contacts: rows,
    });
  } catch (err) {
    console.warn('Database error fetching contacts. Searching in-memory fallback list:', err.message);

    let filtered = [...inMemoryContacts];
    if (status && status !== 'all') {
      filtered = filtered.filter((c) => c.status === status);
    }
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.phone.includes(q) ||
          c.subject.toLowerCase().includes(q) ||
          c.message.toLowerCase().includes(q)
      );
    }

    const total = filtered.length;
    const paginated = filtered.slice(offset, offset + pageLimit);

    return res.status(200).json({
      status: 'success',
      total,
      page: parseInt(page, 10),
      totalPages: Math.ceil(total / pageLimit) || 1,
      contacts: paginated,
    });
  }
});

// 3. Admin: Update Contact Status
const updateContactStatus = asyncHandler(async (req, res, _next) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['new', 'in_progress', 'resolved', 'closed'];
  if (!validStatuses.includes(status)) {
    throw new AppError(`Invalid status. Allowed values: ${validStatuses.join(', ')}`, 400);
  }

  try {
    const contact = await ContactMessage.findByPk(id);
    if (!contact) {
      // Check in-memory
      const memContact = inMemoryContacts.find((c) => String(c.id) === String(id));
      if (!memContact) throw new AppError('Contact inquiry not found.', 404);
      memContact.status = status;
      return res.status(200).json({
        status: 'success',
        message: 'Status updated successfully.',
        contact: memContact,
      });
    }

    contact.status = status;
    await contact.save();

    return res.status(200).json({
      status: 'success',
      message: 'Status updated successfully.',
      contact,
    });
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError(err.message, 500);
  }
});

// 4. Admin: Delete Contact Message
const deleteContact = asyncHandler(async (req, res, _next) => {
  const { id } = req.params;

  try {
    const contact = await ContactMessage.findByPk(id);
    if (contact) {
      if (contact.image_url) {
        const filePath = path.join(__dirname, '..', contact.image_url);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      await contact.destroy();
    } else {
      const idx = inMemoryContacts.findIndex((c) => String(c.id) === String(id));
      if (idx !== -1) inMemoryContacts.splice(idx, 1);
    }

    res.status(200).json({
      status: 'success',
      message: 'Contact inquiry deleted successfully.',
    });
  } catch (err) {
    throw new AppError(err.message, 500);
  }
});

module.exports = {
  submitContactMessage,
  getAdminContacts,
  updateContactStatus,
  deleteContact,
};
