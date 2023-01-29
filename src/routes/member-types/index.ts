import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { idParamSchema } from '../../utils/reusedSchemas';
import { changeMemberTypeBodySchema } from './schema';
import type { MemberTypeEntity } from '../../utils/DB/entities/DBMemberTypes';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.get('/', async function (request, reply): Promise<
    MemberTypeEntity[]
  > {
    return await this.db.memberTypes.findMany()
  });

  fastify.get(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<MemberTypeEntity> {
      const {id} = request.params;
      const fixedId = id.toLowerCase().trim(); 
      const memberTypes = ['basic', 'business']
      if (!memberTypes.includes(fixedId)) reply.notFound('Мember type not Found');
      return await this.db.memberTypes.findOne({key: 'id', equals: fixedId}) as MemberTypeEntity
    }
  );

  fastify.patch(
    '/:id',
    {
      schema: {
        body: changeMemberTypeBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<MemberTypeEntity> {
      const {id} = request.params;
      const {discount, monthPostsLimit} = request.body
      const fixedId = id.toLowerCase().trim(); 
      const memberTypes = ['basic', 'business']
      if (!memberTypes.includes(fixedId)) reply.badRequest('Мember type not Found');
      if(discount && (discount < 0 || discount > 100 )) reply.badRequest('Wrong discount input'); 
      if(monthPostsLimit && (monthPostsLimit < 0 )) reply.badRequest('Wrong MonthPostsLimit input'); 
      return await this.db.memberTypes.change(request.params.id, request.body)
    }
  );
};

export default plugin;
