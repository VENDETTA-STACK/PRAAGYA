const multer = require('multer')

var schoolLogoLocation = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/schoolLogo");
    },
    filename: function (req, file, cb) {
        cb(
            null,
            file.originalname + "_" + Date.now()
        );
    },
  });
  
var uploadSchoolLogo = multer({ storage: schoolLogoLocation });
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, 'public/' + file.fieldname + '/')
//   },
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + '-' + file.originalname)
//   }
// })

// const upload = multer({
//   storage: storage
// })

module.exports = {
    uploadSchoolLogo
}