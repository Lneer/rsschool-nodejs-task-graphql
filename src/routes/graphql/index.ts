import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { graphqlBodySchema } from './schema';
import { graphql } from 'graphql';
import { GraphQLID, GraphQLInt, GraphQLList, GraphQLObjectType, GraphQLSchema, GraphQLString} from 'graphql/type';
import { CommonType, CommonTypes, PostType, ProfileType, UserType } from './types';
import { ProfileEntity } from '../../utils/DB/entities/DBProfiles';
import { UserEntity } from '../../utils/DB/entities/DBUsers';
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
          },
          comons: {
            type: CommonTypes,
            resolve: async (parant, args, ctx, info) => {
              const profiles: ProfileEntity[]  = await this.db.profiles.findMany()
              const posts = await this.db.posts.findMany()
              const memberTypes = await this.db.memberTypes.findMany()
              const users = await this.db.users.findMany()
              return {profiles, posts, memberTypes, users}
            }
          },
          comon: {
            type: CommonType,
            args: {id: {type: GraphQLID}},
            resolve: async (parant, args, ctx, info) => {
              const id = request.body.variables?.id as string
              const fixedId = id.toLowerCase().trim();

              const profile = await this.db.profiles.findOne({key:'id', equals: fixedId})
              const post = await this.db.posts.findOne({key:'id', equals: fixedId})
              const memberType = await this.db.memberTypes.findOne({key:'id', equals: fixedId}) as MemberTypeEntity
              const user = await this.db.users.findOne({key:'id', equals: fixedId})
              return {profile, post, memberType, user}
            }
          } 
        }) 
      });

      const RootMutetions = new GraphQLObjectType({
        name: 'Mutation',
        fields: () => ({
          createUser: {
            type: UserType,
            args: {
              firstName: {type: GraphQLString!},
              lastName: {type: GraphQLString!},
              email: {type: GraphQLString!},
            },
            resolve: async(parent, args,ctx,info) => {
              const firstName = request.body.variables?.firstName as string
              const lastName = request.body.variables?.lastName as string
              const email = request.body.variables?.email as string
              return await this.db.users.create({firstName,lastName,email}) as UserEntity
            }
          },
          createPost: {
            type: PostType,
            args: {
              title: {type: GraphQLString!},
              content: {type: GraphQLString!},
              userId: {type: GraphQLID!},
            },
            resolve: async(parent, args,ctx,info) => {
              const title = request.body.variables?.title as string
              const content = request.body.variables?.content as string
              const userId = request.body.variables?.userId as string
              return await this.db.posts.create({title,content,userId}) as PostEntity
            }
          },
          createProfile: {
            type: ProfileType,
            args: {
              avatar: {type: GraphQLString!},
              sex: {type: GraphQLString!},
              birthday: {type: GraphQLInt!},
              country: {type: GraphQLString!},
              street: {type: GraphQLString!},
              city: {type: GraphQLString!},
              userId: {type: GraphQLID!},
              memberTypeId: {type: GraphQLID!},
            },
            resolve: async(parent, args,ctx,info) => {
              const avatar = request.body.variables?.avatar as string
              const sex = request.body.variables?.sex as string
              const birthday = request.body.variables?.birthday as number
              const country = request.body.variables?.country as string
              const street = request.body.variables?.street as string
              const city = request.body.variables?.city as string
              const userId = request.body.variables?.userId as string
              const memberTypeId = request.body.variables?.memberTypeId as string
              return await this.db.profiles.create({avatar,sex,birthday,country,street,city,userId,memberTypeId  }) as ProfileEntity
            }
          },
        })
      })
      

      const schema = new GraphQLSchema({
        query: RootQuery,
        mutation:RootMutetions,
      });

      return await graphql( {schema, source:request.body.query!, contextValue: this.db});
    }
  );
};


export default plugin;
