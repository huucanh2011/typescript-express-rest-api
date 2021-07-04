import usersDao from "../daos/users.dao";
import { CRUD } from "../../common/interfaces/crud.interface";
import { CreateUserDto } from "../dto/create.user.dto";
import { PutUserDto } from "../dto/put.user.dto";
import { PatchUserDto } from "../dto/patch.user.dto";

class UsersService implements CRUD {
  async list(limit: number, page: number) {
    return usersDao.getUsers(limit, page);
  }

  async readById(id: string) {
    return usersDao.getUserById(id);
  }

  async getUserByEmail(email: string) {
    return usersDao.getUserByEmail(email);
  }

  async getUserByEmailWithPassword(email: string) {
    return usersDao.getUserByEmailWithPassword(email);
  }

  async create(resource: CreateUserDto) {
    return usersDao.addUser(resource);
  }

  async putById(id: string, resource: PutUserDto) {
    return usersDao.updateUserById(id, resource);
  }

  async patchById(id: string, resource: PatchUserDto) {
    return usersDao.updateUserById(id, resource);
  }

  async deleteById(id: string) {
    return usersDao.removeUserById(id);
  }
}

export default new UsersService();
