const Sequelize = require('sequelize')
const DT = Sequelize.DataTypes


module.exports = {
    article: {
        slug: {
            type: DT.STRING(50),
            unique: {
                args: true,
                msg: 'is already taken.'
            },
            validate: {
                  isLowercase: true
            }
        },
        title: {
            type: DT.STRING(250)
        },
        description:{
            type: DT.STRING(500)
        },
        body: {
            type: DT.STRING(500)
        },
        tagList: {
            type: DT.STRING(500)
        }
    }
}