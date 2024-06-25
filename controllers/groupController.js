const asyncHandler = require('express-async-handler');
const Group = require('../models/Group');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

const newGrp = asyncHandler(async(req,res)=>{
  res.render('newGrp');
})

const createGroup = asyncHandler(async (req, res) => {
  const currentUser = res.locals.currentUser;
  const { newGrp } = req.body;
  
  const group = await Group.create({ name:newGrp, members: [currentUser._id] });
  console.log(newGrp,"group created successfully");
  res.redirect('/');
});



const enterGroup = asyncHandler(async (req,res)=>{
  const group = await Group.findById(req.params.id).populate('members', 'username') 
  .populate({
      path: 'messages.sender',
      select: 'username', 
  });
  const members = await Promise.all(group.members.map(async (memberId) => {
    return await User.findById(memberId);
  }));

  if (!group) {
    return res.status(404).json({ error: 'Group not found' });
}


const sortedMessages = group.messages.sort((a, b) => a.createdAt - b.createdAt);

  const currentUser = res.locals.currentUser;
  const token = generateToken(currentUser._id);
  if (group) {
     res.render('chat',{group,currentUser,members,sortedMessages,token});
  } else {
    res.status(404);
    throw new Error('Group not found');
}});


const joinGroup = asyncHandler(async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).send('Group not found');
    }

    const currentUser = res.locals.currentUser;

    if (!currentUser) {
      return res.status(401).send('User not authenticated');
    }


    const isMember = group.members.some(
      member => member.toString() === currentUser._id.toString()
    );

    if (isMember) {
     
      return res.redirect(`/api/groups/${group._id}/enter`);
    } 

   
    group.members.push(currentUser._id);
    await group.save();

   
    res.redirect(`/api/groups/${group._id}/enter`);

  } catch (error) {
    console.error('Error in joinGroup:', error);
    res.status(500).send('Internal Server Error');
  }
});



const leaveGroup = asyncHandler(async (req, res) => {
  const group = await Group.findById(req.params.id);
  const currentUser = res.locals.currentUser;
  if (!currentUser) {
    res.status(401);
    throw new Error('User not authorized');
  }
  if (group) {
    const currentUserIdStr = currentUser._id.toString();
    group.members = group.members.filter(
      (member) => member.toString() !== currentUserIdStr
    );
    await group.save();
  
    if (group.members.length === 0) {
     
      await group.deleteOne();
     console.log("Group deleted because of no users");
     res.redirect('/');
    } else {
      
      await group.save();
      res.redirect('/');
    }
  } else {
    res.status(404);
    throw new Error('Group not found');
  }
});

module.exports = { createGroup, joinGroup, leaveGroup,newGrp,enterGroup };
