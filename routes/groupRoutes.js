const express = require('express');
const router = express.Router();
const {
  createGroup,
  joinGroup,
  leaveGroup,
  newGrp,
  enterGroup,
  deleteGroup,
} = require('../controllers/groupController');
const jwtAuthMiddleware = require('../middleware/jwtAuth.js');
const attachCurrentUser = require('../middleware/attachCurrentUser.js')

router.get('/',jwtAuthMiddleware,attachCurrentUser,newGrp);
router.post('/', jwtAuthMiddleware,attachCurrentUser, createGroup);
router.post('/:id', jwtAuthMiddleware,attachCurrentUser, joinGroup);
router.get('/:id/enter',jwtAuthMiddleware,attachCurrentUser, enterGroup);
router.delete('/:id', jwtAuthMiddleware,attachCurrentUser, leaveGroup);
router.post('/:id/delete', jwtAuthMiddleware,attachCurrentUser, deleteGroup);


module.exports = router;
