
const multer = require("multer")
const path = require("path")
const fs = require('fs')


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public/imgs")
    },
    filename: (req, file, cb) => {
        // cb(null, file.originalname.split('.')[0] + "_" + Date.now() + path.extname(file.originalname))
        cb(null, file.originalname)
        
        // originalname
    }
})

const upload = multer({
    storage: storage
})



module.exports = (router) => {
    const shoesController = require("../controllers/shoes.controller")
    router.get("/shoes", shoesController.get_all_shoes)
    router.get("/shoes/brand/:br_id", shoesController.get_all_shoes)

    router.get("/shoes/:id", shoesController.find_shoes)
    router.get("/shoesList/:id", shoesController.find_list_shoes)
    router.get("/shoesList/", (_, res) => res.send([]));

    router.post("/shoes_add", shoesController.add_shoes)
    router.delete("/shoes_delete/:id", shoesController.delete_shoes)
    router.patch("/shoes_update/:id", shoesController.update_shoes)

    router.post("/import_prod", shoesController.im_export_prod)
    router.post("/modify_discount", shoesController.modify_discount)



    // FILE
    router.post("/upload_img", upload.single('file'), (req, res) => {
        // console.log(req.file)
    })

    router.post("/upload_imgs", upload.array('files'), (req, res) => {
        // console.log(req.files)
    })

    router.delete("/delete_img/:filename",shoesController.delete_img )

    router.post("/delete_imgs", shoesController.delete_imgs)



}