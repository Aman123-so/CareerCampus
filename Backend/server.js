const express = require('express')
const cors = require('cors')
const mongoose= require('mongoose')
const Opportunity = require('./models/Opportunity')
require('dotenv').config()
const app = express()


const PORT = 5000

app.use(cors())
app.use(express.json())


mongoose.connect(process.env.MONGO_URI)
.then(()=>{
  console.log("MongoDB connected seccessfully")
})
.catch((error)=>{
  console.log("MongoDB connection error:", error)
})


app.get('/api/opportunities', async (req, res)=>{
  try {
    const opportunities= await Opportunity.find()
    res.json(opportunities)
  } catch (error) {
    res.status(500).json({
      message: "Error fetching opportunities"
    })
    
  }
})

// POST API 
app.post('/api/opportunities', async (req, res) => {
  try {

    const newOpportunity = await Opportunity.create(req.body)

    res.json({
      message: "Opportunity added successfully",
      data: newOpportunity
    })

  } catch (error) {

    res.status(500).json({
      message: "Error adding opportunity"
    })

  }
})
  


app.listen(PORT, () =>{
    console.log(`server running on port ${PORT}`)
})