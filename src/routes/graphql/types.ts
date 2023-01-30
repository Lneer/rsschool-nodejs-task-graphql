import { GraphQLID, GraphQLInt, GraphQLList, GraphQLObjectType, GraphQLString } from "graphql";
import { MemberTypeEntity } from "../../utils/DB/entities/DBMemberTypes";
import { ProfileEntity } from "../../utils/DB/entities/DBProfiles";
import { PostEntity } from "../../utils/DB/entities/DBPosts";

export const MemberTypesType = new GraphQLObjectType({
    name: 'MembersType',
    fields: ()=>  ({
      id: {type: GraphQLString},
      discount: {type: GraphQLInt},
      monthPostsLimit: {type: GraphQLInt}
    })
  })

  export const PostType = new GraphQLObjectType({
    name: 'PostType',
    fields: ()=>  ({
      id: {type: GraphQLID},
      title: {type: GraphQLString},
      content: {type: GraphQLString},
      userId: {type: GraphQLID}
    })
  })

  export const UserComonType = new GraphQLObjectType({
    name: 'UserComonType',
    fields: ()=>  ({
      id: {type: GraphQLID},
      firstName: {type: GraphQLString},
      lastName: {type: GraphQLString},
      email: {type: GraphQLString},
    })
  })

  export const UserType = new GraphQLObjectType({
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

  export const ProfileType = new GraphQLObjectType({
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

  export const CommonTypes = new GraphQLObjectType({
    name: 'CommonTypes',
    fields: () => ({
      profiles: {type:new GraphQLList(ProfileType)},
      posts: {type: new GraphQLList(PostType)},
      memberTypes: {type: new GraphQLList(MemberTypesType)},
      users: {type: new GraphQLList(UserComonType)}
    })
  })

  export const CommonType = new GraphQLObjectType({
    name: 'CommonType',
    fields: () => ({
      profile: {type: ProfileType},
      post: {type: PostType},
      memberType: {type: MemberTypesType},
      user: {type: UserComonType}
    })
  })