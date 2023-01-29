import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { idParamSchema } from '../../utils/reusedSchemas';
import { createPostBodySchema, changePostBodySchema } from './schema';
import type { PostEntity } from '../../utils/DB/entities/DBPosts';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.get('/', async function (request, reply): Promise<PostEntity[]> {
    return await this.db.posts.findMany()
  });

  fastify.get(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<PostEntity> {
      const {id} = request.params;
      const fixedId = id.toLowerCase().trim();
      const findedPost = await this.db.posts.findOne({key:'id', equals:fixedId })
      if (findedPost === null) reply.notFound('Post not found');
      return findedPost as PostEntity
    }
  );

  fastify.post(
    '/',
    {
      schema: {
        body: createPostBodySchema,
      },
    },
    async function (request, reply): Promise<PostEntity> {
      return await this.db.posts.create({...request.body})
    }
  );

  fastify.delete(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<PostEntity | void> {
      const {id} = request.params;
      const fixedId = id.toLowerCase().trim();
      try {
        const deletedPost = await this.db.posts.delete(fixedId)
        return deletedPost
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
        body: changePostBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<PostEntity | undefined> {
      const {id} = request.params;
      const fixedId = id.toLowerCase().trim();
      try {
        const changedPost = await this.db.posts.change(fixedId, request.body)
        return changedPost
      } catch (error) {
        reply.badRequest()
      }
    }
  );
};

export default plugin;
