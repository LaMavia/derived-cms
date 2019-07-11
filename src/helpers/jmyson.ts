import str from 'fast-json-stringify'
import { CollectionStats } from '../class/DbInterface'
import { Session } from '../components/sessionStorage'
import { User } from '../components/users'

const make_api_stringifier = (dataType: Partial<str.Schema>) =>
  str({
    title: 'APIResponseError',
    type: 'object',
    properties: {
      data: dataType,
      error: {
        type: 'string',
      },
      ok: {
        type: 'boolean',
      },
    },
  })

export const api_str_arr = (() => {
  const s = make_api_stringifier({
    type: "array",
    items: {
      type: "string"
    }
  })
  return (data: string[]) => s({
    data,
    error: '',
    ok: true
  })
})()

export const api_error = (() => {
  const s = make_api_stringifier({
    type: 'object',
    nullable: true,
  })
  return (doc: APIResponse) => s(doc)
})()

export const api_stats_res = (() => {
  const s = make_api_stringifier({
    type: 'object',
    properties: {
      count: {
        type: 'integer',
      },
      size: {
        type: 'array',
        items: [
          {
            type: 'number',
          },
          {
            type: 'string',
          },
        ],
      },
    },
  })
  return (doc: APIResponse<CollectionStats>) => s(doc)
})()

export const session = (() => {
  const s = str({
    title: 'session',
    type: 'object',
    properties: {
      maxAge: {
        type: 'integer',
      },
      jwt: {
        type: 'string',
      },
    },
  })

  return (session: Session) => s(session)
})()

export const user = () => {
  const s = str({
    title: 'user',
    type: 'array',
    items: [
      {
        type: 'object',
        properties: {
          _id: 'string',
          username: 'string',
          password: 'string',
          email: 'string',
          active: 'boolean',
        },
      },
    ],
  })
  return (users: User[]) => s(users)
}
