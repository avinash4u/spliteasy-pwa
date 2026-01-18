import { Group } from '../models/Group.js';
import { User } from '../models/User.js';
import { Expense } from '../models/Expense.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export const createGroup = asyncHandler(async (req, res) => {
  const { name, description, members, currency } = req.body;
  const currentUser = await User.findOne({ uid: req.user.uid });

  if (!currentUser) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  const groupMembers = [
    {
      user: currentUser._id,
      name: currentUser.name,
      email: currentUser.email,
      phone: currentUser.phone,
      photoURL: currentUser.photoURL,
      joinedAt: new Date()
    }
  ];

  if (members && members.length > 0) {
    for (const member of members) {
      let memberUser = await User.findOne({ email: member.email });
      
      if (!memberUser) {
        memberUser = await User.create({
          uid: `temp_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          email: member.email,
          name: member.name,
          phone: member.phone,
          photoURL: member.photoURL,
          emailVerified: false
        });
      }

      groupMembers.push({
        user: memberUser._id,
        name: member.name,
        email: member.email,
        phone: member.phone,
        photoURL: member.photoURL,
        joinedAt: new Date()
      });
    }
  }

  const group = await Group.create({
    name,
    description: description || '',
    createdBy: currentUser._id,
    members: groupMembers,
    currency: currency || 'INR'
  });

  await group.populate([
    { path: 'createdBy', select: 'name email photoURL' },
    { path: 'members.user', select: 'name email photoURL' }
  ]);

  res.status(201).json({
    success: true,
    message: 'Group created successfully',
    data: group
  });
});

export const getGroups = asyncHandler(async (req, res) => {
  const currentUser = await User.findOne({ uid: req.user.uid });

  if (!currentUser) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  const groups = await Group.find({
    'members.user': currentUser._id,
    isActive: true
  })
  .populate('createdBy', 'name email photoURL')
  .populate('members.user', 'name email photoURL')
  .sort({ updatedAt: -1 });

  res.status(200).json({
    success: true,
    data: groups
  });
});

export const getGroupById = asyncHandler(async (req, res) => {
  const { groupId } = req.params;
  const currentUser = await User.findOne({ uid: req.user.uid });

  if (!currentUser) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  const group = await Group.findOne({
    _id: groupId,
    'members.user': currentUser._id,
    isActive: true
  })
  .populate('createdBy', 'name email photoURL')
  .populate('members.user', 'name email photoURL');

  if (!group) {
    return res.status(404).json({
      success: false,
      message: 'Group not found or access denied'
    });
  }

  res.status(200).json({
    success: true,
    data: group
  });
});

export const addMember = asyncHandler(async (req, res) => {
  const { groupId } = req.params;
  const { members } = req.body;
  const currentUser = await User.findOne({ uid: req.user.uid });

  if (!currentUser) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  const group = await Group.findOne({
    _id: groupId,
    'members.user': currentUser._id,
    isActive: true
  });

  if (!group) {
    return res.status(404).json({
      success: false,
      message: 'Group not found or access denied'
    });
  }

  const newMembers = [];

  for (const member of members) {
    const existingMember = group.members.find(
      m => m.email === member.email
    );

    if (existingMember) {
      continue;
    }

    let memberUser = await User.findOne({ email: member.email });
    
    if (!memberUser) {
      memberUser = await User.create({
        uid: `temp_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        email: member.email,
        name: member.name,
        phone: member.phone,
        photoURL: member.photoURL,
        emailVerified: false
      });
    }

    newMembers.push({
      user: memberUser._id,
      name: member.name,
      email: member.email,
      phone: member.phone,
      photoURL: member.photoURL,
      joinedAt: new Date()
    });
  }

  group.members.push(...newMembers);
  await group.save();

  await group.populate([
    { path: 'createdBy', select: 'name email photoURL' },
    { path: 'members.user', select: 'name email photoURL' }
  ]);

  res.status(200).json({
    success: true,
    message: 'Members added successfully',
    data: group
  });
});

export const removeMember = asyncHandler(async (req, res) => {
  const { groupId, userId } = req.params;
  const currentUser = await User.findOne({ uid: req.user.uid });

  if (!currentUser) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  const group = await Group.findOne({
    _id: groupId,
    'members.user': currentUser._id,
    isActive: true
  });

  if (!group) {
    return res.status(404).json({
      success: false,
      message: 'Group not found or access denied'
    });
  }

  const memberToRemove = await User.findOne({ _id: userId });

  if (!memberToRemove) {
    return res.status(404).json({
      success: false,
      message: 'Member not found'
    });
  }

  if (group.createdBy.toString() === currentUser._id.toString() && 
      group.createdBy.toString() === userId) {
    return res.status(400).json({
      success: false,
      message: 'Group creator cannot be removed'
    });
  }

  group.members = group.members.filter(
    member => member.user.toString() !== userId
  );

  await group.save();

  await group.populate([
    { path: 'createdBy', select: 'name email photoURL' },
    { path: 'members.user', select: 'name email photoURL' }
  ]);

  res.status(200).json({
    success: true,
    message: 'Member removed successfully',
    data: group
  });
});

export const deleteGroup = asyncHandler(async (req, res) => {
  const { groupId } = req.params;
  const currentUser = await User.findOne({ uid: req.user.uid });

  if (!currentUser) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  const group = await Group.findOne({
    _id: groupId,
    createdBy: currentUser._id,
    isActive: true
  });

  if (!group) {
    return res.status(404).json({
      success: false,
      message: 'Group not found or access denied'
    });
  }

  group.isActive = false;
  await group.save();

  await Expense.updateMany(
    { group: groupId },
    { isActive: false }
  );

  res.status(200).json({
    success: true,
    message: 'Group deleted successfully'
  });
});
