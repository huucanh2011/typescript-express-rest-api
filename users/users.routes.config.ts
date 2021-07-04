
import express from 'express';
import { body } from 'express-validator';
import jwtMiddleware from '../auth/middleware/jwt.middleware';
import { CommonRoutesConfig } from '../common/common.routes.config';
import BodyValidationMiddleware from '../common/middleware/body.validation.middleware';
import permissionMiddleware from '../common/middleware/common.permission.middleware';
import { PermissionFlag } from '../common/middleware/common.permissionflag.enum';
import usersController from './controllers/users.controller';
import usersMiddleware from './middleware/users.middleware';

export class UsersRoutes extends CommonRoutesConfig {
  constructor(app: express.Application) {
    super(app, 'UsersRoutes');
  }

  configureRoutes(): express.Application {
    this.app.route(`/users`)
      .get(
        jwtMiddleware.validJWTNeeded,
        permissionMiddleware.permissionFlagRequired(PermissionFlag.ADMIN_PERMISSION),
        usersController.listUsers
      )
      .post(
        body('email').isEmail(),
        body('password').isLength({ min: 5 }).withMessage('Must include password (5+ character)'),
        BodyValidationMiddleware.verifyBodyFieldsErrors,
        usersMiddleware.validateSameEmailDoesntExist,
        usersController.createUser,
      );
    
    this.app.param(`userId`, usersMiddleware.extractUserId);
    this.app.route(`/users/:userId`)
      .all(
        usersMiddleware.validateUserExist,
        jwtMiddleware.validJWTNeeded,
        permissionMiddleware.onlySameUserOrAdminCanDoThisAction
      )
      .get(usersController.getUserById)
      .delete(usersController.removeUser);
    
    this.app.put(`/users/:userId`, [
      body('email').isEmail(),
      body('password').isLength({ min: 5 }).withMessage('Must include password (5+ character)'),
      body('firstName').isString(),
      body('lastName').isString(),
      body('permissionFlags').isInt(),
      BodyValidationMiddleware.verifyBodyFieldsErrors,
      usersMiddleware.validateSameEmailBelongToSameUser,
      usersMiddleware.userCantChangePermission,
      permissionMiddleware.permissionFlagRequired(PermissionFlag.PAID_PERMISSION),
      usersController.put,
    ]);

    this.app.patch(`/users/:userId`, [
      body('email').isEmail().optional(),
      body('password').isLength({ min: 5 }).withMessage('Must include password (5+ character)').optional(),
      body('firstName').isString().optional(),
      body('lastName').isString().optional(),
      body('permissionFlags').isInt().optional(),
      BodyValidationMiddleware.verifyBodyFieldsErrors,
      usersMiddleware.validatePatchEmail,
      usersMiddleware.userCantChangePermission,
      permissionMiddleware.permissionFlagRequired(PermissionFlag.PAID_PERMISSION),
      usersController.patch,
    ]);

    this.app.put(`/users/:userId/permissionFlags/:permissionFlags`, [
      jwtMiddleware.validJWTNeeded,
      permissionMiddleware.onlySameUserOrAdminCanDoThisAction,
      permissionMiddleware.permissionFlagRequired(PermissionFlag.FREE_PERMISSION),
      usersController.updatePermissionFlags
    ])

    return this.app;
  }
}