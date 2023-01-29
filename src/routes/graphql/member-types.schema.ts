const schema = `
type Query {
    findmany: MemberTypeEntity[]
    findmany(id: 'basic' | 'business')
}`

export default schema;