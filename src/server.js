import express from 'express'
const app = express();


app.get("/",(req, res)=>{
    res.json({
        message : "hello from docker",
        status : "running",
        code : 200
    })
);

app.listen(3000,()=>{
    console.log('server started on port 3000')
})