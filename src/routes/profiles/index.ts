import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { idParamSchema } from '../../utils/reusedSchemas';
import { createProfileBodySchema, changeProfileBodySchema } from './schema';
import type { ProfileEntity } from '../../utils/DB/entities/DBProfiles';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.get('/', async function (request, reply): Promise<
    ProfileEntity[]
  > {
    return  await this.db.profiles.findMany()
  });

  fastify.get(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<ProfileEntity> {
      const profileById = await this.db.profiles.findOne({key:'id', equals: request.params.id})
      if(profileById === null) {
        reply.notFound()
      }  
      return profileById as ProfileEntity;
    }
  );

  fastify.post(
    '/',
    {
      schema: {
        body: createProfileBodySchema,
      },
    },
    async function (request, reply): Promise<ProfileEntity> {
      const {memberTypeId, userId} = request.body;
      const memberTypes = ['basic', 'business'];
      const existedProfiles = await this.db.profiles.findMany();
      if(!memberTypes.includes(memberTypeId)) {
        reply.badRequest('Incorrect memberType')
      }
      const findedUserProfile = existedProfiles.find((userProfile) => userProfile.userId === userId)
      if(findedUserProfile) {
        reply.badRequest('User profile already exist')
      }
      return await this.db.profiles.create({...request.body})
    }
  );

  fastify.delete(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<ProfileEntity | undefined> {
      const {id} = request.params;
      const fixedId = id.toLowerCase().trim();
      try {
        const deletedProfiles = await this.db.profiles.delete(fixedId)
        return deletedProfiles
      }
      catch (err) {
        reply.badRequest()
      }
    }
  );

  fastify.patch(
    '/:id',
    {
      schema: {
        body: changeProfileBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<ProfileEntity | undefined> {
      const {id} = request.params;
      const fixedId = id.toLowerCase().trim();
      try {
        const changedProfile = await this.db.profiles.change(fixedId, request.body)
        return changedProfile
      } catch (error) {
        reply.badRequest()
      }
    }
  );
};

export default plugin;
