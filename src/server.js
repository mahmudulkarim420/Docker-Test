import express from 'express'
const app = express();


app.get("/",(req, res)=>{
    res.json({
        message : "hello from Docker CI/CD",
        status : "running",
        code : 200
    })
});

app.listen(process.env.PORT,()=>{
    console.log(`server started on port ${process.env.PORT}`)
})