import { DbInterface } from './class/DbInterface'
import { UsersManager } from './components/users';
/**
 * This file is a sort of workaround the .d.ts import issue.
 * They don't allow for importing classes etc.
 */

export interface KoaState {}

export const rand = () =>
  (
    Math.floor(Math.random() * +new Date()) %
    Math.floor(Math.random() * 10 ** 6)
  ).toString(17)

export const secret: string = new Array(10)
  .fill(0)
  .reduce((acc, _) => (acc += rand()), '')

export interface KoaConext {
  db: DbInterface
  secret: string
  usersManager: UsersManager
}
