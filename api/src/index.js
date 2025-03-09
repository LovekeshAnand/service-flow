import dotenv from "dotenv"
import connectDB from "./config/dbConnection.js";  // If it's inside `templates`
import {app} from "./app.js"


dotenv.config({
    path: './templates/.env'
})

connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`Server is running at port : ${process.env.PORT}`);
    }) 

    app.on("error", (error) => {
        console.log("ERR: ", error);
        throw error
    })
})
.catch((err) => {
    console.log("MONGODB database connection failed!!", err);
}) 

export default function loveAuth() {
    console.log("LoveAuth package is working!");
}

