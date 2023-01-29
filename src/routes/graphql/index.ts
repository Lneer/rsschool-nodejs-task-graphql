import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { graphqlBodySchema } from './schema';
import { graphql } from 'graphql';
import { buildSchema } from 'graphql/utilities';
import { GraphQLInt, GraphQLObjectType, GraphQLSchema, GraphQLString } from 'graphql/type';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.post(
    '/',
    {
      schema: {
        body: graphqlBodySchema,
      },
    },
    async function (request, reply) {
      // const RootQuery = new GraphQLObjectType({
      //   name: 'query',
      //   fields: {
      //     users: {
      //       type: new GraphQLList(user),
      //       resolve () {
      //         return fastify.db.users.findMany();
      //       },
      //     },
      //     profiles: {
      //       type: new GraphQLList(profile),
      //       resolve() {
      //         return fastify.db.profiles.findMany();
      //       },
      //     },
      //     posts: {
      //       type: new GraphQLList(post),
      //       resolve() {
      //         return fastify.db.posts.findMany();
      //       },
      //     },
      //     memberTypes: {
      //       type: new GraphQLList(memberType),
      //       resolve() {
      //         return fastify.db.memberTypes.findMany();
      //       },
      //     },
      //   }}
      // ); 
      // const schema = new GraphQLSchema({ query: RootQuery })
      // console.log("schema");

      const MemberType = new GraphQLObjectType({
        name: 'Members',
        fields: {
          id: {type: GraphQLString},
          discount: {type: GraphQLInt},
          monthPostsLimit: {type: GraphQLInt}
        }
      })

      const RootQuery = new GraphQLObjectType({
        name: 'Query',
        fields:{
          memberType: {type: MemberType}
        },
      })

      const schema = new GraphQLSchema({
        query: RootQuery
      });
      // const schema = buildSchema(`
      //   type Query {
      //     memberType: ${MemberType}
      //     hello:String
      //   }
      // `)
      const rootValue = { 
        hello: () => 'hello world',
        findMany: () => this.db.memberTypes.findMany()   
    }
    //   const source = '{hello, memberType}'
      return await graphql( {schema, rootValue });
    }
  );
};

export default plugin;
