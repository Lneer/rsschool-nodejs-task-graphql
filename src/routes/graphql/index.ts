import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { graphqlBodySchema } from './schema';
import { graphql } from 'graphql';
import { GraphQLID, GraphQLInt, GraphQLList, GraphQLObjectType, GraphQLSchema, GraphQLString } from 'graphql/type';
import { ProfileEntity } from '../../utils/DB/entities/DBProfiles';
import { PostEntity } from '../../utils/DB/entities/DBPosts';
import { MemberTypeEntity } from '../../utils/DB/entities/DBMemberTypes';

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

      const MemberTypesType = new GraphQLObjectType({
        name: 'MembersType',
        fields: ()=>  ({
          id: {type: GraphQLString},
          discount: {type: GraphQLInt},
          monthPostsLimit: {type: GraphQLInt}
        })
      })

      const PostType = new GraphQLObjectType({
        name: 'PostType',
        fields: ()=>  ({
          id: {type: GraphQLID},
          title: {type: GraphQLString},
          content: {type: GraphQLString},
          userId: {type: GraphQLID}
        })
      })

      const UserType = new GraphQLObjectType({
        name: 'UserType',
        fields: ()=>  ({
          id: {type: GraphQLID},
          firstName: {type: GraphQLString},
          lastName: {type: GraphQLString},
          email: {type: GraphQLString},
          profile: { 
            type: ProfileType, 
            resolve: async(parent, args, ctx, info) => {
              const profiles: ProfileEntity[] = await ctx.profiles.findMany()
              return profiles.find((profile) => profile.userId == parent.id)
            }
          },
          posts: { 
            type: new GraphQLList(PostType), 
            resolve: async(parent, args, ctx, info) => {
              const posts: PostEntity[] = await ctx.posts.findMany()
              return posts.filter((post) => post.userId == parent.id)
            }
          },
          membertype: {
            type: MemberTypesType,
            resolve: async (parent, args, ctx, info) => {
              const types: MemberTypeEntity[] = await ctx.memberTypes.findMany()
              const profiles: ProfileEntity[] = await ctx.profiles.findMany()
              const currentProfile = profiles.find((profile) => profile.userId == parent.id)
              return types.find((type) => type.id == currentProfile?.memberTypeId)
            }
          }
        })
      })

      const ProfileType = new GraphQLObjectType({
        name: 'ProfileType',
        fields: ()=>  ({
          id: {type: GraphQLID},
          avatar: {type: GraphQLString},
          sex: {type: GraphQLString},
          birthday: {type: GraphQLString},
          country: {type: GraphQLString},
          street: {type: GraphQLString},
          city: {type: GraphQLString},
          userId: {type: GraphQLID},
          memberTypeId: {type: GraphQLString},
        })
      })

      const RootQuery = new GraphQLObjectType({
        name: 'Query',
        fields: () =>({
          users: {
            type: new GraphQLList(UserType),
            resolve: async(parent, args,ctx,info) => await ctx.users.findMany()
          },
          user: {
            type: UserType,
            args: {id: {type: GraphQLID}},
            resolve: async(parent, args,ctx,info) => {
              const id = request.body.variables?.id as string
              const fixedId = id.toLowerCase().trim();
              const findedUser = await this.db.users.findOne({key:'id', equals:fixedId })
              if (findedUser === null) reply.notFound('User not found');
              return await ctx.users.findOne({key:'id', equals:request.body.variables?.id })}
          }
        }) 
      });
      

      const schema = new GraphQLSchema({
        query: RootQuery
      });

      return await graphql( {schema, source:request.body.query!, contextValue: this.db});
    }
  );
};


export default plugin;
