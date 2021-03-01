// load modules
const faker = require('faker')
let axios = require('axios')

// db configs
const dbUser = 'admin'
const dbPass = 'admin'
const dbName = 'aabd-carolina'
const dbUri = `http://localhost:5984/`
axios = axios.create({baseURL: dbUri})

// functions
const consoleLoading = async (callback, name) => {
    console.log(`${name}...`)
    console.time(name)
    await callback()
    console.timeEnd(name)
}

const authDB = async () => {
    try {
        const data = {name: dbUser, password: dbPass}
        const authResponse = await axios.post('_session', data)
        axios.defaults.headers.common['Cookie'] = authResponse.headers['set-cookie']
        return authResponse
    } catch(err) {
        console.error('authenticate database error:', err.message)
        throw err
    }
}

const dbPublicRoutes = async () => {
    try {
        const data = { admin: {roles: []}, members: {roles:[]} }
        const securityResponse = await axios.put(`${dbName}/_security`, data)
        return securityResponse
    } catch(err) {
        console.error('authenticate database error:', err.message)
        throw err
    }
}

const deleteDB = async () => {
    try {
        const deleteDbResponse = await axios.delete(dbName, {withCredentials: true})
        return deleteDbResponse
    } catch(err) {
        const status = err.response?.status || null
        if(status === 404) {
            console.error('Database don\'t exist')
            return
        }
        console.error('Delete database error:', err.message)
        throw err
    }
}

const createDB = async () => {
    try {
        const deleteDbResponse = await axios.put(dbName, {withCredentials: true})
        return deleteDbResponse
    } catch(err) {
        console.error('Create database error:', err.message)
        throw err
    }
}

const bulkDocuments = async () => {
    try {
        const documents = generateDocuments()
        const bulkResponse = await axios.post(`${dbName}/_bulk_docs`, { docs: documents }, {withCredentials: true})
    } catch(err) {
        console.error('Bulk documents error:', err.message)
        throw err        
    }
}

const enumGenerate = () => {
    const genders = [ 'female' , 'male' ];
    const users = new Array(10).fill({}).map(el => ({
        name: `${faker.name.firstName()} ${faker.name.lastName()}`,
        gender: faker.random.arrayElement(genders)
    }))
    const domain = ['economy', 'education', 'nature', 'politics', 'health']
    const location = ['California', 'Florida', 'New York', 'Texas', 'Washington']

    return {users, location, domain}
}

const generateDocuments = () => {
    const enums = enumGenerate()
    const percentage = (Math.random() * 100).toFixed(2)
    
    return new Array(50).fill({}).map((el, i) => {
        const datePost = faker.date.between('2020-01-01', '2020-12-31')
        const arrayArgs = new Array(parseInt(Math.random() * 10) % 5).fill(null)
        const author = faker.random.arrayElement(enums.users)
        const others = enums.users.filter(el => author.name !== el.name)
        return {
            news: {
                title: faker.lorem.sentence(),
                text: faker.lorem.paragraphs(),
                domain: faker.random.arrayElement(enums.domain),
                location: faker.random.arrayElement(enums.location),
                created_at: datePost
            },
            author: author,
            against_arguments: arrayArgs.map(el => ({
                author: faker.random.arrayElement(others),
                description: faker.lorem.paragraph(),
                reference: faker.internet.url(),
                created_at: faker.date.between(datePost, '2020-12-31')
            })),
            vote_percentage: {
                positive: +percentage,
                negative: +(100 - percentage).toFixed(2)
            }
        }
    })
}

const migrate = async () => {
    try {
        await consoleLoading(authDB, 'Authentication')
        await consoleLoading(deleteDB, 'Delete Database')
        await consoleLoading(createDB, 'Create Database')        
        await consoleLoading(bulkDocuments, 'Bulk Documents')        
        await consoleLoading(dbPublicRoutes, 'Setting Public Routes')        
    } catch(err) {
        console.error('Migrate error:', err.message)
        throw err
    }
}

module.exports = migrate