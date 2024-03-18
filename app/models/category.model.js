const Category = () => {

}
const sqlCustom = require('../common/sqlQuery')


Category.get_all = async (result) => {
    try {
        const category = await sqlCustom.executeSql_SelectAll("category")
        const types = await sqlCustom.executeSql_SelectAll("types")
        const sizes_value = await sqlCustom.executeSql_SelectAll("sizes_value")


        const category_detailsList = category.map(item => {
            return {
                // ...item,
                id: item.id,
                name: item.name,
                detail: types.filter(type => type.category_id === item.id),
                sizesValue_id: item.sizesValue_id,
                sizes_value: sizes_value.filter(size => size.sizesType_id === item.sizesValue_id).map(i => i.value)
            }
        })


        result(category_detailsList)
    } catch (error) {
        result(null)
        throw error
    }
}

Category.create = async (data, result) => {
    try {
        await sqlCustom.executeSql_value(`INSERT INTO category SET ?`,data)
        result("Thêm mục lục sản phẩm thành công")
    } catch (error) {
        result(null)
        throw error
    }
}

Category.delete = async (id, result) => {
    try {
        await sqlCustom.executeSql(`DELETE FROM category WHERE id = ${id}`)
        result("Xóa mục lục sản phẩm thành công")
    } catch (error) {
        result(null)
        throw error
    }
}


Category.update = async (id,dataBody, result) => {
    try {
        await sqlCustom.executeSql_value(`
            UPDATE category
            SET ?
            WHERE id = ${id};
        `, dataBody)
        // await sqlCustom.executeSql_value(`UPDATE accounts SET ? WHERE accName='${id}'`, data)

        result("Cập nhật danh mục thành công")
       
       
    } catch (error) {
        result(null)
        throw error
    }
}

module.exports = Category