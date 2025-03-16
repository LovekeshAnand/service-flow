import multer from "multer";

const storage = multer.diskStorage(
    {
        destination: function (req, file, cb) {
            cb(null, "./public/temp")
        },
        filename: function (req, file, cb) {
            //   const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
            //   cb(null, file.fieldname + '-' + uniqueSuffix)
            cb(null, file.originalname)// we can edit the file name as we want to save 
        }
    }
)

export const upload = multer({ 
    storage,
})