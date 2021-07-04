import express from 'express';
import debug from 'debug';
import usersService from '../services/users.service';

const log: debug.IDebugger = debug('app:users-middleware');
class UsersMiddleware {
  async validateRequiredUserBodyFields(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) {
    if (req.body && req.body.email && req.body.password) {
      next();
    } else {
      res.status(400).send({
        error: `Missing required fields email and password`,
      })
    }
  }

  async validateSameEmailDoesntExist(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) {
    const user = await usersService.getUserByEmail(req.body.email);
    if (user) {
      res.status(400).send({ error: `User email already exist` });
    } else {
      next();
    }
  }

  async validateSameEmailBelongToSameUser(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) {
    if (res.locals.user._id === req.params.userId) {
      next();
    } else {
      res.status(400).send({ error: `Invalid email` });
    }
  }

  async userCantChangePermission(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) {
    if (
      'permissionFlags' in req.body &&
      req.body.permissionFlags !== res.locals.user.permissionFlags
    ) {
      res.status(400).json({ errors: ['User cannot change permission flags'] })
    } else {
      next();
    }
  }

  validatePatchEmail = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    if (req.body.email) {
      log('Validating email', req.body.email);
      this.validateSameEmailBelongToSameUser(req, res, next);
    } else {
      next();
    }
  }

  async validateUserExist(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) {
    const user = await usersService.readById(req.params.userId);
    if (user) {
      res.locals.user = user;
      next();
    } else {
      res.status(404).send({
        error: `User ${req.params.userId} not found`,
      })
    }
  }

  async extractUserId(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) {
    req.body.id = req.params.userId;
    next();
  }
}

export default new UsersMiddleware();