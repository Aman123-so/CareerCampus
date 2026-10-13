const express = require('express')
const cors = require('cors')
const mongoose= require('mongoose')
const Opportunity = require('./models/Opportunity')
const opportunityRoutes = require('./routes/opportunityRoutes')
const userRoutes = require('./routes/userRoutes')
require('dotenv').config()
const app = express()
const applicationRoutes = require('./routes/applicationRoutes')


const PORT = 5000

app.use(cors())
app.use(express.json())

app.use('/api/opportunities', opportunityRoutes)
app.use('/api/users', userRoutes)
app.use('/api/applications', applicationRoutes)

mongoose.connect(process.env.MONGO_URI)
.then(()=>{
  console.log("MongoDB connected seccessfully")
})
.catch((error)=>{
  console.log("MongoDB connection error:", error)
})





  


app.listen(PORT, () =>{
    console.log(`server running on port ${PORT}`)
})