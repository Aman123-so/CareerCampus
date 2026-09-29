const express = require('express')
const cors = require('cors')
const mongoose= require('mongoose')
const Opportunity = require('./models/Opportunity')
const opportunityRoutes = require('./routes/opportunityRoutes')

require('dotenv').config()
const app = express()


const PORT = 5000

app.use(cors())
app.use(express.json())

app.use('/api/opportunities', opportunityRoutes)

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