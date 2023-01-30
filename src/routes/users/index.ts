import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { idParamSchema } from '../../utils/reusedSchemas';
import {
  createUserBodySchema,
  changeUserBodySchema,
  subscribeBodySchema,
} from './schemas';
import type { UserEntity } from '../../utils/DB/entities/DBUsers';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.get('/', async function (request, reply): Promise<UserEntity[]> {
    return await this.db.users.findMany();
  });

  fastify.get(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      const {id} = request.params;
      const fixedId = id.toLowerCase().trim();
      const findedUser = await this.db.users.findOne({key:'id', equals:fixedId })
      if (findedUser === null) reply.notFound('User not found');
      return findedUser as UserEntity
    }
  );

  fastify.post(
    '/',
    {
      schema: {
        body: createUserBodySchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      const {firstName, lastName , email} = request.body; 
      return await this.db.users.create({firstName,lastName,email})
    }
  );

  fastify.delete(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity | void> {
      const {id} = request.params;
      const fixedId = id.toLowerCase().trim();
      try {
        const deleteduser = await this.db.users.delete(fixedId)
        const users = await this.db.users.findMany();
        const posts = await this.db.posts.findMany();
        const profiles = await this.db.profiles.findMany();
        users.forEach(async(user) => {
          if (user.subscribedToUserIds.includes(deleteduser.id)) {
            const idx = user.subscribedToUserIds.findIndex((el) => el === deleteduser.id)
             user.subscribedToUserIds.splice(idx,1)
             await this.db.users.change(user.id, user)
          }
        })
        posts.forEach(async (post) => {
          if(post.userId === deleteduser.id){
            await this.db.posts.delete(post.id)
          }
        })
        profiles.forEach(async (profile) => {
          if(profile.userId === deleteduser.id){
            await this.db.profiles.delete(profile.id)
          }
        })
        return deleteduser
      } catch (error) {
        reply.badRequest()
      }
      
    }
  );

  fastify.post(
    '/:id/subscribeTo',
    {
      schema: {
        body: subscribeBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      const {id} = request.params;
      const userId = request.body.userId
      const currentUser = await this.db.users.findOne({key:'id', equals: userId})
      currentUser?.subscribedToUserIds.push(id)
      return await  this.db.users.change(userId, currentUser as UserEntity)
    }
  );

  fastify.post(
    '/:id/unsubscribeFrom',
    {
      schema: {
        body: subscribeBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity | void> {
      const {id} = request.params;
      const userId = request.body.userId
      const currentUser = await this.db.users.findOne({key:'id', equals: userId})
      const idx = currentUser?.subscribedToUserIds.findIndex((el) =>  el === id)
      if (idx !== undefined && idx >= 0 ) {
        currentUser?.subscribedToUserIds.splice(idx,1)
        return this.db.users.change(currentUser!.id, currentUser as UserEntity) 
      } else {
        reply.badRequest()
      }
    }
  );

  fastify.patch(
    '/:id',
    {
      schema: {
        body: changeUserBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity | void>  {
      const {id} = request.params;
      const fixedId = id.toLowerCase().trim();
      try {
        const chandedUser = await this.db.users.change(fixedId, {...request.body})
        return chandedUser
      } catch (error) {
        reply.badRequest()
      }
     
    }
  );
};

export default plugin;
