const sqlCustom = require('../common/sqlQuery')

const Comments = () => {}

Comments.getAll = async (_query, result) => {
    const {_productId, _page=0, _limit=0} = _query
    try {
        // console.log(_productId)
        let sql = `
            SELECT comments.id as comment_id, comments.detailOrder_id, client_id, value, detail_order.product_id, rating, DATE_FORMAT(date, '%d/%m/%Y %r') as date
            FROM comments 
                inner join detail_order on detail_order.id = comments.detailOrder_id
                inner join orders on detail_order.order_id = orders.id
           
        `
        _productId ?  sql += ` WHERE product_id = ${_productId}` : sql 
        sql += " ORDER BY comments.id DESC"

        sql = _page && _limit ? sql + ` LIMIT ${_limit} OFFSET ${_limit*(_page-1)}` : sql


        const comment = await sqlCustom.executeSql(sql )

        if(_productId) {
            let Comments_reply = await Promise.all(comment.map(async i => (
                {
                    ...i, 
                    reply: (await sqlCustom.executeSql(`SELECT *, DATE_FORMAT(date, '%d/%m/%Y %r') as date FROM replycomment WHERE comment_id='${i.comment_id}'`)).map(row => ({...row}))
                }
            )))
            result(Comments_reply)
            return 
        }

        result(comment)

    } catch (error) {
        result(null)
        throw error
    }

}

Comments.checkPermit = async (data, result) => {
    try {
        const {product_id, accName} = data
        const sqlFind_orderDetail = `
            SELECT detail_order.id as detailOrder_id, orders.client_id
            FROM detail_order
            INNER JOIN orders ON orders.id = detail_order.order_id
            WHERE detail_order.product_id = ${product_id} AND orders.client_id = '${accName}' AND isComment = 0
        `
        const dataFind = await sqlCustom.executeSql(sqlFind_orderDetail)
        console.log(dataFind)
        if(dataFind.length) {
            result({message:"Được phép cmt", status:true})
        }
        else {
            result({message:"Không được phép cmt", status:false})

        }
    } catch (error) {
        result({message:"Error", status:false})
        throw error
    }
  

}

Comments.submit = async (data, result) => {

    try {
        const {value, product_id, accName} = data
        if (!value || !product_id || !accName) {
            result({message:"Bạn gửi thiếu tham số, yêu cầu value, product_id, accName", status:false})
            return
        }

        const sqlFind_orderDetail = `
            SELECT detail_order.id as detailOrder_id, orders.client_id
            FROM detail_order
            INNER JOIN orders ON orders.id = detail_order.order_id
            WHERE detail_order.product_id = ${product_id} AND orders.client_id = '${accName}' AND isComment = 0
        `
    
        const dataFind = await sqlCustom.executeSql(sqlFind_orderDetail)

        console.log(data)
        console.log(dataFind)

        if(dataFind.length === 0) {
            result({message:"Bạn không được phép đánh giá vì chưa mua sản phẩm hoặc bạn đã đánh giá rồi", status:false})
            return 
        }
        else {
            const detail_order_find = (dataFind[0]).detailOrder_id
            await sqlCustom.executeSql(`UPDATE detail_order SET isComment = 1 WHERE id =${detail_order_find}`)
            await sqlCustom.executeSql_value("INSERT INTO comments SET ?", {value: value, detailOrder_id: detail_order_find})
            result({message:"Gửi bình luận thành công", status:true})
        }

    
    
    } catch (error) {
        result(null)
        throw error
    }
   
}

Comments.remove = async (detailOrder_id, result) => {
    try {
        const execDel = await sqlCustom.executeSql(`DELETE FROM comments WHERE detailOrder_id = ${detailOrder_id}`)
        if(execDel.affectedRows !== 0) {
            // Cập nhật lại trạng thái chưa comment trong detail_order
            await sqlCustom.executeSql(`UPDATE detail_order SET isComment = 0 WHERE id =${detailOrder_id}`)
            result({message:"Xóa bình luận thành công", status: true})
        }
        else if(execDel.affectedRows === 0) {
            result({message:"Xóa bình luận thất bại", status: false})
        }
        // console.log(execDel)
    } catch (error) {
        result(null)
        throw error
    }
    
}

Comments.update = async (id, dataBody, result) => {
    try {
        const execUpd = await sqlCustom.executeSql(`
            UPDATE comments
            SET value = '${dataBody.value}'
            WHERE id = ${id}
        `)
        if(execUpd.changedRows) {
            result({message:"Cập nhật bình luận thành công", status: true})
        }
        else {
            result({message:"Cập nhật bình luận thất bại", status: false})
        }

    } catch (error) {
        result(null)
        throw error
    }

      
}

Comments.reply = async (dataBody, result) => {
    const {comment_id, value} = dataBody
    try {
        const addReply = await sqlCustom.executeSql(`INSERT INTO replycomment SET value=${value} WHERE id = '${comment_id}'`)
        console.log(addReply)
    } catch (error) {
        result(null)
        throw error
    }
}

module.exports = Comments